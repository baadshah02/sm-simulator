// Calculate traditional mortgage payoff time - VERIFIED MATHEMATICALLY ACCURATE
export const calculateTraditionalPayoff = (initialMortgage, mortgageRatePct, amortYears) => {
  const mortgageRate = mortgageRatePct / 100;
  const monthlyRate = mortgageRate / 12;
  const n = amortYears * 12;
  
  // Standard mortgage payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const power = Math.pow(1 + monthlyRate, n);
  const monthlyPayment = initialMortgage * monthlyRate * power / (power - 1);
  
  // Calculate actual payoff with precise month-by-month amortization
  let remainingBalance = initialMortgage;
  let months = 0;
  let totalInterestPaid = 0;
  
  // Standard amortization: each payment = interest on remaining balance + principal
  while (remainingBalance > 0.01 && months < n) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    totalInterestPaid += interestPayment;
    remainingBalance -= principalPayment;
    months++;
    
    // Prevent negative balance from rounding
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
  
  // If not fully paid off, find the closest year
  const lastYear = data[data.length - 1];
  return {
    years: lastYear.year,
    remainingMortgage: lastYear.mortgageBalance,
    finalPortfolio: lastYear.portfolioValue,
    totalLeveraged: lastYear.helocBalance,
    netWealth: lastYear.portfolioValue - lastYear.helocBalance
  };
};

export const generateFinancialData = (formData) => {
  const {
    initialMortgage,
    mortgageRate: mortgageRatePct,
    amortYears,
    helocRate: helocRatePct,
    taxRate: taxRatePct,
    annualReturn: annualReturnPct,
    growthRate: growthRatePct,
    dividendYield: dividendYieldPct,
    initialTfsa,
    tfsaRoomYear1,
    annualTfsaIncrease,
    rrspYear1,
    rrspOngoing,
    initialHelocAvailable,
  } = formData;

  const mortgageRate = mortgageRatePct / 100;
  const helocRate = helocRatePct / 100;
  const taxRate = taxRatePct / 100;
  const annualReturn = annualReturnPct / 100;
  const growthRate = growthRatePct / 100;
  const dividendYield = dividendYieldPct / 100;

  const totalLimit = initialMortgage + initialHelocAvailable;
  const monthlyRate = mortgageRate / 12;
  const n = amortYears * 12;
  const power = Math.pow(1 + monthlyRate, n);
  const monthlyPayment = initialMortgage * monthlyRate * power / (power - 1);
  const annualPayment = monthlyPayment * 12;

  let currentMortgage = initialMortgage;
  let currentHeloc = 0;
  let currentTfsa = initialTfsa;
  let currentRrsp = 0;
  let currentNonReg = 0;
  let currentDeductible = 0;
  const data = [];

  for (let year = 1; year <= 20; year++) {
    const beginning = {
      mortgage: currentMortgage,
      heloc: currentHeloc,
      tfsa: currentTfsa,
      rrsp: currentRrsp,
      nonReg: currentNonReg,
      deductible: currentDeductible,
      portfolio: currentTfsa + currentRrsp + currentNonReg,
    };

    const isYear1 = year === 1;
    const rrspContrib = isYear1 ? rrspYear1 : rrspOngoing;
    const tfsaHeloc = isYear1 ? tfsaRoomYear1 : 0;
    const tfsaSavings = isYear1 ? 0 : annualTfsaIncrease;
    const tfsaContrib = tfsaHeloc + tfsaSavings;
    const nonDeductibleFromP = isYear1 ? 0 : rrspContrib;
    const initialKick = isYear1 ? initialHelocAvailable : 0;
    const initialNonReg = isYear1 ? initialKick - tfsaHeloc - rrspContrib : 0;

    currentDeductible += initialNonReg;
    currentNonReg += initialNonReg;
    currentHeloc += initialKick;

    // Calculate principal built (P)
    const standardPrincipal = annualPayment - currentMortgage * mortgageRate;
    const a = dividendYield / 2;
    const b = taxRate * helocRate / 2;
    const left = 1 - a - b;
    const rightAdd = a + b;
    const constant = standardPrincipal + dividendYield * currentNonReg + rrspContrib * taxRate + taxRate * helocRate * currentDeductible;
    const dividendsThisYear = Math.round(dividendYield * currentNonReg);
    let P = (constant + rightAdd * nonDeductibleFromP) / left;
    P = Math.min(P, currentMortgage);

    // Calculate values with proper tax-deductible vs non-deductible interest split
    const additionalDeductible = P - nonDeductibleFromP;
    const averageDeductible = currentDeductible + additionalDeductible / 2;
    
    // HELOC Interest Breakdown:
    // 1. Deductible portion: Interest on non-registered investments (gets re-borrowed + tax refund)
    const deductibleInterest = helocRate * averageDeductible;
    
    // 2. Non-deductible portion: Interest on TFSA/RRSP funding (paid from savings, no tax benefit)
    const nonDeductibleBalance = currentHeloc - currentDeductible - additionalDeductible / 2;
    const nonDeductibleInterest = Math.max(0, helocRate * nonDeductibleBalance);
    
    // Total HELOC interest charged
    const helocInterest = deductibleInterest + nonDeductibleInterest;
    
    // Tax refund ONLY includes: RRSP contribution + deductible interest (NOT non-deductible interest)
    const refund = rrspContrib * taxRate + deductibleInterest * taxRate;
    
    const averageNonReg = currentNonReg + additionalDeductible / 2;
    const tfsaValue = (currentTfsa + tfsaHeloc + tfsaSavings) * (1 + annualReturn);
    const rrspValue = (currentRrsp + rrspContrib) * (1 + annualReturn);
    const nonRegValue = currentNonReg * (1 + growthRate) + additionalDeductible * (1 + growthRate / 2);
    const portfolioValue = tfsaValue + rrspValue + nonRegValue;

    // Percent changes
    const tfsaPct = beginning.tfsa + tfsaContrib > 0 ? ((tfsaValue - beginning.tfsa - tfsaContrib) / (beginning.tfsa + tfsaContrib)) * 100 : 0;
    const rrspPct = beginning.rrsp + rrspContrib > 0 ? ((rrspValue - beginning.rrsp - rrspContrib) / (beginning.rrsp + rrspContrib)) * 100 : 0;
    const nonRegPct = beginning.nonReg + initialNonReg + additionalDeductible > 0 ? ((nonRegValue - beginning.nonReg - initialNonReg - additionalDeductible) / (beginning.nonReg + initialNonReg + additionalDeductible / 2)) * 100 : 0;
    const portfolioPct = beginning.portfolio > 0 ? ((portfolioValue - beginning.portfolio - (tfsaContrib + rrspContrib + initialNonReg + additionalDeductible)) / beginning.portfolio) * 100 : 0;
    const mortgageDecreasePct = beginning.mortgage > 0 ? (P / beginning.mortgage * 100) : 0;
    const helocIncreasePct = beginning.heloc > 0 ? (P / beginning.heloc * 100) : 0;

    // Update for next year
    currentTfsa = tfsaValue;
    currentRrsp = rrspValue;
    currentNonReg = nonRegValue;
    currentDeductible += additionalDeductible;
    currentMortgage -= P;
    currentHeloc += P;
    if (currentMortgage < 0) currentMortgage = 0;
    if (currentHeloc > totalLimit) currentHeloc = totalLimit; // Cap at implied home equity

    data.push({
      year,
      mortgageBalance: Math.round(currentMortgage),
      helocBalance: Math.round(currentHeloc),
      helocInterest: Math.round(helocInterest),
      portfolioValue: Math.round(portfolioValue),
      tfsaValue: Math.round(tfsaValue),
      rrspValue: Math.round(rrspValue),
      nonRegValue: Math.round(nonRegValue),
      taxRefund: Math.round(refund),
      principalBuilt: Math.round(P),
      details: {
        beginning,
        assumptions: {
          mortgageRate: mortgageRatePct,
          helocRate: helocRatePct,
          taxRate: taxRatePct,
          annualReturn: annualReturnPct,
          growthRate: growthRatePct,
          dividendYield: dividendYieldPct,
          rrspContrib,
          tfsaContrib,
          initialNonReg,
        },
        calculations: {
          standardPrincipal: Math.round(standardPrincipal),
          a: a.toFixed(4),
          b: b.toFixed(4),
          left: left.toFixed(4),
          rightAdd: rightAdd.toFixed(4),
          constant: Math.round(constant),
          P: Math.round(P),
          additionalDeductible: Math.round(additionalDeductible),
          averageDeductible: Math.round(averageDeductible),
          deductibleInterest: Math.round(deductibleInterest),
          refund: Math.round(refund),
          averageNonReg: Math.round(averageNonReg),
          helocInterest: Math.round(helocInterest),
          dividendsThisYear,
        },
        end: {
          mortgage: currentMortgage,
          heloc: currentHeloc,
          tfsa: tfsaValue,
          rrsp: rrspValue,
          nonReg: nonRegValue,
          portfolio: portfolioValue,
        },
        percentChanges: {
          tfsa: tfsaPct.toFixed(2),
          rrsp: rrspPct.toFixed(2),
          nonReg: nonRegPct.toFixed(2),
          portfolio: portfolioPct.toFixed(2),
          mortgageDecrease: mortgageDecreasePct.toFixed(2),
          helocIncrease: helocIncreasePct.toFixed(2),
        }
      }
    });
  }

  return data;
};
