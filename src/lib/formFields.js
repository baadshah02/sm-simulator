export const FORM_FIELDS = [
  // ── Mortgage Settings ──────────────────────────────────
  {
    section: 'Mortgage Settings',
    fields: [
      {
        name: 'initialMortgage',
        label: 'Initial Mortgage:',
        tooltipContent: 'The total amount of your current mortgage balance. This is the starting debt that will be paid down through the Smith Manoeuvre strategy.'
      },
      {
        name: 'mortgageRate',
        label: 'Mortgage Rate (%):',
        step: '0.01',
        tooltipContent: 'Your mortgage interest rate as an annual percentage. This is used to calculate your monthly mortgage payment and interest costs.'
      },
      {
        name: 'mortgageType',
        label: 'Mortgage Type:',
        type: 'select',
        options: [
          { value: 'fixed', label: 'Fixed (Semi-Annual Compounding)' },
          { value: 'variable', label: 'Variable (Monthly Compounding)' }
        ],
        tooltipContent: 'Canadian fixed-rate mortgages compound semi-annually (Interest Act). Variable-rate mortgages compound monthly. This affects your effective interest rate and monthly payment.'
      },
      {
        name: 'amortYears',
        label: 'Amortization Years:',
        tooltipContent: 'The total number of years over which your mortgage would be paid off with regular payments. Typically 25-30 years for Canadian mortgages.'
      },
      {
        name: 'prepaymentLimit',
        label: 'Prepayment Limit (%):',
        step: '1',
        tooltipContent: 'Maximum annual lump-sum prepayment as a percentage of the original mortgage amount. Typically 10-20% for Canadian mortgages. Set to 100 for unlimited.'
      },
    ]
  },

  // ── HELOC & Tax ──────────────────────────────────
  {
    section: 'HELOC & Tax Settings',
    fields: [
      {
        name: 'helocRate',
        label: 'HELOC Rate (%):',
        step: '0.01',
        tooltipContent: 'Home Equity Line of Credit interest rate. Usually higher than mortgage rates. This rate applies to money borrowed from your HELOC for investments.'
      },
      {
        name: 'province',
        label: 'Province:',
        type: 'select',
        options: 'provinces', // special flag to use province data
        tooltipContent: 'Select your province to auto-fill combined federal + provincial marginal tax rate. Choose "Custom" to enter your own rate.'
      },
      {
        name: 'taxBracket',
        label: 'Income Bracket:',
        type: 'select',
        options: [
          { value: 'low', label: 'Low ($0 - $55K)' },
          { value: 'mid', label: 'Mid ($55K - $100K)' },
          { value: 'high', label: 'High ($100K - $220K)' },
          { value: 'top', label: 'Top ($220K+)' }
        ],
        tooltipContent: 'Your approximate income bracket. This determines which provincial marginal tax rate is used for calculations.'
      },
      {
        name: 'taxRate',
        label: 'Tax Rate (%):',
        step: '0.01',
        tooltipContent: 'Your marginal tax rate (combined federal + provincial). Auto-filled from province/bracket selection, or enter a custom rate.'
      },
      {
        name: 'initialHelocAvailable',
        label: 'Initial HELOC Available:',
        tooltipContent: 'Total HELOC credit limit available at the start. This funds Year 1 investments (TFSA + RRSP + initial non-registered). Usually 65-80% of home value minus mortgage.'
      },
    ]
  },

  // ── Investment Returns ──────────────────────────────────
  {
    section: 'Investment Returns',
    fields: [
      {
        name: 'annualReturn',
        label: 'Annual Return (%):',
        step: '0.01',
        tooltipContent: 'Expected annual return for TFSA and RRSP investments. Historically, diversified portfolios return 6-8% annually over the long term.'
      },
      {
        name: 'growthRate',
        label: 'Growth Rate (%):',
        step: '0.01',
        tooltipContent: 'Expected annual growth rate for non-registered (taxable) investments. Often similar to annual return but may be higher for growth-focused portfolios.'
      },
      {
        name: 'dividendYield',
        label: 'Dividend Yield (%):',
        step: '0.01',
        tooltipContent: 'Annual dividend yield from your non-registered investments. Dividends provide cash flow that can be reinvested monthly as part of the strategy.'
      },
      {
        name: 'inflationRate',
        label: 'Inflation Rate (%):',
        step: '0.01',
        tooltipContent: 'Expected average annual inflation rate. Used to show inflation-adjusted (real) portfolio values in today\'s dollars. Bank of Canada targets 2%.'
      },
    ]
  },

  // ── TFSA Settings ──────────────────────────────────
  {
    section: 'TFSA Settings',
    fields: [
      {
        name: 'initialTfsa',
        label: 'Initial TFSA Value:',
        tooltipContent: 'Current value of your existing TFSA investments. If starting fresh, this could be $0. Used as the baseline for your tax-free savings account.'
      },
      {
        name: 'tfsaRoomYear1',
        label: 'TFSA Room Year 1:',
        tooltipContent: 'Available TFSA contribution room for the first year. Check your CRA account for your exact contribution limit.'
      },
      {
        name: 'annualTfsaIncrease',
        label: 'Annual TFSA Increase:',
        tooltipContent: 'Annual TFSA contribution room increase (typically $7,000 in 2024). In subsequent years, this is funded from savings.'
      },
      {
        name: 'tfsaFundingSource',
        label: 'TFSA Funding Source:',
        type: 'select',
        options: [
          { value: 'heloc', label: 'HELOC (Year 1 room from HELOC)' },
          { value: 'savings', label: 'Savings (all years from savings)' }
        ],
        tooltipContent: 'Choose whether to fund TFSA from HELOC (Year 1 room borrowed from HELOC, subsequent years from savings) or entirely from personal savings. HELOC-funded TFSA interest is NOT tax-deductible.'
      },
    ]
  },

  // ── RRSP Settings ──────────────────────────────────
  {
    section: 'RRSP Settings',
    fields: [
      {
        name: 'rrspYear1',
        label: 'RRSP Year 1:',
        tooltipContent: 'RRSP contribution for the first year. This larger amount generates a substantial tax refund that kicks off the strategy.'
      },
      {
        name: 'rrspOngoing',
        label: 'RRSP Ongoing:',
        tooltipContent: 'Annual RRSP contribution for years 2 and beyond. Typically lower than Year 1.'
      },
      {
        name: 'rrspFundingSource',
        label: 'RRSP Funding Source:',
        type: 'select',
        options: [
          { value: 'heloc', label: 'HELOC (borrowed from HELOC)' },
          { value: 'savings', label: 'Savings (from personal savings)' }
        ],
        tooltipContent: 'Choose whether to fund RRSP from HELOC or personal savings. HELOC-funded RRSP interest is NOT tax-deductible, but the RRSP contribution itself still generates a tax refund.'
      },
      {
        name: 'retirementTaxRate',
        label: 'Retirement Tax Rate (%):',
        step: '0.01',
        tooltipContent: 'Expected marginal tax rate when you withdraw RRSP funds in retirement. Typically lower than working years. Used to calculate after-tax RRSP value (true wealth).'
      },
    ]
  },

  // ── Optimization Settings ──────────────────────────────────
  {
    section: 'Optimization Settings',
    smartOnly: true,
    fields: [
      {
        name: 'optimizationMode',
        label: 'Allocation Mode:',
        type: 'select',
        options: [
          { value: 'classic', label: 'Classic SM (fixed allocations)' },
          { value: 'optimizer', label: '🎯 Optimizer (A* search + alternatives)' },
        ],
        tooltipContent: 'Classic: fixed RRSP/TFSA allocations each year. Optimizer: uses A* algorithm with marginal analysis to find provably optimal allocation path, plus shows alternative strategies for comparison.'
      },
      {
        name: 'lumpSumAmount',
        label: 'Lump Sum Amount:',
        tooltipContent: 'One-time cash windfall from outside savings (bonus, inheritance, etc.). The optimizer will determine the best use: TFSA, RRSP, mortgage prepayment, or combinations.'
      },
      {
        name: 'lumpSumYear',
        label: 'Lump Sum Year:',
        type: 'select',
        options: [
          { value: '1', label: 'Year 1' }, { value: '2', label: 'Year 2' }, { value: '3', label: 'Year 3' },
          { value: '4', label: 'Year 4' }, { value: '5', label: 'Year 5' }, { value: '6', label: 'Year 6' },
          { value: '7', label: 'Year 7' }, { value: '8', label: 'Year 8' }, { value: '9', label: 'Year 9' },
          { value: '10', label: 'Year 10' }, { value: '15', label: 'Year 15' }, { value: '20', label: 'Year 20' },
          { value: '25', label: 'Year 25' }, { value: '30', label: 'Year 30' },
        ],
        tooltipContent: 'Which year you receive the lump sum. Default is Year 1. The optimizer will test all deployment options for this year.'
      },
      {
        name: 'baseSalary',
        label: 'Base Salary:',
        tooltipContent: 'Your annual earned income (base salary before RSU/bonus). Used to calculate RRSP room replenishment each year (18% of earned income).'
      },
      {
        name: 'employerRrspMatch',
        label: 'Employer RRSP Match (%):',
        step: '0.5',
        tooltipContent: 'Your employer\'s RRSP contribution as a percentage of your base salary. This is subtracted from annual RRSP room replenishment since it uses up room.'
      },
      {
        name: 'rrspRoomTotal',
        label: 'Total RRSP Room:',
        tooltipContent: 'Your total available RRSP contribution room from CRA. This is tracked and depleted as contributions are made. New room is added annually from earned income.'
      },
    ]
  },
];

// Generic defaults for public users
export const DEFAULT_FORM_DATA = {
  initialMortgage: 500000,
  mortgageRate: 4.5,
  mortgageType: 'fixed',
  amortYears: 25,
  prepaymentLimit: 15,
  helocRate: 5.5,
  province: 'ON',
  taxBracket: 'high',
  taxRate: 48.35,
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
  // Optimization fields
  optimizationMode: 'classic',
  baseSalary: 100000,
  employerRrspMatch: 0,
  rrspRoomTotal: 50000,
  lumpSumAmount: 0,
  lumpSumYear: '1',
};

// Personal profile — only loaded via /jay URL
export const JAY_PROFILE = {
  initialMortgage: 1091000,
  mortgageRate: 3.65,
  mortgageType: 'fixed',
  amortYears: 30,
  prepaymentLimit: 10,
  helocRate: 4.70,
  province: 'ON',
  taxBracket: 'top',
  taxRate: 53.53,
  annualReturn: 7,
  growthRate: 7,
  dividendYield: 1.6,
  inflationRate: 2.0,
  initialTfsa: 955 * 39.79,
  tfsaRoomYear1: 42000,
  annualTfsaIncrease: 7000,
  tfsaFundingSource: 'heloc',
  rrspYear1: 50000,
  rrspOngoing: 25000,
  rrspFundingSource: 'heloc',
  retirementTaxRate: 20,
  initialHelocAvailable: 300000,
  optimizationMode: 'classic',
  baseSalary: 164000,
  employerRrspMatch: 3,
  rrspRoomTotal: 150000,
  lumpSumAmount: 0,
  lumpSumYear: '1',
};
