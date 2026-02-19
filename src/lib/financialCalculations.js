// ============================================================================
// Canadian Financial Calculations Engine
// Supports: Smith Manoeuvre, TFSA, RRSP, HELOC, Fixed & Variable Mortgages
// Routes through modular engines: Classic, Smart Adaptive, Path Explorer
// ============================================================================

import { runClassicEngine } from './engines/classicEngine';
import { runSmartAdaptiveEngine } from './engines/smartAdaptiveEngine';
import { runPathExplorer, runSingleStrategyByName } from './engines/pathExplorerEngine';
import { runAStarOptimizer } from './engines/aStarOptimizer';
import { SCENARIOS } from './scenarios';

// Re-export for use by engines and other modules
export const getEffectiveMonthlyRate = (annualRatePct, mortgageType = 'fixed') => {
  const annualRate = annualRatePct / 100;
  if (mortgageType === 'variable') {
    return annualRate / 12;
  }
  const semiAnnualRate = annualRate / 2;
  return Math.pow(1 + semiAnnualRate, 1 / 6) - 1;
};

// Calculate traditional mortgage payoff time
export const calculateTraditionalPayoff = (initialMortgage, mortgageRatePct, amortYears, mortgageType = 'fixed') => {
  const effectiveMonthlyRate = getEffectiveMonthlyRate(mortgageRatePct, mortgageType);
  const n = amortYears * 12;

  const power = Math.pow(1 + effectiveMonthlyRate, n);
  const monthlyPayment = initialMortgage * effectiveMonthlyRate * power / (power - 1);

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

// Calculate RRSP after-tax value
export const calculateRrspAfterTax = (rrspGrossValue, retirementTaxRate) => {
  const rate = retirementTaxRate / 100;
  return rrspGrossValue * (1 - rate);
};

// ============================================================================
// Generate "No Smith Manoeuvre" baseline comparison
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

    const mortgageInterest = currentMortgage * (Math.pow(1 + effectiveMonthlyRate, 12) - 1);
    const standardPrincipal = Math.min(annualPayment - mortgageInterest, currentMortgage);

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
// Multi-Scenario Robustness Analysis
// Runs top strategies across all risk scenarios to find the most robust
// ============================================================================
const computeRobustnessScores = (formData, explorerResult) => {
  if (!explorerResult?.topRoutes?.length) return null;

  const stressScenarios = SCENARIOS.filter(s => s.id !== 'base');
  const topStrategies = explorerResult.allStrategies?.slice(0, 10) || [];
  if (!topStrategies.length) return null;

  // For each top strategy, run it under each stress scenario using fast single runner
  const robustnessData = topStrategies.map(strat => {
    const scenarioScores = {};
    
    // Base case score (already computed)
    scenarioScores.base = strat.netWealth;

    // Run under each stress scenario — one sim per strategy × scenario
    for (const scenario of stressScenarios) {
      const result = runSingleStrategyByName(
        formData,
        strat.yr1,
        strat.ongoing,
        scenario.yearOverrides
      );
      scenarioScores[scenario.id] = result.netWealth;
    }

    // Weighted robustness score: 50% base + 12.5% each stress
    const stressAvg = stressScenarios.reduce((sum, s) => sum + (scenarioScores[s.id] || 0), 0) / stressScenarios.length;
    const robustnessScore = Math.round(0.5 * scenarioScores.base + 0.5 * stressAvg);

    return {
      rank: strat.rank,
      yr1: strat.yr1,
      ongoing: strat.ongoing,
      baseScore: scenarioScores.base,
      scenarioScores,
      robustnessScore,
      worstCase: Math.min(...Object.values(scenarioScores)),
      bestCase: Math.max(...Object.values(scenarioScores)),
    };
  });

  // Sort by robustness score
  robustnessData.sort((a, b) => b.robustnessScore - a.robustnessScore);

  return {
    strategies: robustnessData,
    mostRobust: robustnessData[0],
    scenarios: ['base', ...stressScenarios.map(s => s.id)],
    scenarioNames: { base: 'Base Case', ...Object.fromEntries(stressScenarios.map(s => [s.id, s.name])) },
  };
};

// ============================================================================
// Main entry point — routes to the appropriate engine
// ============================================================================
export const generateFinancialData = (formData, scenarioOverrides = null) => {
  const mode = formData.optimizationMode || 'classic';

  switch (mode) {
    case 'optimizer': {
      // Run Smart Adaptive (fast, good baseline)
      const smartResult = runSmartAdaptiveEngine(formData, scenarioOverrides);
      
      // Run A* Two-Phase optimizer (Phase 1: grid + Phase 2: refinement)
      const aStarResult = runAStarOptimizer(formData, scenarioOverrides);
      
      // Run Path Explorer for alternative strategies comparison
      const explorerResult = runPathExplorer(formData, scenarioOverrides, smartResult, 50);
      
      // Run Multi-Scenario Robustness Analysis on top strategies
      const robustnessResults = computeRobustnessScores(formData, explorerResult);
      
      // Return Smart Adaptive as primary data, attach A* and alternatives
      const data = smartResult.data;
      data.allocationPlan = smartResult.allocationPlan;
      data.aStarOptimal = aStarResult;
      data.explorerResults = explorerResult;
      data.robustnessResults = robustnessResults;
      return data;
    }
    case 'smart': {
      const result = runSmartAdaptiveEngine(formData, scenarioOverrides);
      const data = result.data;
      data.allocationPlan = result.allocationPlan;
      return data;
    }
    case 'explorer': {
      const smartResult = runSmartAdaptiveEngine(formData, scenarioOverrides);
      const explorerResult = runPathExplorer(formData, scenarioOverrides, smartResult, 50);
      const data = smartResult.data;
      data.allocationPlan = smartResult.allocationPlan;
      data.explorerResults = explorerResult;
      return data;
    }
    case 'classic':
    default:
      return runClassicEngine(formData, scenarioOverrides);
  }
};
