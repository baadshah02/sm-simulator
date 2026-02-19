// ============================================================================
// Path Explorer Engine v5 — Full Strategy Comparison
// Runs independent 30-year simulations for every combination of:
//   Year 1 option (8 ways to deploy HELOC) × Ongoing strategy (10 ways to allocate)
// Then ranks all strategies by after-tax net wealth and returns top results.
//
// Unlike beam search, each strategy runs independently to completion —
// no pruning means no convergence, so every result is genuinely different.
// ============================================================================

import { simulateYear, createInitialState, createConfig, createYear0Row } from './yearSimulator';
import { createConstraints } from './constraints';

// ============================================================================
// Year 1 Options — How to deploy initial HELOC capital
// ============================================================================

function getYear1Options(formData) {
  const { initialHelocAvailable = 0, tfsaRoomYear1 = 42000, rrspYear1 = 50000 } = formData;
  if (initialHelocAvailable <= 0) return [{ name: 'No HELOC', allocation: {} }];

  const kick = initialHelocAvailable;

  // We'll compute actual values at runtime after constraints are known
  return [
    { name: 'TFSA→RRSP→NonReg', prio: ['tfsa', 'rrsp'] },
    { name: 'RRSP→TFSA→NonReg', prio: ['rrsp', 'tfsa'] },
    { name: 'All NonReg (Pure SM)', prio: [] },
    { name: 'RRSP only→NonReg', prio: ['rrsp'] },
    { name: 'TFSA only→NonReg', prio: ['tfsa'] },
    { name: '50% RRSP→NonReg', prio: ['halfRrsp'] },
    { name: 'Equal 3-way Split', prio: ['equal'] },
    { name: 'Mostly NonReg (75%)', prio: ['small'] },
  ];
}

function resolveYear1Allocation(option, formData, room) {
  const kick = formData.initialHelocAvailable || 0;
  if (kick <= 0) return {};

  const tfsaMax = Math.min(room.tfsa, kick);
  const rrspMax = Math.min(room.rrsp, kick);

  let tfsa = 0, rrsp = 0;

  switch (option.prio.join(',')) {
    case 'tfsa,rrsp':
      tfsa = tfsaMax;
      rrsp = Math.min(rrspMax, kick - tfsa);
      break;
    case 'rrsp,tfsa':
      rrsp = rrspMax;
      tfsa = Math.min(tfsaMax, kick - rrsp);
      break;
    case '':
      break; // all to non-reg
    case 'rrsp':
      rrsp = rrspMax;
      break;
    case 'tfsa':
      tfsa = tfsaMax;
      break;
    case 'halfRrsp':
      rrsp = Math.min(rrspMax, Math.floor(kick * 0.5));
      break;
    case 'equal':
      { const third = Math.floor(kick / 3);
        tfsa = Math.min(tfsaMax, third);
        rrsp = Math.min(rrspMax, third); }
      break;
    case 'small':
      tfsa = Math.min(tfsaMax, Math.floor(kick * 0.1));
      rrsp = Math.min(rrspMax, Math.floor(kick * 0.15));
      break;
  }

  return {
    initialKick: kick,
    tfsaFromHeloc: tfsa,
    rrspContrib: rrsp,
    rrspFromHeloc: rrsp,
  };
}

// ============================================================================
// Ongoing Strategies — Fixed allocation rules applied every year 2-30
// ============================================================================

function getOngoingStrategies() {
  return [
    { name: 'Max RRSP + Max TFSA', rrspPct: 1.0, tfsaPct: 1.0, helocPaydown: false },
    { name: 'Max RRSP only', rrspPct: 1.0, tfsaPct: 0, helocPaydown: false },
    { name: 'Max TFSA only', rrspPct: 0, tfsaPct: 1.0, helocPaydown: false },
    { name: 'Pure SM (no registered)', rrspPct: 0, tfsaPct: 0, helocPaydown: false },
    { name: '50% RRSP + Max TFSA', rrspPct: 0.5, tfsaPct: 1.0, helocPaydown: false },
    { name: '75% RRSP + Max TFSA', rrspPct: 0.75, tfsaPct: 1.0, helocPaydown: false },
    { name: '25% RRSP + 25% TFSA', rrspPct: 0.25, tfsaPct: 0.25, helocPaydown: false },
    { name: 'Max RRSP + HELOC Paydown', rrspPct: 1.0, tfsaPct: 0, helocPaydown: true },
    { name: 'Max TFSA + HELOC Paydown', rrspPct: 0, tfsaPct: 1.0, helocPaydown: true },
    { name: '50% RRSP + 50% TFSA', rrspPct: 0.5, tfsaPct: 0.5, helocPaydown: false },
  ];
}

function resolveOngoingAllocation(strategy, formData, room, state, cashPool) {
  const { annualTfsaIncrease = 7000, rrspOngoing = 25000 } = formData;

  const tfsaRoom = Math.min(annualTfsaIncrease, room.tfsa);
  const rrspRoom = Math.min(rrspOngoing, room.rrsp);

  const rrspContrib = Math.floor(rrspRoom * strategy.rrspPct);
  const tfsaFromSavings = Math.floor(tfsaRoom * strategy.tfsaPct);
  let helocPaydown = 0;

  if (strategy.helocPaydown && state.cumulativeNonDeductibleHeloc > 0 && cashPool > 0) {
    helocPaydown = Math.min(cashPool, state.cumulativeNonDeductibleHeloc);
  }

  return {
    tfsaFromSavings,
    rrspContrib,
    rrspFromSavings: rrspContrib,
    helocPaydown,
  };
}

// ============================================================================
// Scoring — After-tax net wealth
// ============================================================================

function computeAfterTaxScore(yearRow, config) {
  const retirementTaxRate = (config.retirementTaxRate || 20) / 100;
  const taxRate = config.taxRate;

  const tfsaNet = yearRow.tfsaValue;
  const rrspNet = yearRow.rrspValue * (1 - retirementTaxRate);
  const nonRegACB = yearRow.details?.craAudit?.closingACB || yearRow.nonRegValue * 0.5;
  const unrealizedGain = Math.max(0, yearRow.nonRegValue - nonRegACB);
  const capGainsTax = unrealizedGain * 0.5 * taxRate;
  const nonRegNet = yearRow.nonRegValue - capGainsTax;

  return tfsaNet + rrspNet + nonRegNet - yearRow.helocBalance;
}

// ============================================================================
// Run a single complete 30-year simulation for one strategy
// ============================================================================

function runSingleStrategy(formData, yr1Option, ongoingStrategy, config, scenarioOverrides, baseRates) {
  const state0 = createInitialState(formData);
  const constraints0 = createConstraints(formData);
  const year0Row = createYear0Row(formData);
  const { lumpSumAmount = 0, lumpSumYear = '1' } = formData;

  let state = state0;
  let constraints = constraints0;
  const yearRows = [year0Row];
  const decisions = [];
  let priorYearRefund = 0;

  for (let year = 1; year <= 30; year++) {
    const isYear1 = year === 1;
    const rateOverrides = scenarioOverrides ? scenarioOverrides(year, baseRates) : {};
    const yrDividendYieldPct = rateOverrides.dividendYield ?? config.baseDividendYieldPct;

    constraints.advanceYear(year);
    const room = constraints.available(state);

    // Lump sum check for this year
    const lumpThisYear = (lumpSumAmount > 0 && year === Number(lumpSumYear)) ? lumpSumAmount : 0;

    let allocation;
    let decisionName;

    if (isYear1) {
      allocation = resolveYear1Allocation(yr1Option, formData, room);
      // If lump sum in Year 1, add to TFSA/RRSP based on room
      if (lumpThisYear > 0) {
        const extraTfsa = Math.min(lumpThisYear, room.tfsa - (allocation.tfsaFromHeloc || 0));
        const extraRrsp = Math.min(lumpThisYear - Math.max(0, extraTfsa), room.rrsp - (allocation.rrspContrib || 0));
        allocation.tfsaFromSavings = (allocation.tfsaFromSavings || 0) + Math.max(0, extraTfsa);
        allocation.rrspContrib = (allocation.rrspContrib || 0) + Math.max(0, extraRrsp);
        allocation.rrspFromSavings = (allocation.rrspFromSavings || 0) + Math.max(0, extraRrsp);
      }
      decisionName = yr1Option.name + (lumpThisYear > 0 ? ' +Lump' : '');
    } else {
      const dividendsReceived = Math.round((yrDividendYieldPct / 100) * state.currentNonReg);
      const cashPool = priorYearRefund + dividendsReceived + lumpThisYear;
      allocation = resolveOngoingAllocation(ongoingStrategy, formData, room, state, cashPool);
      decisionName = ongoingStrategy.name + (lumpThisYear > 0 ? ' +Lump' : '');
    }

    const clampedAllocation = constraints.clamp(allocation, state);
    const { yearRow, nextState } = simulateYear(state, config, clampedAllocation, rateOverrides);

    const tfsaContrib = (clampedAllocation.tfsaFromHeloc || 0) + (clampedAllocation.tfsaFromSavings || 0);
    constraints.consume({ tfsaContrib, rrspContrib: clampedAllocation.rrspContrib || 0 });

    decisions.push({ year, name: decisionName });
    yearRows.push(yearRow);
    priorYearRefund = yearRow.taxRefund;
    state = nextState;
  }

  const lastYearRow = yearRows[yearRows.length - 1];
  const afterTaxScore = computeAfterTaxScore(lastYearRow, config);

  return {
    yr1Name: yr1Option.name,
    ongoingName: ongoingStrategy.name,
    score: afterTaxScore,
    decisions,
    yearRows,
    lastYearRow,
  };
}

// ============================================================================
// Single Strategy Runner — for robustness analysis
// ============================================================================

export function runSingleStrategyByName(formData, yr1Name, ongoingName, scenarioOverrides = null) {
  const config = createConfig(formData);
  const baseRates = {
    mortgageRate: config.baseMortgageRatePct,
    helocRate: config.baseHelocRatePct,
    taxRate: config.taxRate * 100,
    annualReturn: config.baseAnnualReturnPct,
    growthRate: config.baseGrowthRatePct,
    dividendYield: config.baseDividendYieldPct,
    inflationRate: config.baseInflationRatePct,
  };

  const yr1Options = getYear1Options(formData);
  const ongoingStrategies = getOngoingStrategies();

  const yr1 = yr1Options.find(o => o.name === yr1Name) || yr1Options[0];
  const ongoing = ongoingStrategies.find(s => s.name === ongoingName) || ongoingStrategies[0];

  const result = runSingleStrategy(formData, yr1, ongoing, config, scenarioOverrides, baseRates);
  return {
    netWealth: Math.round(result.score),
    yr1Name: result.yr1Name,
    ongoingName: result.ongoingName,
  };
}

// ============================================================================
// Main Entry Point
// ============================================================================

export function runPathExplorer(formData, scenarioOverrides = null, smartResult = null, beamWidth = 50, onProgress = null) {
  const config = createConfig(formData);

  const baseRates = {
    mortgageRate: config.baseMortgageRatePct,
    helocRate: config.baseHelocRatePct,
    taxRate: config.taxRate * 100,
    annualReturn: config.baseAnnualReturnPct,
    growthRate: config.baseGrowthRatePct,
    dividendYield: config.baseDividendYieldPct,
    inflationRate: config.baseInflationRatePct,
  };

  const yr1Options = getYear1Options(formData);
  const ongoingStrategies = getOngoingStrategies();

  // Run ALL combinations independently
  const allResults = [];
  const totalCombos = yr1Options.length * ongoingStrategies.length;
  let completed = 0;

  for (const yr1Opt of yr1Options) {
    for (const ongoing of ongoingStrategies) {
      const result = runSingleStrategy(formData, yr1Opt, ongoing, config, scenarioOverrides, baseRates);
      allResults.push(result);
      completed++;
      if (onProgress) {
        onProgress(Math.round((completed / totalCombos) * 100));
      }
    }
  }

  if (onProgress) onProgress(100);

  // Sort by after-tax score
  allResults.sort((a, b) => b.score - a.score);

  // Build top 3 routes
  const topRoutes = allResults.slice(0, 3).map((r, idx) => ({
    rank: idx + 1,
    netWealth: Math.round(r.score),
    portfolio: Math.round(r.lastYearRow?.portfolioValue || 0),
    helocBalance: Math.round(r.lastYearRow?.helocBalance || 0),
    mortgageBalance: Math.round(r.lastYearRow?.mortgageBalance || 0),
    tfsaValue: Math.round(r.lastYearRow?.tfsaValue || 0),
    rrspValue: Math.round(r.lastYearRow?.rrspValue || 0),
    nonRegValue: Math.round(r.lastYearRow?.nonRegValue || 0),
    decisions: r.decisions,
    yearByYearData: r.yearRows,
    summary: summarizeRoute(r.decisions),
    strategyLabel: `${r.yr1Name} → ${r.ongoingName}`,
  }));

  // Distribution stats
  const allScores = allResults.map(r => r.score);
  const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  // Compare with smart adaptive
  let smartComparison = null;
  if (smartResult) {
    const smartData = smartResult.data || smartResult;
    const smartLastYear = Array.isArray(smartData) ? smartData[smartData.length - 1] : null;
    const smartNetWealth = smartLastYear ? computeAfterTaxScore(smartLastYear, config) : 0;

    const bestRoute = topRoutes[0];
    smartComparison = {
      smartNetWealth: Math.round(smartNetWealth),
      bestRouteNetWealth: bestRoute.netWealth,
      difference: Math.round(bestRoute.netWealth - smartNetWealth),
      differencePct: smartNetWealth > 0 ? ((bestRoute.netWealth - smartNetWealth) / smartNetWealth * 100).toFixed(1) : 'N/A',
      verdict: bestRoute.netWealth <= smartNetWealth * 1.02
        ? '✅ Smart Adaptive is near-optimal (within 2% of best route found)'
        : bestRoute.netWealth <= smartNetWealth * 1.10
        ? '⚠️ Smart Adaptive is good — best route is ' + ((bestRoute.netWealth - smartNetWealth) / smartNetWealth * 100).toFixed(1) + '% better'
        : '❌ Found significantly better route — ' + ((bestRoute.netWealth - smartNetWealth) / smartNetWealth * 100).toFixed(1) + '% improvement possible',
    };
  }

  return {
    iterations: allResults.length,
    topRoutes,
    smartComparison,
    distribution: {
      min: Math.round(allScores[allScores.length - 1]),
      max: Math.round(allScores[0]),
      avg: Math.round(avgScore),
      median: Math.round(allScores[Math.floor(allScores.length / 2)]),
    },
    best: topRoutes[0] || {},
    worst: { netWealth: Math.round(allScores[allScores.length - 1] || 0) },
    median: { netWealth: Math.round(allScores[Math.floor(allScores.length / 2)] || 0) },
    percentile5: { netWealth: Math.round(allScores[Math.floor(allScores.length * 0.05)] || 0) },
    percentile95: { netWealth: Math.round(allScores[Math.floor(allScores.length * 0.95)] || 0) },
    avgNetWealth: Math.round(avgScore),
    namedStrategies: topRoutes.map(r => ({
      name: `Route #${r.rank}: ${r.strategyLabel || r.summary[0]?.name || 'Optimal'}`,
      description: r.strategyLabel || r.summary.map(s => `Y${s.fromYear}-${s.toYear}: ${s.name}`).join(' → '),
      netWealth: r.netWealth,
      portfolio: r.portfolio,
      heloc: r.helocBalance,
      tfsa: r.tfsaValue,
      rrsp: r.rrspValue,
      nonReg: r.nonRegValue,
    })),
    // Full ranked list for deeper analysis
    allStrategies: allResults.map((r, idx) => ({
      rank: idx + 1,
      yr1: r.yr1Name,
      ongoing: r.ongoingName,
      netWealth: Math.round(r.score),
      portfolio: Math.round(r.lastYearRow?.portfolioValue || 0),
      tfsaValue: Math.round(r.lastYearRow?.tfsaValue || 0),
      rrspValue: Math.round(r.lastYearRow?.rrspValue || 0),
      nonRegValue: Math.round(r.lastYearRow?.nonRegValue || 0),
      helocBalance: Math.round(r.lastYearRow?.helocBalance || 0),
      mortgageBalance: Math.round(r.lastYearRow?.mortgageBalance || 0),
    })),
  };
}

/**
 * Summarize a route by grouping consecutive identical decisions
 */
function summarizeRoute(decisions) {
  if (!decisions.length) return [];
  const summary = [];
  let current = { fromYear: decisions[0].year, toYear: decisions[0].year, name: decisions[0].name };

  for (let i = 1; i < decisions.length; i++) {
    if (decisions[i].name === current.name) {
      current.toYear = decisions[i].year;
    } else {
      summary.push({ ...current });
      current = { fromYear: decisions[i].year, toYear: decisions[i].year, name: decisions[i].name };
    }
  }
  summary.push(current);
  return summary;
}