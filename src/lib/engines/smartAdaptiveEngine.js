// ============================================================================
// Smart Adaptive Engine — Greedy Marginal Optimizer
// Each year, ranks destinations by marginal after-tax value and fills greedily.
// ============================================================================

import { simulateYear, createInitialState, createConfig, createYear0Row } from './yearSimulator';
import { createConstraints } from './constraints';
import { rankDestinations, greedyAllocate } from './marginalAnalysis';
import { getEffectiveMonthlyRate } from '../financialCalculations';

/**
 * Run the Smart Adaptive simulation.
 * Instead of fixed RRSP/TFSA allocations, each year's available cash
 * (refund + dividends + freed principal) is optimally allocated.
 *
 * @param {object} formData - form inputs (includes baseSalary, rrspRoomTotal, etc.)
 * @param {function|null} scenarioOverrides - (year, baseRates) => overrides
 * @returns {object} { data: Array, allocationPlan: Array }
 */
export function runSmartAdaptiveEngine(formData, scenarioOverrides = null) {
  const {
    initialHelocAvailable = 0,
    tfsaFundingSource = 'heloc',
    rrspFundingSource = 'heloc',
    rrspYear1 = 50000,
    rrspOngoing = 25000,
    tfsaRoomYear1 = 42000,
    annualTfsaIncrease = 7000,
    retirementTaxRate = 20,
    lumpSumAmount = 0,
    lumpSumYear = 1,
  } = formData;

  const config = createConfig(formData);
  const constraints = createConstraints(formData);
  let state = createInitialState(formData);
  const data = [createYear0Row(formData)];
  const allocationPlan = [];

  // Base rates for scenario overrides
  const baseRates = {
    mortgageRate: config.baseMortgageRatePct,
    helocRate: config.baseHelocRatePct,
    taxRate: config.taxRate * 100,
    annualReturn: config.baseAnnualReturnPct,
    growthRate: config.baseGrowthRatePct,
    dividendYield: config.baseDividendYieldPct,
    inflationRate: config.baseInflationRatePct,
  };

  // Track prior year's refund (received at start of current year)
  let priorYearRefund = 0;

  for (let year = 1; year <= 30; year++) {
    const isYear1 = year === 1;
    const yearsLeft = 30 - year;

    // Advance constraints
    constraints.advanceYear(year);

    // Get scenario overrides
    const rateOverrides = scenarioOverrides ? scenarioOverrides(year, baseRates) : {};

    // Current rates (after overrides)
    const yrHelocRatePct = rateOverrides.helocRate ?? config.baseHelocRatePct;
    const yrAnnualReturnPct = rateOverrides.annualReturn ?? config.baseAnnualReturnPct;
    const yrGrowthRatePct = rateOverrides.growthRate ?? config.baseGrowthRatePct;
    const yrDividendYieldPct = rateOverrides.dividendYield ?? config.baseDividendYieldPct;
    const yrMortgageRatePct = rateOverrides.mortgageRate ?? config.baseMortgageRatePct;

    const yrEffectiveMonthly = getEffectiveMonthlyRate(yrMortgageRatePct, config.mortgageType);
    const yrEffectiveAnnualMortgageRate = Math.pow(1 + yrEffectiveMonthly, 12) - 1;

    // Available room
    const room = constraints.available(state);

    // ── Year 1: Deploy initial HELOC ────────────────────────────
    // The initial HELOC kick is always deployed in Year 1
    // But Smart mode optimizes WHERE it goes
    let initialKick = 0;
    let tfsaFromHeloc = 0;
    let tfsaFromSavings = 0;
    let rrspFromHeloc = 0;
    let rrspFromSavings = 0;
    let rrspContrib = 0;

    // Check for Year 1 lump sum
    const lumpSumThisYr1 = (isYear1 && lumpSumAmount > 0 && Number(lumpSumYear) === 1) ? lumpSumAmount : 0;

    if (isYear1 && initialHelocAvailable > 0) {
      initialKick = initialHelocAvailable;

      // Rank destinations for the initial HELOC deployment
      const ranked = rankDestinations({
        yearsLeft: Math.max(1, yearsLeft),
        annualReturn: yrAnnualReturnPct / 100,
        growthRate: yrGrowthRatePct / 100,
        dividendYield: yrDividendYieldPct / 100,
        helocRate: yrHelocRatePct / 100,
        mortgageRate: yrEffectiveAnnualMortgageRate,
        taxRate: config.taxRate,
        retirementTaxRate: retirementTaxRate / 100,
        room,
      });

      // Allocate the HELOC capital + any Year 1 lump sum
      const totalYear1Cash = initialHelocAvailable + lumpSumThisYr1;
      const helocAlloc = greedyAllocate(totalYear1Cash, ranked, room);

      tfsaFromHeloc = Math.min(helocAlloc.tfsa, room.tfsa);
      rrspContrib = Math.min(helocAlloc.rrsp, room.rrsp);
      rrspFromHeloc = rrspContrib;
      // Non-reg gets the remainder (handled by yearSimulator via initialKick math)

      allocationPlan.push({
        year,
        type: lumpSumThisYr1 > 0 ? 'lump_sum_deployment' : 'initial_heloc',
        totalCash: totalYear1Cash,
        lumpSumComponent: lumpSumThisYr1,
        allocation: helocAlloc,
        ranked: ranked.map(r => ({ dest: r.destination, value: r.value.toFixed(2), reasoning: r.reasoning })),
      });
    } else if (!isYear1) {
      // ── Year 2+: Optimize refund + dividends + lump sum ─────
      // Cash available = prior year's tax refund + dividends from non-reg + lump sum if this year
      const dividendsReceived = Math.round((yrDividendYieldPct / 100) * state.currentNonReg);
      const lumpSumThisYear = (lumpSumAmount > 0 && year === Number(lumpSumYear)) ? lumpSumAmount : 0;
      const cashAvailable = priorYearRefund + dividendsReceived + lumpSumThisYear;

      if (cashAvailable > 0) {
        const ranked = rankDestinations({
          yearsLeft: Math.max(1, yearsLeft),
          annualReturn: yrAnnualReturnPct / 100,
          growthRate: yrGrowthRatePct / 100,
          dividendYield: yrDividendYieldPct / 100,
          helocRate: yrHelocRatePct / 100,
          mortgageRate: yrEffectiveAnnualMortgageRate,
          taxRate: config.taxRate,
          retirementTaxRate: retirementTaxRate / 100,
          room,
        });

        const cashAlloc = greedyAllocate(cashAvailable, ranked, room);

        // Convert allocation to year simulator format
        tfsaFromSavings = cashAlloc.tfsa; // funded from refund cash
        rrspContrib = cashAlloc.rrsp;
        rrspFromSavings = rrspContrib;
        // mortgage allocation is handled implicitly by the SM P formula
        // (the refund going to mortgage is the default SM behavior)

        allocationPlan.push({
          year,
          type: lumpSumThisYear > 0 ? 'lump_sum_deployment' : 'annual_optimization',
          totalCash: cashAvailable,
          refundComponent: priorYearRefund,
          dividendComponent: dividendsReceived,
          lumpSumComponent: lumpSumThisYear,
          allocation: cashAlloc,
          ranked: ranked.map(r => ({ dest: r.destination, value: r.value.toFixed(2), reasoning: r.reasoning })),
        });
      } else {
        // Even with no cash, still contribute TFSA from savings
        tfsaFromSavings = Math.min(annualTfsaIncrease, room.tfsa);
        rrspContrib = Math.min(rrspOngoing, room.rrsp);
        rrspFromSavings = rrspContrib;
      }
    } else if (isYear1) {
      // Year 1 with no HELOC — use savings + optional lump sum
      const lumpSumCash = lumpSumThisYr1;
      const totalYear1Savings = tfsaRoomYear1 + rrspYear1 + lumpSumCash;

      if (lumpSumCash > 0) {
        // If there's a lump sum, use marginal analysis to optimally deploy everything
        const ranked = rankDestinations({
          yearsLeft: Math.max(1, yearsLeft),
          annualReturn: yrAnnualReturnPct / 100,
          growthRate: yrGrowthRatePct / 100,
          dividendYield: yrDividendYieldPct / 100,
          helocRate: yrHelocRatePct / 100,
          mortgageRate: yrEffectiveAnnualMortgageRate,
          taxRate: config.taxRate,
          retirementTaxRate: retirementTaxRate / 100,
          room,
        });
        const cashAlloc = greedyAllocate(totalYear1Savings, ranked, room);
        tfsaFromSavings = cashAlloc.tfsa;
        rrspContrib = cashAlloc.rrsp;
        rrspFromSavings = rrspContrib;

        allocationPlan.push({
          year,
          type: 'lump_sum_deployment',
          totalCash: totalYear1Savings,
          lumpSumComponent: lumpSumCash,
          allocation: cashAlloc,
          ranked: ranked.map(r => ({ dest: r.destination, value: r.value.toFixed(2), reasoning: r.reasoning })),
        });
      } else {
        tfsaFromSavings = Math.min(tfsaRoomYear1, room.tfsa);
        rrspContrib = Math.min(rrspYear1, room.rrsp);
        rrspFromSavings = rrspContrib;
      }
    }

    const allocation = {
      rrspContrib,
      tfsaFromHeloc,
      tfsaFromSavings,
      initialKick,
      rrspFromHeloc,
      rrspFromSavings,
    };

    // Clamp to constraints
    const clampedAllocation = constraints.clamp(allocation, state);

    // Simulate the year
    const { yearRow, nextState } = simulateYear(state, config, clampedAllocation, rateOverrides);

    // Track refund for next year's allocation
    priorYearRefund = yearRow.taxRefund;

    // Consume room
    const tfsaContrib = (clampedAllocation.tfsaFromHeloc || 0) + (clampedAllocation.tfsaFromSavings || 0);
    constraints.consume({
      tfsaContrib,
      rrspContrib: clampedAllocation.rrspContrib,
    });

    // Attach allocation plan info to year row
    yearRow.allocationPlan = allocationPlan.find(p => p.year === year) || null;

    data.push(yearRow);
    state = nextState;
  }

  return { data, allocationPlan };
}