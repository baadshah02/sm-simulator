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
];

export const DEFAULT_FORM_DATA = {
  initialMortgage: 1091000,
  mortgageRate: 3.65,
  mortgageType: 'fixed',
  amortYears: 30,
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
};
