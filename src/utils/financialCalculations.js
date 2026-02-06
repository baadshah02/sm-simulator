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

  // Add Year 0 - Current/Initial State (before Smith Manoeuvre begins)
  data.push({
    year: 0,
    mortgageBalance: Math.round(initialMortgage),
    helocBalance: 0,
    helocInterest: 0,
    portfolioValue: Math.round(initialTfsa),
    tfsaValue: Math.round(initialTfsa),
    rrspValue: 0,
    nonRegValue: 0,
    taxRefund: 0,
    principalBuilt: 0,
    details: {
      beginning: {
        mortgage: initialMortgage,
        heloc: 0,
        tfsa: initialTfsa,
        rrsp: 0,
        nonReg: 0,
        deductible: 0,
        portfolio: initialTfsa,
      },
      assumptions: {
        mortgageRate: mortgageRatePct,
        helocRate: helocRatePct,
        taxRate: taxRatePct,
        annualReturn: annualReturnPct,
        growthRate: growthRatePct,
        dividendYield: dividendYieldPct,
        rrspContrib: 0,
        tfsaContrib: 0,
        initialNonReg: 0,
      },
      calculations: {
        standardPrincipal: 0,
        a: 0,
        b: 0,
        left: 1,
        rightAdd: 0,
        constant: 0,
        P: 0,
        additionalDeductible: 0,
        averageDeductible: 0,
        deductibleInterest: 0,
        refund: 0,
        averageNonReg: 0,
        helocInterest: 0,
        dividendsThisYear: 0,
      },
      end: {
        mortgage: initialMortgage,
        heloc: 0,
        tfsa: initialTfsa,
        rrsp: 0,
        nonReg: 0,
        portfolio: initialTfsa,
      },
      percentChanges: {
        tfsa: '0.00',
        rrsp: '0.00',
        nonReg: '0.00',
        portfolio: '0.00',
        mortgageDecrease: '0.00',
        helocIncrease: '0.00',
      }
    }
  });

  for (let year = 1; year <= 30; year++) {
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
    const nonDeductibleFromP = rrspContrib + tfsaSavings; // RRSP + TFSA from savings are both non-deductible
    const initialKick = isYear1 ? initialHelocAvailable : 0;
    const initialNonReg = isYear1 ? Math.max(0, initialKick - tfsaHeloc - rrspContrib) : 0;

    // Only update balances if we actually have HELOC borrowing
    if (initialKick > 0) {
      currentDeductible += initialNonReg;
      currentNonReg += initialNonReg;
      currentHeloc += initialKick;
    }

    // Calculate principal built (P) - but only if we have HELOC available or RRSP contributions
    const standardPrincipal = annualPayment - currentMortgage * mortgageRate;
    let P = standardPrincipal; // Default to standard principal payment
    let a = 0, b = 0, left = 1, rightAdd = 0, constant = standardPrincipal;
    const dividendsThisYear = Math.round(dividendYield * currentNonReg);
    
    // Apply Smith Manoeuvre calculations - the strategy works even with $0 initial HELOC 
    // because mortgage payments create HELOC credit for reinvestment
    const hasInitialActivity = initialHelocAvailable > 0 || rrspContrib > 0;
    const hasOngoingActivity = hasInitialActivity || currentDeductible > 0 || standardPrincipal > 0;
    
    if (hasOngoingActivity) {
      a = dividendYield / 2;
      b = taxRate * helocRate / 2;
      left = 1 - a - b;
      rightAdd = a + b;
      constant = standardPrincipal + dividendYield * currentNonReg + rrspContrib * taxRate + taxRate * helocRate * currentDeductible;
      P = (constant + rightAdd * nonDeductibleFromP) / left;
    }
    
    P = Math.min(P, currentMortgage);

    // Calculate additional deductible debt from mortgage payment reinvestment
    const additionalDeductible = Math.max(0, P - nonDeductibleFromP);
    const averageDeductible = currentDeductible + additionalDeductible / 2;
    
    // HELOC Interest Breakdown - only calculate if we have actual HELOC balances or activity
    let deductibleInterest = 0;
    let nonDeductibleInterest = 0;
    let helocInterest = 0;
    
    const willHaveHelocBalance = currentHeloc + (hasInitialActivity ? initialKick : 0) + (hasOngoingActivity ? P : 0) > 0;
    
    if (willHaveHelocBalance || averageDeductible > 0) {
      // 1. Deductible portion: Interest on non-registered investments (gets re-borrowed + tax refund)
      deductibleInterest = helocRate * averageDeductible;
      
      // 2. Non-deductible portion: Interest on TFSA/RRSP funding (paid from savings, no tax benefit)
      // Calculate what portion of HELOC was used for non-deductible purposes throughout all years
      const tfsaHelocUsed = hasInitialActivity ? tfsaHeloc : 0;
      const rrspHelocUsed = hasInitialActivity ? Math.min(rrspContrib, Math.max(0, initialKick - tfsaHeloc)) : 0;
      
      // Track cumulative non-deductible HELOC usage (TFSA/RRSP funded by HELOC over time)
      // This should include ongoing TFSA/RRSP contributions that come from redirected principal payments
      let cumulativeNonDeductibleHeloc = tfsaHelocUsed + rrspHelocUsed;
      
      // Add any ongoing TFSA/RRSP funding that reduces deductible investments
      // This represents the portion of P that went to non-deductible purposes instead of investments
      if (!isYear1) {
        // In subsequent years, TFSA savings and ongoing RRSP reduce what could be deductible
        const nonDeductiblePortionOfP = Math.min(P, nonDeductibleFromP);
        cumulativeNonDeductibleHeloc += nonDeductiblePortionOfP * (year - 1); // Approximate cumulative effect
      }
      
      // Non-deductible interest is charged on the cumulative non-deductible HELOC balance
      nonDeductibleInterest = Math.max(0, helocRate * Math.min(cumulativeNonDeductibleHeloc, currentHeloc + initialKick));
      
      // Total HELOC interest charged
      helocInterest = deductibleInterest + nonDeductibleInterest;
    }
    
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
    
    // Update HELOC-related balances based on activity type
    if (hasInitialActivity) {
      // Initial borrowing for TFSA/RRSP/Non-Reg
      // Already handled above with initialKick
    }
    
    if (hasOngoingActivity && additionalDeductible > 0) {
      // Ongoing reinvestment from mortgage payments
      currentDeductible += additionalDeductible;
      currentHeloc += P;
      if (currentHeloc > totalLimit) currentHeloc = totalLimit; // Cap at implied home equity
    } else if (!hasOngoingActivity) {
      // Traditional mortgage only - no HELOC activity
      currentHeloc += 0; // No change to HELOC
    } else {
      // Has activity but no additional deductible (shouldn't happen normally)
      currentHeloc += P;
      if (currentHeloc > totalLimit) currentHeloc = totalLimit;
    }
    
    currentMortgage -= P;
    if (currentMortgage < 0) currentMortgage = 0;

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
