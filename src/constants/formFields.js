export const FORM_FIELDS = [
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
    name: 'amortYears',
    label: 'Amortization Years:',
    tooltipContent: 'The total number of years over which your mortgage would be paid off with regular payments. Typically 25-30 years for Canadian mortgages.'
  },
  {
    name: 'helocRate',
    label: 'HELOC Rate (%):',
    step: '0.01',
    tooltipContent: 'Home Equity Line of Credit interest rate. Usually higher than mortgage rates. This rate applies to money borrowed from your HELOC for investments.'
  },
  {
    name: 'taxRate',
    label: 'Tax Rate (%):',
    step: '0.01',
    tooltipContent: 'Your marginal tax rate (combined federal + provincial). This determines the tax deduction value of investment interest and RRSP contributions. Use your highest tax bracket.'
  },
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
    name: 'initialTfsa',
    label: 'Initial TFSA Value:',
    tooltipContent: 'Current value of your existing TFSA investments. If starting fresh, this could be $0. Used as the baseline for your tax-free savings account.'
  },
  {
    name: 'tfsaRoomYear1',
    label: 'TFSA Room Year 1:',
    tooltipContent: 'Available TFSA contribution room for the first year. Check your CRA account for your exact contribution limit. Used for initial HELOC funding.'
  },
  {
    name: 'annualTfsaIncrease',
    label: 'Annual TFSA Increase:',
    tooltipContent: 'Annual TFSA contribution room increase (typically $7,000 in 2024). This is funded from savings, not HELOC, in subsequent years.'
  },
  {
    name: 'rrspYear1',
    label: 'RRSP Year 1:',
    tooltipContent: 'RRSP contribution for the first year, funded by HELOC. This larger amount generates a substantial tax refund that kicks off the strategy.'
  },
  {
    name: 'rrspOngoing',
    label: 'RRSP Ongoing:',
    tooltipContent: 'Annual RRSP contribution for years 2 and beyond. Typically lower than Year 1, funded from principal payments rather than additional HELOC borrowing.'
  },
  {
    name: 'initialHelocAvailable',
    label: 'Initial HELOC Available:',
    tooltipContent: 'Total HELOC credit limit available at the start. This funds Year 1 investments (TFSA + RRSP + initial non-registered). Usually 65-80% of home value minus mortgage.'
  }
];

export const DEFAULT_FORM_DATA = {
  initialMortgage: 1091000,
  mortgageRate: 3.65,
  amortYears: 30,
  helocRate: 4.70,
  taxRate: 53.5,
  annualReturn: 7,
  growthRate: 7,
  dividendYield: 1.6,
  initialTfsa: 955 * 39.79,
  tfsaRoomYear1: 42000,
  annualTfsaIncrease: 7000,
  rrspYear1: 50000,
  rrspOngoing: 25000,
  initialHelocAvailable: 300000,
};
