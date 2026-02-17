/**
 * Risk Scenario Definitions
 * 
 * Each scenario provides a yearOverrides function that receives
 * (year, baseRates) and returns modified rates for that year.
 * The engine applies these overrides inside the simulation loop.
 */

export const SCENARIOS = [
    {
        id: 'base',
        name: 'Base Case',
        icon: '📊',
        description: 'No shocks — uses your inputs as-is',
        yearOverrides: () => ({}), // no changes
    },
    {
        id: 'crash-2008',
        name: '2008 Crash',
        icon: '📉',
        description: '-38% crash in Year 3, 4-year recovery',
        yearOverrides: (year, baseRates) => {
            // Simulate GFC-style market crash
            if (year === 3) return { annualReturn: -38, growthRate: -38, dividendYield: baseRates.dividendYield * 0.7 };
            if (year === 4) return { annualReturn: -5, growthRate: -5, dividendYield: baseRates.dividendYield * 0.8 };
            if (year === 5) return { annualReturn: 15, growthRate: 15 }; // recovery bounce
            if (year === 6) return { annualReturn: 12, growthRate: 12 }; // continued recovery
            return {};
        },
    },
    {
        id: 'rate-shock',
        name: 'Rate Shock',
        icon: '📈',
        description: 'HELOC +2% from Year 2, mortgage +1.5% at renewal',
        yearOverrides: (year, baseRates) => {
            const overrides = {};
            // HELOC rate rises starting Year 2
            if (year >= 2) {
                overrides.helocRate = baseRates.helocRate + 2.0;
            }
            // Mortgage renewal shock at Year 5
            if (year >= 5) {
                overrides.mortgageRate = baseRates.mortgageRate + 1.5;
            }
            return overrides;
        },
    },
    {
        id: 'stagflation',
        name: 'Stagflation',
        icon: '🐌',
        description: 'Returns halved + rates +1.5% for 10 years',
        yearOverrides: (year, baseRates) => {
            if (year <= 10) {
                return {
                    annualReturn: baseRates.annualReturn / 2,
                    growthRate: baseRates.growthRate / 2,
                    helocRate: baseRates.helocRate + 1.5,
                    mortgageRate: baseRates.mortgageRate + 1.0,
                    inflationRate: 4.0,
                };
            }
            return {};
        },
    },
    {
        id: 'lost-decade',
        name: 'Lost Decade',
        icon: '⏳',
        description: '2% returns for Years 1-10, then normal',
        yearOverrides: (year) => {
            if (year <= 10) {
                return {
                    annualReturn: 2,
                    growthRate: 2,
                    dividendYield: 1.0,
                };
            }
            return {};
        },
    },
];

/**
 * Get a scenario by ID
 */
export function getScenarioById(id) {
    return SCENARIOS.find(s => s.id === id) || SCENARIOS[0];
}
