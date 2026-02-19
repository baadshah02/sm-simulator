// ============================================================================
// Classic SM Engine — backward-compatible wrapper
// Replicates the original generateFinancialData behavior using yearSimulator.
// This is the default mode ("Classic SM").
// ============================================================================

import { simulateYear, createInitialState, createConfig, createYear0Row } from './yearSimulator';
import { createConstraints } from './constraints';

/**
 * Run the Classic Smith Manoeuvre simulation.
 * Uses fixed allocation rules (same as original code):
 *   Year 1: HELOC → TFSA + RRSP + Non-Reg (remainder)
 *   Year 2+: TFSA from savings, RRSP ongoing, rest via SM P formula
 *
 * @param {object} formData - form inputs
 * @param {function|null} scenarioOverrides - (year, baseRates) => overrides
 * @returns {Array} 31 rows (Year 0..30)
 */
export function runClassicEngine(formData, scenarioOverrides = null) {
  const {
    tfsaRoomYear1 = 42000,
    annualTfsaIncrease = 7000,
    rrspYear1 = 50000,
    rrspOngoing = 25000,
    initialHelocAvailable = 0,
    tfsaFundingSource = 'heloc',
    rrspFundingSource = 'heloc',
  } = formData;

  const config = createConfig(formData);
  const constraints = createConstraints(formData);
  let state = createInitialState(formData);
  const data = [createYear0Row(formData)];

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

  for (let year = 1; year <= 30; year++) {
    const isYear1 = year === 1;

    // Advance constraints (adds new TFSA/RRSP room for year 2+)
    constraints.advanceYear(year);

    // Determine allocations based on classic SM rules
    const rrspContrib = isYear1 ? rrspYear1 : rrspOngoing;

    // TFSA funding
    const tfsaFromHeloc = tfsaFundingSource === 'heloc'
      ? (isYear1 ? tfsaRoomYear1 : 0)
      : 0;
    const tfsaFromSavings = tfsaFundingSource === 'savings'
      ? (isYear1 ? tfsaRoomYear1 : annualTfsaIncrease)
      : (isYear1 ? 0 : annualTfsaIncrease);

    // RRSP funding
    const rrspFromHeloc = rrspFundingSource === 'heloc' ? rrspContrib : 0;
    const rrspFromSavings = rrspFundingSource === 'savings' ? rrspContrib : 0;

    // Year 1 HELOC kick
    const initialKick = isYear1 ? initialHelocAvailable : 0;

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

    // Get scenario rate overrides for this year
    const rateOverrides = scenarioOverrides ? scenarioOverrides(year, baseRates) : {};

    // Simulate the year
    const { yearRow, nextState } = simulateYear(state, config, clampedAllocation, rateOverrides);

    // Consume room
    const tfsaContrib = (clampedAllocation.tfsaFromHeloc || 0) + (clampedAllocation.tfsaFromSavings || 0);
    constraints.consume({
      tfsaContrib,
      rrspContrib: clampedAllocation.rrspContrib,
    });

    data.push(yearRow);
    state = nextState;

    // Stop if mortgage is paid off and no more activity
    // (but continue to show investment growth)
  }

  return data;
}