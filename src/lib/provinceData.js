// Canadian Provincial Tax Rate Presets
// Combined federal + provincial marginal tax rates for common income brackets (2024)
// Source: Canada Revenue Agency & provincial tax tables

export const PROVINCES = [
  { value: 'custom', label: 'Custom', rates: null },
  { value: 'AB', label: 'Alberta', rates: { low: 25.0, mid: 30.5, high: 48.0, top: 48.0 } },
  { value: 'BC', label: 'British Columbia', rates: { low: 22.7, mid: 31.0, high: 47.7, top: 53.5 } },
  { value: 'MB', label: 'Manitoba', rates: { low: 25.8, mid: 33.25, high: 46.4, top: 50.4 } },
  { value: 'NB', label: 'New Brunswick', rates: { low: 24.4, mid: 31.95, high: 47.5, top: 52.5 } },
  { value: 'NL', label: 'Newfoundland & Labrador', rates: { low: 23.5, mid: 31.3, high: 48.3, top: 54.8 } },
  { value: 'NS', label: 'Nova Scotia', rates: { low: 23.79, mid: 33.17, high: 47.0, top: 54.0 } },
  { value: 'NT', label: 'Northwest Territories', rates: { low: 20.9, mid: 28.6, high: 40.05, top: 47.05 } },
  { value: 'NU', label: 'Nunavut', rates: { low: 19.0, mid: 27.0, high: 37.5, top: 44.5 } },
  { value: 'ON', label: 'Ontario', rates: { low: 20.05, mid: 31.48, high: 46.41, top: 53.53 } },
  { value: 'PE', label: 'Prince Edward Island', rates: { low: 24.8, mid: 31.3, high: 47.37, top: 51.37 } },
  { value: 'QC', label: 'Quebec', rates: { low: 27.53, mid: 37.12, high: 47.46, top: 53.31 } },
  { value: 'SK', label: 'Saskatchewan', rates: { low: 25.5, mid: 30.5, high: 42.0, top: 47.5 } },
  { value: 'YT', label: 'Yukon', rates: { low: 21.4, mid: 29.5, high: 43.01, top: 48.0 } },
];

// Income bracket descriptions for UI
export const TAX_BRACKETS = [
  { key: 'low', label: 'Low ($0 - $55K)', description: 'Income up to ~$55,000' },
  { key: 'mid', label: 'Mid ($55K - $100K)', description: 'Income ~$55,000 - $100,000' },
  { key: 'high', label: 'High ($100K - $220K)', description: 'Income ~$100,000 - $220,000' },
  { key: 'top', label: 'Top ($220K+)', description: 'Income over ~$220,000' },
];

// Get combined tax rate for a province and bracket
export const getProvincialTaxRate = (provinceCode, bracket = 'high') => {
  const province = PROVINCES.find(p => p.value === provinceCode);
  if (!province || !province.rates) return null;
  return province.rates[bracket] || province.rates.high;
};
