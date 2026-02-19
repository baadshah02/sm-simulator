import { getProvincialTaxRate } from '@/lib/provinceData';

// Helper to build a complete preset with tax rate auto-calculated
function makePreset(overrides) {
    const province = overrides.province || 'ON';
    const bracket = overrides.taxBracket || 'high';
    const taxRate = getProvincialTaxRate(province, bracket) || 48.35;

    return {
        initialMortgage: 500000,
        mortgageRate: 4.5,
        mortgageType: 'fixed',
        amortYears: 25,
        helocRate: 5.5,
        province: 'ON',
        taxBracket: 'high',
        taxRate,
        annualReturn: 7,
        growthRate: 7,
        dividendYield: 1.5,
        inflationRate: 2.0,
        initialTfsa: 0,
        tfsaRoomYear1: 7000,
        annualTfsaIncrease: 7000,
        tfsaFundingSource: 'savings',
        rrspYear1: 10000,
        rrspOngoing: 10000,
        rrspFundingSource: 'savings',
        retirementTaxRate: 20,
        initialHelocAvailable: 100000,
        optimizationMode: 'classic',
        baseSalary: 100000,
        employerRrspMatch: 0,
        rrspRoomTotal: 50000,
        lumpSumAmount: 0,
        lumpSumYear: '1',
        prepaymentLimit: 15,
        ...overrides,
    };
}

export const PRESETS = [
    {
        id: 'vanilla-sm',
        name: 'Vanilla SM',
        icon: '🔄',
        description: 'Pure SM — no TFSA/RRSP, no initial HELOC',
        formData: makePreset({
            initialMortgage: 500000,
            mortgageRate: 4.5,
            amortYears: 25,
            helocRate: 5.5,
            taxBracket: 'mid',
            annualReturn: 7,
            growthRate: 7,
            dividendYield: 2.0,
            initialTfsa: 0,
            tfsaRoomYear1: 0,
            annualTfsaIncrease: 0,
            tfsaFundingSource: 'savings',
            rrspYear1: 0,
            rrspOngoing: 0,
            rrspFundingSource: 'savings',
            retirementTaxRate: 20,
            initialHelocAvailable: 0,
            baseSalary: 80000,
            employerRrspMatch: 0,
            rrspRoomTotal: 0,
        }),
    },
];