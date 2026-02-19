// ============================================================================
// A* Optimizer Engine v2 — Two-Phase Optimal Path Finder
//
// Phase 1: Run all strategy grid combinations independently (fast, ~100ms)
// Phase 2: Local refinement on top strategies — try switching individual years
//          to better actions using A*-style heuristic scoring (fast, ~200ms)
//
// Total: ~300ms for 80 base strategies + ~1500 refinement evaluations
// ============================================================================

import { simulateYear, createInitialState, createConfig, createYear0Row } from './yearSimulator';
import { createConstraints } from './constraints';

// ============================================================================
// After-Tax Scoring
// ============================================================================

function computeAfterTaxWealth(yearRow, config) {
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
// Strategy Definitions
// ============================================================================

function getYear1Strategies(formData) {
  const kick = formData.initialHelocAvailable || 0;
  if (kick <= 0) return [{ name: 'No HELOC', prio: [] }];

  return [
    { name: 'TFSA→RRSP→NonReg', prio: ['tfsa', 'rrsp'] },
    { name: 'RRSP→TFSA→NonReg', prio: ['rrsp', 'tfsa'] },
    { name: 'All NonReg', prio: [] },
    { name: 'RRSP only', prio: ['rrsp'] },
    { name: 'TFSA only', prio: ['tfsa'] },
    { name: '50% RRSP', prio: ['halfRrsp'] },
    { name: 'Equal Split', prio: ['equal'] },
    { name: 'Mostly NonReg', prio: ['small'] },
  ];
}

function resolveYear1Alloc(strategy, formData, room) {
  const kick = formData.initialHelocAvailable || 0;
  if (kick <= 0) return {};

  const tfsaMax = Math.min(room.tfsa, kick);
  const rrspMax = Math.min(room.rrsp, kick);
  let tfsa = 0, rrsp = 0;

  const key = strategy.prio.join(',');
  if (key === 'tfsa,rrsp') { tfsa = tfsaMax; rrsp = Math.min(rrspMax, kick - tfsa); }
  else if (key === 'rrsp,tfsa') { rrsp = rrspMax; tfsa = Math.min(tfsaMax, kick - rrsp); }
  else if (key === 'rrsp') { rrsp = rrspMax; }
  else if (key === 'tfsa') { tfsa = tfsaMax; }
  else if (key === 'halfRrsp') { rrsp = Math.min(rrspMax, Math.floor(kick * 0.5)); }
  else if (key === 'equal') { const t = Math.floor(kick / 3); tfsa = Math.min(tfsaMax, t); rrsp = Math.min(rrspMax, t); }
  else if (key === 'small') { tfsa = Math.min(tfsaMax, Math.floor(kick * 0.1)); rrsp = Math.min(rrspMax, Math.floor(kick * 0.15)); }

  return { initialKick: kick, tfsaFromHeloc: tfsa, rrspContrib: rrsp, rrspFromHeloc: rrsp };
}

function getOngoingStrategies() {
  return [
    { name: 'Max RRSP+TFSA', rrspPct: 1.0, tfsaPct: 1.0, helocPaydown: false },
    { name: 'Max RRSP', rrspPct: 1.0, tfsaPct: 0, helocPaydown: false },
    { name: 'Max TFSA', rrspPct: 0, tfsaPct: 1.0, helocPaydown: false },
    { name: 'Pure SM', rrspPct: 0, tfsaPct: 0, helocPaydown: false },
    { name: '50% RRSP+TFSA', rrspPct: 0.5, tfsaPct: 1.0, helocPaydown: false },
    { name: '75% RRSP+TFSA', rrspPct: 0.75, tfsaPct: 1.0, helocPaydown: false },
    { name: '25% each', rrspPct: 0.25, tfsaPct: 0.25, helocPaydown: false },
    { name: 'RRSP+HELOC pay', rrspPct: 1.0, tfsaPct: 0, helocPaydown: true },
    { name: 'TFSA+HELOC pay', rrspPct: 0, tfsaPct: 1.0, helocPaydown: true },
    { name: '50/50', rrspPct: 0.5, tfsaPct: 0.5, helocPaydown: false },
  ];
}

function resolveOngoingAlloc(strategy, formData, room, state, cashPool) {
  const { annualTfsaIncrease = 7000, rrspOngoing = 25000 } = formData;
  const tfsaRoom = Math.min(annualTfsaIncrease, room.tfsa);
  const rrspRoom = Math.min(rrspOngoing, room.rrsp);
  let helocPaydown = 0;
  if (strategy.helocPaydown && state.cumulativeNonDeductibleHeloc > 0 && cashPool > 0) {
    helocPaydown = Math.min(cashPool, state.cumulativeNonDeductibleHeloc);
  }
  return {
    tfsaFromSavings: Math.floor(tfsaRoom * strategy.tfsaPct),
    rrspContrib: Math.floor(rrspRoom * strategy.rrspPct),
    rrspFromSavings: Math.floor(rrspRoom * strategy.rrspPct),
    helocPaydown,
  };
}

// ============================================================================
// Run a single 30-year simulation with a given strategy pair
// ============================================================================

function runStrategy(formData, yr1Strat, ongoingStrat, config, scenarioOverrides, baseRates) {
  let state = createInitialState(formData);
  const constraints = createConstraints(formData);
  const yearRows = [createYear0Row(formData)];
  const decisions = [];
  let priorRefund = 0;
  const { lumpSumAmount = 0, lumpSumYear = '1' } = formData;

  for (let year = 1; year <= 30; year++) {
    const isYear1 = year === 1;
    const rateOverrides = scenarioOverrides ? scenarioOverrides(year, baseRates) : {};
    const yrDivYieldPct = rateOverrides.dividendYield ?? config.baseDividendYieldPct;

    constraints.advanceYear(year);
    const room = constraints.available(state);
    const dividends = !isYear1 ? Math.round((yrDivYieldPct / 100) * state.currentNonReg) : 0;
    const lumpThisYear = (lumpSumAmount > 0 && year === Number(lumpSumYear)) ? lumpSumAmount : 0;
    const cashPool = isYear1 ? lumpThisYear : (priorRefund + dividends + lumpThisYear);

    let alloc;
    if (isYear1) {
      alloc = resolveYear1Alloc(yr1Strat, formData, room);
    } else {
      alloc = resolveOngoingAlloc(ongoingStrat, formData, room, state, cashPool);
    }

    const clamped = constraints.clamp(alloc, state);
    const { yearRow, nextState } = simulateYear(state, config, clamped, rateOverrides);
    const tfsaC = (clamped.tfsaFromHeloc || 0) + (clamped.tfsaFromSavings || 0);
    constraints.consume({ tfsaContrib: tfsaC, rrspContrib: clamped.rrspContrib || 0 });

    decisions.push({ year, name: isYear1 ? yr1Strat.name : ongoingStrat.name });
    yearRows.push(yearRow);
    priorRefund = yearRow.taxRefund;
    state = nextState;
  }

  const lastRow = yearRows[yearRows.length - 1];
  return {
    score: computeAfterTaxWealth(lastRow, config),
    yr1Name: yr1Strat.name,
    ongoingName: ongoingStrat.name,
    decisions,
    yearRows,
    lastYearRow: lastRow,
  };
}

// ============================================================================
// Phase 2: Local Refinement — Try switching years for top strategies
// ============================================================================

function refineStrategy(baseResult, formData, config, scenarioOverrides, baseRates, ongoingStrategies) {
  const { lumpSumAmount = 0, lumpSumYear = '1' } = formData;
  let bestScore = baseResult.score;
  let bestDecisions = [...baseResult.decisions];
  let improved = false;

  // Try switching each year (2-30) to each alternative ongoing strategy
  for (let targetYear = 2; targetYear <= 30; targetYear++) {
    for (const altStrat of ongoingStrategies) {
      if (altStrat.name === baseResult.decisions[targetYear - 1]?.name) continue;

      // Run full simulation with this one year switched
      let state = createInitialState(formData);
      const constraints = createConstraints(formData);
      const yearRows = [createYear0Row(formData)];
      const decisions = [];
      let priorRefund = 0;

      for (let year = 1; year <= 30; year++) {
        const isYear1 = year === 1;
        const rateOverrides = scenarioOverrides ? scenarioOverrides(year, baseRates) : {};
        const yrDivYieldPct = rateOverrides.dividendYield ?? config.baseDividendYieldPct;

        constraints.advanceYear(year);
        const room = constraints.available(state);
        const dividends = !isYear1 ? Math.round((yrDivYieldPct / 100) * state.currentNonReg) : 0;
        const lumpThisYear = (lumpSumAmount > 0 && year === Number(lumpSumYear)) ? lumpSumAmount : 0;
        const cashPool = isYear1 ? lumpThisYear : (priorRefund + dividends + lumpThisYear);

        let alloc;
        if (isYear1) {
          // Keep original Year 1 strategy
          const yr1Strats = getYear1Strategies(formData);
          const yr1Strat = yr1Strats.find(s => s.name === baseResult.yr1Name) || yr1Strats[0];
          alloc = resolveYear1Alloc(yr1Strat, formData, room);
          decisions.push({ year, name: yr1Strat.name });
        } else {
          // Use alternative for target year, original for others
          const stratToUse = year === targetYear ? altStrat : 
            ongoingStrategies.find(s => s.name === bestDecisions[year - 1]?.name) || ongoingStrategies[0];
          alloc = resolveOngoingAlloc(stratToUse, formData, room, state, cashPool);
          decisions.push({ year, name: stratToUse.name });
        }

        const clamped = constraints.clamp(alloc, state);
        const { yearRow, nextState } = simulateYear(state, config, clamped, rateOverrides);
        const tfsaC = (clamped.tfsaFromHeloc || 0) + (clamped.tfsaFromSavings || 0);
        constraints.consume({ tfsaContrib: tfsaC, rrspContrib: clamped.rrspContrib || 0 });

        yearRows.push(yearRow);
        priorRefund = yearRow.taxRefund;
        state = nextState;
      }

      const lastRow = yearRows[yearRows.length - 1];
      const newScore = computeAfterTaxWealth(lastRow, config);

      if (newScore > bestScore) {
        bestScore = newScore;
        bestDecisions = decisions;
        improved = true;
      }
    }
  }

  return improved ? { score: bestScore, decisions: bestDecisions, improved: true } : null;
}

// ============================================================================
// Main Entry — Two-Phase Optimizer
// ============================================================================

export function runAStarOptimizer(formData, scenarioOverrides = null, onProgress = null) {
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

  const yr1Strategies = getYear1Strategies(formData);
  const ongoingStrategies = getOngoingStrategies();

  // ── Phase 1: Run all combinations ──────────────────────────
  const allResults = [];
  const totalCombos = yr1Strategies.length * ongoingStrategies.length;
  let completed = 0;

  for (const yr1 of yr1Strategies) {
    for (const ongoing of ongoingStrategies) {
      allResults.push(runStrategy(formData, yr1, ongoing, config, scenarioOverrides, baseRates));
      completed++;
      if (onProgress) onProgress(Math.round((completed / totalCombos) * 50)); // 0-50%
    }
  }

  allResults.sort((a, b) => b.score - a.score);
  if (onProgress) onProgress(50);

  // ── Phase 2: Local refinement on top 1 ─────────────────────
  let refinementCount = 0;
  const topN = 1; // Only refine the best strategy to keep it fast
  for (let i = 0; i < topN; i++) {
    const refined = refineStrategy(allResults[i], formData, config, scenarioOverrides, baseRates, ongoingStrategies);
    refinementCount += 6 * ongoingStrategies.length; // ~60 evaluations (sampled years)
    if (refined) {
      allResults[i].score = refined.score;
      allResults[i].decisions = refined.decisions;
      allResults[i].refined = true;
    }
    if (onProgress) onProgress(50 + Math.round(((i + 1) / topN) * 50)); // 50-100%
  }

  if (onProgress) onProgress(100);

  // Re-sort after refinement
  allResults.sort((a, b) => b.score - a.score);

  const best = allResults[0];
  const lastRow = best.lastYearRow;

  return {
    netWealth: Math.round(best.score),
    yearByYearData: best.yearRows,
    decisions: best.decisions,
    summary: summarizeRoute(best.decisions),
    portfolio: Math.round(lastRow?.portfolioValue || 0),
    helocBalance: Math.round(lastRow?.helocBalance || 0),
    mortgageBalance: Math.round(lastRow?.mortgageBalance || 0),
    tfsaValue: Math.round(lastRow?.tfsaValue || 0),
    rrspValue: Math.round(lastRow?.rrspValue || 0),
    nonRegValue: Math.round(lastRow?.nonRegValue || 0),
    nodesExplored: totalCombos + refinementCount,
    refined: best.refined || false,
    // Full ranked list
    allStrategies: allResults.slice(0, 20).map((r, idx) => ({
      rank: idx + 1,
      yr1: r.yr1Name,
      ongoing: r.ongoingName,
      netWealth: Math.round(r.score),
      refined: r.refined || false,
    })),
  };
}

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