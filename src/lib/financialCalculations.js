// ============================================================================
// Canadian Financial Calculations Engine
// Supports: Smith Manoeuvre, TFSA, RRSP, HELOC, Fixed & Variable Mortgages
// ============================================================================

// Calculate effective monthly rate based on mortgage type
// Canadian fixed mortgages: compounded semi-annually, not monthly (Interest Act)
// Canadian variable mortgages: compounded monthly
export const getEffectiveMonthlyRate = (annualRatePct, mortgageType = 'fixed') => {
  const annualRate = annualRatePct / 100;
  if (mortgageType === 'variable') {
    // Variable rate: simple monthly compounding
    return annualRate / 12;
  }
  // Fixed rate: semi-annual compounding converted to effective monthly
  const semiAnnualRate = annualRate / 2;
  return Math.pow(1 + semiAnnualRate, 1 / 6) - 1;
};

// Calculate traditional mortgage payoff time
export const calculateTraditionalPayoff = (initialMortgage, mortgageRatePct, amortYears, mortgageType = 'fixed') => {
  const effectiveMonthlyRate = getEffectiveMonthlyRate(mortgageRatePct, mortgageType);
  const n = amortYears * 12;

  // Standard mortgage payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const power = Math.pow(1 + effectiveMonthlyRate, n);
  const monthlyPayment = initialMortgage * effectiveMonthlyRate * power / (power - 1);

  // Calculate actual payoff with precise month-by-month amortization
  let remainingBalance = initialMortgage;
  let months = 0;
  let totalInterestPaid = 0;

  while (remainingBalance > 0.01 && months < n) {
    const interestPayment = remainingBalance * effectiveMonthlyRate;
    const principalPayment = monthlyPayment - interestPayment;

    totalInterestPaid += interestPayment;
    remainingBalance -= principalPayment;
    months++;

    if (remainingBalance < 0) remainingBalance = 0;
  }

  return {
    years: Math.round(months / 12 * 10) / 10,
    months: months,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterestPaid * 100) / 100
  };
};

// Calculate Smith Manoeuvre payoff time from table data
export const calculateSmithManoeuvrePayoff = (data) => {
  const payoffYear = data.find(row => row.mortgageBalance === 0);
  if (payoffYear) {
    return {
      years: payoffYear.year,
      finalPortfolio: payoffYear.portfolioValue,
      totalLeveraged: payoffYear.helocBalance,
      netWealth: payoffYear.portfolioValue - payoffYear.helocBalance
    };
  }

  const lastYear = data[data.length - 1];
  return {
    years: lastYear.year,
    remainingMortgage: lastYear.mortgageBalance,
    finalPortfolio: lastYear.portfolioValue,
    totalLeveraged: lastYear.helocBalance,
    netWealth: lastYear.portfolioValue - lastYear.helocBalance
  };
};

// Calculate RRSP after-tax value (what you'd actually get after withdrawal)
export const calculateRrspAfterTax = (rrspGrossValue, retirementTaxRate) => {
  const rate = retirementTaxRate / 100;
  return rrspGrossValue * (1 - rate);
};

// ============================================================================
// Generate "No Smith Manoeuvre" baseline comparison
// Same RRSP/TFSA contributions from savings, normal mortgage, no HELOC leverage
// ============================================================================
export const generateNoSmithData = (formData) => {
  const {
    initialMortgage,
    mortgageRate: mortgageRatePct,
    amortYears,
    annualReturn: annualReturnPct,
    initialTfsa,
    tfsaRoomYear1,
    annualTfsaIncrease,
    rrspYear1,
    rrspOngoing,
    mortgageType = 'fixed',
  } = formData;

  const annualReturn = annualReturnPct / 100;
  const effectiveMonthlyRate = getEffectiveMonthlyRate(mortgageRatePct, mortgageType);
  const n = amortYears * 12;
  const power = Math.pow(1 + effectiveMonthlyRate, n);
  const monthlyPayment = initialMortgage * effectiveMonthlyRate * power / (power - 1);
  const annualPayment = monthlyPayment * 12;

  let currentMortgage = initialMortgage;
  let currentTfsa = initialTfsa;
  let currentRrsp = 0;
  const data = [];

  for (let year = 0; year <= 30; year++) {
    if (year === 0) {
      data.push({
        year: 0,
        mortgageBalance: Math.round(initialMortgage),
        portfolioValue: Math.round(initialTfsa),
        tfsaValue: Math.round(initialTfsa),
        rrspValue: 0,
        nonRegValue: 0,
      });
      continue;
    }

    const isYear1 = year === 1;
    const rrspContrib = isYear1 ? rrspYear1 : rrspOngoing;
    const tfsaContrib = isYear1 ? tfsaRoomYear1 : annualTfsaIncrease;

    // Normal mortgage principal payment (no acceleration)
    const mortgageInterest = currentMortgage * (Math.pow(1 + effectiveMonthlyRate, 12) - 1);
    const standardPrincipal = Math.min(annualPayment - mortgageInterest, currentMortgage);

    // TFSA and RRSP grow from savings contributions + returns (no HELOC)
    const tfsaValue = (currentTfsa + tfsaContrib) * (1 + annualReturn);
    const rrspValue = (currentRrsp + rrspContrib) * (1 + annualReturn);
    const portfolioValue = tfsaValue + rrspValue;

    currentTfsa = tfsaValue;
    currentRrsp = rrspValue;
    currentMortgage = Math.max(0, currentMortgage - standardPrincipal);

    data.push({
      year,
      mortgageBalance: Math.round(currentMortgage),
      portfolioValue: Math.round(portfolioValue),
      tfsaValue: Math.round(tfsaValue),
      rrspValue: Math.round(rrspValue),
      nonRegValue: 0,
    });
  }

  return data;
};

// ============================================================================
// Main Smith Manoeuvre Financial Data Generator
// ============================================================================
export const generateFinancialData = (formData, scenarioOverrides = null) => {
  const {
    initialMortgage,
    mortgageRate: mortgageRatePct,
    amortYears,
    helocRate: helocRatePct,
    taxRate: taxRatePct,
    annualReturn: annualReturnPct,
    growthRate: growthRatePct,
    dividendYield: dividendYieldPct,
    initialTfsa,
    tfsaRoomYear1,
    annualTfsaIncrease,
    rrspYear1,
    rrspOngoing,
    initialHelocAvailable,
    mortgageType = 'fixed',
    tfsaFundingSource = 'heloc',
    rrspFundingSource = 'heloc',
    retirementTaxRate = 20,
    inflationRate: inflationRatePct = 0,
  } = formData;

  const mortgageRate = mortgageRatePct / 100;
  const helocRate = helocRatePct / 100;
  const taxRate = taxRatePct / 100;
  const annualReturn = annualReturnPct / 100;
  const growthRate = growthRatePct / 100;
  const dividendYield = dividendYieldPct / 100;
  const inflationRate = inflationRatePct / 100;

  // Base rates for scenario overrides
  const baseRates = {
    mortgageRate: mortgageRatePct,
    helocRate: helocRatePct,
    taxRate: taxRatePct,
    annualReturn: annualReturnPct,
    growthRate: growthRatePct,
    dividendYield: dividendYieldPct, // keep as percentage
    inflationRate: inflationRatePct,
  };

  const totalLimit = initialMortgage + initialHelocAvailable;
  const effectiveMonthlyRate = getEffectiveMonthlyRate(mortgageRatePct, mortgageType);
  const n = amortYears * 12;
  const power = Math.pow(1 + effectiveMonthlyRate, n);
  const monthlyPayment = initialMortgage * effectiveMonthlyRate * power / (power - 1);
  const annualPayment = monthlyPayment * 12;

  // Approximate annual mortgage interest rate from effective monthly rate
  const effectiveAnnualMortgageRate = Math.pow(1 + effectiveMonthlyRate, 12) - 1;

  let currentMortgage = initialMortgage;
  let currentHeloc = 0;
  let currentTfsa = initialTfsa;
  let currentRrsp = 0;
  let currentNonReg = 0;
  let currentDeductible = 0;
  let cumulativeNonDeductibleHeloc = 0; // Running total for accurate interest tracking
  const data = [];

  // Add Year 0 - Current/Initial State
  data.push({
    year: 0,
    mortgageBalance: Math.round(initialMortgage),
    helocBalance: 0,
    helocInterest: 0,
    portfolioValue: Math.round(initialTfsa),
    tfsaValue: Math.round(initialTfsa),
    rrspValue: 0,
    nonRegValue: 0,
    rrspAfterTax: 0,
    taxRefund: 0,
    principalBuilt: 0,
    inflationAdjustedPortfolio: Math.round(initialTfsa),
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
        tfsaFundingSource,
        rrspFundingSource,
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
      }
    }
  });

  // CRA Audit Trail tracking
  let currentACB = 0;
  let cumulativeDeductibleInterest = 0;

  for (let year = 1; year <= 30; year++) {
    // Apply scenario overrides for this year
    const overrides = scenarioOverrides ? scenarioOverrides(year, baseRates) : {};
    const yrHelocRate = (overrides.helocRate !== undefined ? overrides.helocRate : helocRatePct) / 100;
    const yrAnnualReturn = (overrides.annualReturn !== undefined ? overrides.annualReturn : annualReturnPct) / 100;
    const yrGrowthRate = (overrides.growthRate !== undefined ? overrides.growthRate : growthRatePct) / 100;
    const yrDividendYield = (overrides.dividendYield !== undefined ? overrides.dividendYield : dividendYieldPct) / 100;
    const yrInflationRate = (overrides.inflationRate !== undefined ? overrides.inflationRate : inflationRatePct) / 100;
    // Mortgage rate override affects payment recalculation
    const yrMortgageRatePct = overrides.mortgageRate !== undefined ? overrides.mortgageRate : mortgageRatePct;
    const yrEffectiveMonthly = overrides.mortgageRate !== undefined
      ? getEffectiveMonthlyRate(yrMortgageRatePct, mortgageType)
      : effectiveMonthlyRate;
    const yrEffectiveAnnualMortgageRate = Math.pow(1 + yrEffectiveMonthly, 12) - 1;
    // Recalculate annual payment if mortgage rate changed
    const yrAnnualPayment = overrides.mortgageRate !== undefined
      ? (() => { const p = Math.pow(1 + yrEffectiveMonthly, n); return initialMortgage * yrEffectiveMonthly * p / (p - 1) * 12; })()
      : annualPayment;

    const beginning = {
      mortgage: currentMortgage,
      heloc: currentHeloc,
      tfsa: currentTfsa,
      rrsp: currentRrsp,
      nonReg: currentNonReg,
      deductible: currentDeductible,
      portfolio: currentTfsa + currentRrsp + currentNonReg,
    };

    const isYear1 = year === 1;
    const rrspContrib = isYear1 ? rrspYear1 : rrspOngoing;

    // Determine TFSA contribution based on funding source
    const tfsaFromHeloc = tfsaFundingSource === 'heloc'
      ? (isYear1 ? tfsaRoomYear1 : 0)
      : 0;
    const tfsaFromSavings = tfsaFundingSource === 'savings'
      ? (isYear1 ? tfsaRoomYear1 : annualTfsaIncrease)
      : (isYear1 ? 0 : annualTfsaIncrease);
    const tfsaContrib = tfsaFromHeloc + tfsaFromSavings;

    // Determine which portions are funded from HELOC vs savings
    const rrspFromHeloc = rrspFundingSource === 'heloc' ? rrspContrib : 0;
    const rrspFromSavings = rrspFundingSource === 'savings' ? rrspContrib : 0;

    // Non-deductible from principal (funded from savings, not deductible interest)
    const nonDeductibleFromP = rrspFromSavings + tfsaFromSavings;

    const initialKick = isYear1 ? initialHelocAvailable : 0;

    // What portion of initialKick goes to non-deductible purposes (TFSA/RRSP via HELOC)
    const tfsaHelocUsedYear1 = isYear1 ? tfsaFromHeloc : 0;
    const rrspHelocUsedYear1 = isYear1 ? rrspFromHeloc : 0;
    const nonDeductibleKick = tfsaHelocUsedYear1 + rrspHelocUsedYear1;
    const deductibleKick = Math.max(0, initialKick - nonDeductibleKick);

    // Initial HELOC allocation in Year 1
    if (initialKick > 0 && isYear1) {
      currentDeductible += deductibleKick;
      currentNonReg += deductibleKick;
      currentHeloc += initialKick;
      cumulativeNonDeductibleHeloc += nonDeductibleKick;
    }

    const initialNonReg = isYear1 ? deductibleKick : 0;

    // Calculate standard principal built from regular mortgage payments
    const standardPrincipal = yrAnnualPayment - currentMortgage * yrEffectiveAnnualMortgageRate;

    // Dividends from existing non-reg investments
    const dividendsThisYear = Math.round(yrDividendYield * currentNonReg);

    // Apply Smith Manoeuvre formula to calculate accelerated principal (P)
    let P = standardPrincipal;
    let a = 0, b = 0, left = 1, rightAdd = 0, constant = standardPrincipal;

    const hasOngoingActivity = initialHelocAvailable > 0 || rrspFromHeloc > 0 || currentDeductible > 0 || standardPrincipal > 0;

    if (hasOngoingActivity) {
      a = yrDividendYield / 2;
      b = taxRate * yrHelocRate / 2;
      left = 1 - a - b;
      rightAdd = a + b;

      // Use average deductible balance (currentDeductible is the starting balance for this year)
      constant = standardPrincipal
        + yrDividendYield * currentNonReg
        + rrspContrib * taxRate
        + taxRate * yrHelocRate * currentDeductible;

      P = (constant + rightAdd * nonDeductibleFromP) / left;
    }

    P = Math.min(P, currentMortgage);
    if (P < 0) P = 0;

    // Calculate additional deductible debt from reinvestment
    const additionalDeductible = Math.max(0, P - nonDeductibleFromP);
    const averageDeductible = currentDeductible + additionalDeductible / 2;

    // HELOC Interest calculation with proper tracking
    let deductibleInterest = 0;
    let nonDeductibleInterest = 0;
    let helocInterest = 0;

    const projectedHeloc = currentHeloc + P;

    if (projectedHeloc > 0 || averageDeductible > 0) {
      // Deductible interest: on non-registered investment-backed HELOC
      deductibleInterest = yrHelocRate * averageDeductible;

      // Non-deductible interest: on TFSA/RRSP-backed HELOC (tracked cumulatively)
      nonDeductibleInterest = Math.max(0, yrHelocRate * Math.min(cumulativeNonDeductibleHeloc, projectedHeloc));

      helocInterest = deductibleInterest + nonDeductibleInterest;
    }

    // Tax refund: RRSP contribution + deductible interest
    const refund = rrspContrib * taxRate + deductibleInterest * taxRate;

    // Investment growth calculations
    const averageNonReg = currentNonReg + additionalDeductible / 2;
    const tfsaValue = (currentTfsa + tfsaContrib) * (1 + yrAnnualReturn);
    const rrspValue = (currentRrsp + rrspContrib) * (1 + yrAnnualReturn);
    const nonRegValue = currentNonReg * (1 + yrGrowthRate) + additionalDeductible * (1 + yrGrowthRate / 2);
    const portfolioValue = tfsaValue + rrspValue + nonRegValue;

    // RRSP after-tax value
    const rrspAfterTax = calculateRrspAfterTax(rrspValue, retirementTaxRate);

    // Inflation-adjusted portfolio value
    const inflationFactor = yrInflationRate > 0 ? Math.pow(1 + yrInflationRate, year) : 1;
    const inflationAdjustedPortfolio = portfolioValue / inflationFactor;

    // Percent changes
    const tfsaPct = beginning.tfsa + tfsaContrib > 0 ? ((tfsaValue - beginning.tfsa - tfsaContrib) / (beginning.tfsa + tfsaContrib)) * 100 : 0;
    const rrspPct = beginning.rrsp + rrspContrib > 0 ? ((rrspValue - beginning.rrsp - rrspContrib) / (beginning.rrsp + rrspContrib)) * 100 : 0;
    const nonRegPct = beginning.nonReg + initialNonReg + additionalDeductible > 0 ? ((nonRegValue - beginning.nonReg - initialNonReg - additionalDeductible) / (beginning.nonReg + initialNonReg + additionalDeductible / 2)) * 100 : 0;
    const portfolioPct = beginning.portfolio > 0 ? ((portfolioValue - beginning.portfolio - (tfsaContrib + rrspContrib + initialNonReg + additionalDeductible)) / beginning.portfolio) * 100 : 0;
    const mortgageDecreasePct = beginning.mortgage > 0 ? (P / beginning.mortgage * 100) : 0;
    const helocIncreasePct = beginning.heloc > 0 ? (P / beginning.heloc * 100) : 0;

    // Update CRA audit trail running totals
    if (isYear1) currentACB += deductibleKick;  // Initial HELOC → Non-Reg
    currentACB += additionalDeductible;          // Annual re-borrowed principal → Non-Reg
    currentACB += dividendsThisYear;             // Reinvested dividends increase ACB
    cumulativeDeductibleInterest += deductibleInterest;

    // Update state for next year
    currentTfsa = tfsaValue;
    currentRrsp = rrspValue;
    currentNonReg = nonRegValue;

    // Update HELOC and deductible tracking
    if (additionalDeductible > 0) {
      currentDeductible += additionalDeductible;
    }
    currentHeloc += P;
    if (currentHeloc > totalLimit) currentHeloc = totalLimit;

    // Track non-deductible HELOC usage for ongoing years
    // RRSP/TFSA funded from HELOC in ongoing years via redirected principal
    if (!isYear1) {
      const nonDeductiblePortionOfP = Math.min(P, nonDeductibleFromP);
      cumulativeNonDeductibleHeloc += nonDeductiblePortionOfP;
    }

    currentMortgage -= P;
    if (currentMortgage < 0) currentMortgage = 0;

    data.push({
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
      details: {
        beginning,
        assumptions: {
          mortgageRate: yrMortgageRatePct,
          mortgageType,
          helocRate: yrHelocRate * 100,
          taxRate: taxRatePct,
          annualReturn: yrAnnualReturn * 100,
          growthRate: yrGrowthRate * 100,
          dividendYield: yrDividendYield * 100,
          rrspContrib,
          tfsaContrib,
          initialNonReg,
          tfsaFundingSource,
          rrspFundingSource,
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
          openingACB: Math.round(currentACB - additionalDeductible - dividendsThisYear - (isYear1 ? deductibleKick : 0)),
          initialInvestment: Math.round(isYear1 ? deductibleKick : 0),
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
    });
  }

  return data;
};
