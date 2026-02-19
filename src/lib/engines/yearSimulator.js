// ============================================================================
// Year Simulator — Single-year calculation step
// This is the core math extracted from generateFinancialData.
// All engines (Classic, Smart Adaptive, Path Explorer) use this same function.
// ============================================================================

import { getEffectiveMonthlyRate } from '../financialCalculations';

/**
 * Simulate a single year of the Smith Manoeuvre.
 *
 * @param {object} state  – mutable state carried from prior year
 * @param {object} config – immutable per-simulation config
 * @param {object} yearAllocation – how cash is allocated this year
 *   { rrspContrib, tfsaFromHeloc, tfsaFromSavings, initialKick (yr1 only) }
 * @param {object} rateOverrides – scenario rate overrides for this year
 * @returns {object} { yearRow, nextState }
 */
export function simulateYear(state, config, yearAllocation, rateOverrides = {}) {
  const year = state.year + 1;
  const isYear1 = year === 1;

  // ── Unpack immutable config ───────────────────────────────────
  const {
    initialMortgage,
    amortYears,
    mortgageType = 'fixed',
    taxRate,        // decimal
    retirementTaxRate = 20, // percentage
    totalLimit,
    baseMortgageRatePct,
    baseHelocRatePct,
    baseAnnualReturnPct,
    baseGrowthRatePct,
    baseDividendYieldPct,
    baseInflationRatePct,
    prepaymentLimitPct = 100, // % of original mortgage
  } = config;

  // ── Apply rate overrides (scenario stress) ───────────────────
  const yrMortgageRatePct = rateOverrides.mortgageRate ?? baseMortgageRatePct;
  const yrHelocRatePct = rateOverrides.helocRate ?? baseHelocRatePct;
  const yrAnnualReturnPct = rateOverrides.annualReturn ?? baseAnnualReturnPct;
  const yrGrowthRatePct = rateOverrides.growthRate ?? baseGrowthRatePct;
  const yrDividendYieldPct = rateOverrides.dividendYield ?? baseDividendYieldPct;
  const yrInflationRatePct = rateOverrides.inflationRate ?? baseInflationRatePct;

  const yrHelocRate = yrHelocRatePct / 100;
  const yrAnnualReturn = yrAnnualReturnPct / 100;
  const yrGrowthRate = yrGrowthRatePct / 100;
  const yrDividendYield = yrDividendYieldPct / 100;
  const yrInflationRate = yrInflationRatePct / 100;

  // Mortgage payment calculation
  const yrEffectiveMonthly = getEffectiveMonthlyRate(yrMortgageRatePct, mortgageType);
  const n = amortYears * 12;
  const power = Math.pow(1 + yrEffectiveMonthly, n);
  const monthlyPayment = initialMortgage * yrEffectiveMonthly * power / (power - 1);
  const yrAnnualPayment = monthlyPayment * 12;
  const yrEffectiveAnnualMortgageRate = Math.pow(1 + yrEffectiveMonthly, 12) - 1;

  // ── Unpack mutable state ──────────────────────────────────────
  let {
    currentMortgage,
    currentHeloc,
    currentTfsa,
    currentRrsp,
    currentNonReg,
    currentDeductible,
    cumulativeNonDeductibleHeloc,
    currentACB,
    cumulativeDeductibleInterest,
    helocAvailable,
  } = state;

  // ── Beginning-of-year snapshot ────────────────────────────────
  const beginning = {
    mortgage: currentMortgage,
    heloc: currentHeloc,
    tfsa: currentTfsa,
    rrsp: currentRrsp,
    nonReg: currentNonReg,
    deductible: currentDeductible,
    portfolio: currentTfsa + currentRrsp + currentNonReg,
  };

  // ── Unpack year allocation ────────────────────────────────────
  const {
    rrspContrib = 0,
    tfsaFromHeloc = 0,
    tfsaFromSavings = 0,
    initialKick = 0,       // Year 1 only: total HELOC draw
    rrspFromHeloc = 0,
    rrspFromSavings = 0,
    helocPaydown = 0,      // Pay down non-deductible HELOC debt
  } = yearAllocation;

  // ── Apply HELOC non-deductible paydown ────────────────────────
  if (helocPaydown > 0 && currentHeloc > 0) {
    const actualPaydown = Math.min(helocPaydown, currentHeloc, cumulativeNonDeductibleHeloc);
    currentHeloc -= actualPaydown;
    cumulativeNonDeductibleHeloc -= actualPaydown;
    helocAvailable += actualPaydown;
  }

  const tfsaContrib = tfsaFromHeloc + tfsaFromSavings;
  const nonDeductibleFromP = rrspFromSavings + tfsaFromSavings;

  // ── Year 1 HELOC deployment ───────────────────────────────────
  const nonDeductibleKick = tfsaFromHeloc + rrspFromHeloc;
  const deductibleKick = Math.max(0, initialKick - nonDeductibleKick);

  // Clamp initialKick to available HELOC room
  const actualInitialKick = Math.min(initialKick, helocAvailable);
  const actualDeductibleKick = Math.max(0, actualInitialKick - Math.min(nonDeductibleKick, actualInitialKick));
  const actualNonDeductibleKick = actualInitialKick - actualDeductibleKick;

  let initialNonReg = 0;
  if (actualInitialKick > 0 && isYear1) {
    currentDeductible += actualDeductibleKick;
    currentNonReg += actualDeductibleKick;
    currentHeloc += actualInitialKick;
    helocAvailable -= actualInitialKick;
    cumulativeNonDeductibleHeloc += actualNonDeductibleKick;
    initialNonReg = actualDeductibleKick;
  }

  // ── Standard mortgage principal ───────────────────────────────
  const standardPrincipal = Math.max(0, yrAnnualPayment - currentMortgage * yrEffectiveAnnualMortgageRate);

  // ── Dividends from non-reg ────────────────────────────────────
  const dividendsThisYear = Math.round(yrDividendYield * currentNonReg);

  // ── Smith Manoeuvre P formula ─────────────────────────────────
  let P = standardPrincipal;
  let a = 0, b = 0, left = 1, rightAdd = 0, constant = standardPrincipal;

  const hasOngoingActivity = actualInitialKick > 0 || rrspFromHeloc > 0 || currentDeductible > 0 || standardPrincipal > 0;

  if (hasOngoingActivity) {
    a = yrDividendYield / 2;
    b = taxRate * yrHelocRate / 2;
    left = 1 - a - b;
    rightAdd = a + b;
    constant = standardPrincipal
      + yrDividendYield * currentNonReg
      + rrspContrib * taxRate
      + taxRate * yrHelocRate * currentDeductible;
    P = (constant + rightAdd * nonDeductibleFromP) / left;
  }

  // Clamp P to mortgage balance and prepayment limit
  // Prepayment limit only applies to the SM BOOST (lump sum), not standard mortgage payment
  // Standard principal from regular payments is always allowed
  const lumpSumMax = (prepaymentLimitPct / 100) * initialMortgage;
  const totalPrepaymentMax = standardPrincipal + lumpSumMax;
  P = Math.min(P, currentMortgage, totalPrepaymentMax);
  if (P < 0) P = 0;

  // Also clamp to available HELOC room for re-borrowing
  // (the portion that gets re-borrowed into HELOC must have room)
  // In a readvanceable mortgage, paying down P frees up HELOC room simultaneously.
  // So effective HELOC room = current room + room freed by this year's principal paydown.
  const roomFreedByPaydown = Math.min(P, currentMortgage);
  const effectiveHelocAvailable = helocAvailable + roomFreedByPaydown;
  const additionalDeductibleRaw = Math.max(0, P - nonDeductibleFromP);
  const additionalDeductible = Math.min(additionalDeductibleRaw, effectiveHelocAvailable);
  // Recalculate P if we had to reduce additional deductible due to HELOC room
  if (additionalDeductible < additionalDeductibleRaw) {
    P = additionalDeductible + nonDeductibleFromP;
    P = Math.min(P, currentMortgage);
  }

  const averageDeductible = currentDeductible + additionalDeductible / 2;

  // ── HELOC Interest ────────────────────────────────────────────
  let deductibleInterest = 0;
  let nonDeductibleInterest = 0;
  let helocInterest = 0;

  const projectedHeloc = currentHeloc + P;

  if (projectedHeloc > 0 || averageDeductible > 0) {
    deductibleInterest = yrHelocRate * averageDeductible;
    nonDeductibleInterest = Math.max(0, yrHelocRate * Math.min(cumulativeNonDeductibleHeloc, projectedHeloc));
    helocInterest = deductibleInterest + nonDeductibleInterest;
  }

  // ── Tax refund ────────────────────────────────────────────────
  const refund = rrspContrib * taxRate + deductibleInterest * taxRate;

  // ── Investment growth ─────────────────────────────────────────
  const averageNonReg = currentNonReg + additionalDeductible / 2;
  const tfsaValue = (currentTfsa + tfsaContrib) * (1 + yrAnnualReturn);
  const rrspValue = (currentRrsp + rrspContrib) * (1 + yrAnnualReturn);
  const nonRegValue = currentNonReg * (1 + yrGrowthRate) + additionalDeductible * (1 + yrGrowthRate / 2);
  const portfolioValue = tfsaValue + rrspValue + nonRegValue;

  // RRSP after-tax
  const rrspAfterTax = rrspValue * (1 - retirementTaxRate / 100);

  // Inflation-adjusted
  const inflationFactor = yrInflationRate > 0 ? Math.pow(1 + yrInflationRate, year) : 1;
  const inflationAdjustedPortfolio = portfolioValue / inflationFactor;

  // ── Percent changes ───────────────────────────────────────────
  const tfsaPct = beginning.tfsa + tfsaContrib > 0 ? ((tfsaValue - beginning.tfsa - tfsaContrib) / (beginning.tfsa + tfsaContrib)) * 100 : 0;
  const rrspPct = beginning.rrsp + rrspContrib > 0 ? ((rrspValue - beginning.rrsp - rrspContrib) / (beginning.rrsp + rrspContrib)) * 100 : 0;
  const nonRegPct = beginning.nonReg + initialNonReg + additionalDeductible > 0 ? ((nonRegValue - beginning.nonReg - initialNonReg - additionalDeductible) / (beginning.nonReg + initialNonReg + additionalDeductible / 2)) * 100 : 0;
  const portfolioPct = beginning.portfolio > 0 ? ((portfolioValue - beginning.portfolio - (tfsaContrib + rrspContrib + initialNonReg + additionalDeductible)) / beginning.portfolio) * 100 : 0;
  const mortgageDecreasePct = beginning.mortgage > 0 ? (P / beginning.mortgage * 100) : 0;
  const helocIncreasePct = beginning.heloc > 0 ? (P / beginning.heloc * 100) : 0;

  // ── CRA Audit Trail ───────────────────────────────────────────
  if (isYear1) currentACB += actualDeductibleKick;
  currentACB += additionalDeductible;
  currentACB += dividendsThisYear;
  cumulativeDeductibleInterest += deductibleInterest;

  // ── Update state for next year ────────────────────────────────
  currentTfsa = tfsaValue;
  currentRrsp = rrspValue;
  currentNonReg = nonRegValue;

  if (additionalDeductible > 0) {
    currentDeductible += additionalDeductible;
  }
  currentHeloc += P;
  helocAvailable -= P; // P is re-borrowed from HELOC
  // As mortgage is paid down, HELOC room increases (readvanceable)
  helocAvailable += P; // net: room freed by principal = room used by re-borrow → wash
  // But ensure we don't exceed total limit
  if (currentHeloc > totalLimit) {
    helocAvailable += (currentHeloc - totalLimit);
    currentHeloc = totalLimit;
  }
  if (helocAvailable < 0) helocAvailable = 0;

  // Track non-deductible HELOC usage for ongoing years
  if (!isYear1) {
    const nonDeductiblePortionOfP = Math.min(P, nonDeductibleFromP);
    cumulativeNonDeductibleHeloc += nonDeductiblePortionOfP;
  }

  currentMortgage -= P;
  if (currentMortgage < 0) currentMortgage = 0;

  // ── Build year row ────────────────────────────────────────────
  const yearRow = {
    year,
    mortgageBalance: Math.round(currentMortgage),
    helocBalance: Math.round(currentHeloc),
    helocInterest: Math.round(helocInterest),
    portfolioValue: Math.round(portfolioValue),
    tfsaValue: Math.round(tfsaValue),
    rrspValue: Math.round(rrspValue),
    rrspAfterTax: Math.round(rrspAfterTax),
    nonRegValue: Math.round(nonRegValue),
    taxRefund: Math.round(refund),
    principalBuilt: Math.round(P),
    inflationAdjustedPortfolio: Math.round(inflationAdjustedPortfolio),
    // For Smart Adaptive: record where cash went
    allocation: yearAllocation,
    details: {
      beginning,
      assumptions: {
        mortgageRate: yrMortgageRatePct,
        mortgageType,
        helocRate: yrHelocRatePct,
        taxRate: taxRate * 100,
        annualReturn: yrAnnualReturnPct,
        growthRate: yrGrowthRatePct,
        dividendYield: yrDividendYieldPct,
        rrspContrib,
        tfsaContrib,
        initialNonReg,
        retirementTaxRate,
      },
      calculations: {
        standardPrincipal: Math.round(standardPrincipal),
        a: a.toFixed(4),
        b: b.toFixed(4),
        left: left.toFixed(4),
        rightAdd: rightAdd.toFixed(4),
        constant: Math.round(constant),
        P: Math.round(P),
        additionalDeductible: Math.round(additionalDeductible),
        averageDeductible: Math.round(averageDeductible),
        deductibleInterest: Math.round(deductibleInterest),
        refund: Math.round(refund),
        averageNonReg: Math.round(averageNonReg),
        helocInterest: Math.round(helocInterest),
        dividendsThisYear,
      },
      end: {
        mortgage: currentMortgage,
        heloc: currentHeloc,
        tfsa: tfsaValue,
        rrsp: rrspValue,
        nonReg: nonRegValue,
        portfolio: portfolioValue,
      },
      percentChanges: {
        tfsa: tfsaPct.toFixed(2),
        rrsp: rrspPct.toFixed(2),
        nonReg: nonRegPct.toFixed(2),
        portfolio: portfolioPct.toFixed(2),
        mortgageDecrease: mortgageDecreasePct.toFixed(2),
        helocIncrease: helocIncreasePct.toFixed(2),
      },
      craAudit: {
        openingACB: Math.round(currentACB - additionalDeductible - dividendsThisYear - (isYear1 ? actualDeductibleKick : 0)),
        initialInvestment: Math.round(isYear1 ? actualDeductibleKick : 0),
        newInvestments: Math.round(additionalDeductible),
        reinvestedDividends: Math.round(dividendsThisYear),
        closingACB: Math.round(currentACB),
        marketValue: Math.round(nonRegValue),
        unrealizedGain: Math.round(nonRegValue - currentACB),
        potentialCapGainsTax: Math.round(Math.max(0, nonRegValue - currentACB) * 0.5 * taxRate),
        deductibleInterest: Math.round(deductibleInterest),
        nonDeductibleInterest: Math.round(nonDeductibleInterest),
        cumulativeDeductibleInterest: Math.round(cumulativeDeductibleInterest),
        rrspDeduction: Math.round(rrspContrib),
        totalDeductions: Math.round(deductibleInterest + rrspContrib),
        estimatedRefund: Math.round(refund),
        dividendIncome: Math.round(dividendsThisYear),
      }
    }
  };

  const nextState = {
    year,
    currentMortgage,
    currentHeloc,
    currentTfsa,
    currentRrsp,
    currentNonReg,
    currentDeductible,
    cumulativeNonDeductibleHeloc,
    currentACB,
    cumulativeDeductibleInterest,
    helocAvailable,
  };

  return { yearRow, nextState };
}

/**
 * Create initial state from form data
 */
export function createInitialState(formData) {
  const {
    initialMortgage,
    initialTfsa,
    initialHelocAvailable,
  } = formData;

  return {
    year: 0,
    currentMortgage: initialMortgage,
    currentHeloc: 0,
    currentTfsa: initialTfsa,
    currentRrsp: 0,
    currentNonReg: 0,
    currentDeductible: 0,
    cumulativeNonDeductibleHeloc: 0,
    currentACB: 0,
    cumulativeDeductibleInterest: 0,
    helocAvailable: initialHelocAvailable,
  };
}

/**
 * Create immutable config from form data
 */
export function createConfig(formData) {
  const {
    initialMortgage,
    mortgageRate: mortgageRatePct,
    amortYears,
    helocRate: helocRatePct,
    taxRate: taxRatePct,
    annualReturn: annualReturnPct,
    growthRate: growthRatePct,
    dividendYield: dividendYieldPct,
    initialHelocAvailable,
    mortgageType = 'fixed',
    retirementTaxRate = 20,
    inflationRate: inflationRatePct = 0,
    prepaymentLimit = 100,
  } = formData;

  return {
    initialMortgage,
    amortYears,
    mortgageType,
    taxRate: taxRatePct / 100,
    retirementTaxRate,
    totalLimit: initialMortgage + initialHelocAvailable,
    baseMortgageRatePct: mortgageRatePct,
    baseHelocRatePct: helocRatePct,
    baseAnnualReturnPct: annualReturnPct,
    baseGrowthRatePct: growthRatePct,
    baseDividendYieldPct: dividendYieldPct,
    baseInflationRatePct: inflationRatePct,
    prepaymentLimitPct: prepaymentLimit,
  };
}

/**
 * Create Year 0 row (initial state before SM begins)
 */
export function createYear0Row(formData) {
  const {
    initialMortgage,
    mortgageRate: mortgageRatePct,
    mortgageType = 'fixed',
    helocRate: helocRatePct,
    taxRate: taxRatePct,
    annualReturn: annualReturnPct,
    growthRate: growthRatePct,
    dividendYield: dividendYieldPct,
    initialTfsa,
    retirementTaxRate = 20,
  } = formData;

  return {
    year: 0,
    mortgageBalance: Math.round(initialMortgage),
    helocBalance: 0,
    helocInterest: 0,
    portfolioValue: Math.round(initialTfsa),
    tfsaValue: Math.round(initialTfsa),
    rrspValue: 0,
    rrspAfterTax: 0,
    nonRegValue: 0,
    taxRefund: 0,
    principalBuilt: 0,
    inflationAdjustedPortfolio: Math.round(initialTfsa),
    allocation: {},
    details: {
      beginning: {
        mortgage: initialMortgage,
        heloc: 0,
        tfsa: initialTfsa,
        rrsp: 0,
        nonReg: 0,
        deductible: 0,
        portfolio: initialTfsa,
      },
      assumptions: {
        mortgageRate: mortgageRatePct,
        mortgageType,
        helocRate: helocRatePct,
        taxRate: taxRatePct,
        annualReturn: annualReturnPct,
        growthRate: growthRatePct,
        dividendYield: dividendYieldPct,
        rrspContrib: 0,
        tfsaContrib: 0,
        initialNonReg: 0,
        retirementTaxRate,
      },
      calculations: {
        standardPrincipal: 0,
        a: 0,
        b: 0,
        left: 1,
        rightAdd: 0,
        constant: 0,
        P: 0,
        additionalDeductible: 0,
        averageDeductible: 0,
        deductibleInterest: 0,
        refund: 0,
        averageNonReg: 0,
        helocInterest: 0,
        dividendsThisYear: 0,
      },
      end: {
        mortgage: initialMortgage,
        heloc: 0,
        tfsa: initialTfsa,
        rrsp: 0,
        nonReg: 0,
        portfolio: initialTfsa,
      },
      percentChanges: {
        tfsa: '0.00',
        rrsp: '0.00',
        nonReg: '0.00',
        portfolio: '0.00',
        mortgageDecrease: '0.00',
        helocIncrease: '0.00',
      },
      craAudit: {
        openingACB: 0,
        initialInvestment: 0,
        newInvestments: 0,
        reinvestedDividends: 0,
        closingACB: 0,
        marketValue: 0,
        unrealizedGain: 0,
        potentialCapGainsTax: 0,
        deductibleInterest: 0,
        nonDeductibleInterest: 0,
        cumulativeDeductibleInterest: 0,
        rrspDeduction: 0,
        totalDeductions: 0,
        estimatedRefund: 0,
        dividendIncome: 0,
      }
    }
  };
}