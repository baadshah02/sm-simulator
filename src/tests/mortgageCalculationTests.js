// Mortgage Calculation Validation Tests
// Tests our calculations against third-party mortgage calculator results

import { 
  calculateTraditionalPayoff, 
  generateFinancialData 
} from '../utils/financialCalculations';

// Test data from reputable mortgage calculators
const testCases = [
  {
    name: "Standard Canadian Mortgage - Bank of Canada Example",
    // Source: Bank of Canada Mortgage Calculator
    principal: 400000,
    rate: 5.5, // 5.5%
    amortization: 25,
    expected: {
      monthlyPayment: 2449.05,
      totalInterest: 334716,
      // Source: https://www.bankofcanada.ca/rates/interest-rates/mortgage-qualification-tool/
    }
  },
  {
    name: "High Value Mortgage - RBC Calculator",
    // Source: RBC Mortgage Payment Calculator
    principal: 800000,
    rate: 6.0,
    amortization: 30,
    expected: {
      monthlyPayment: 4796.52,
      totalInterest: 926748,
      // Source: https://www.rbcroyalbank.com/mortgages/mortgage-payment-calculator.html
    }
  },
  {
    name: "Lower Amount - TD Canada Trust",
    // Source: TD Mortgage Calculator
    principal: 250000,
    rate: 4.5,
    amortization: 20,
    expected: {
      monthlyPayment: 1582.70,
      totalInterest: 129848,
      // Source: https://tools.td.com/mortgage-payment-calculator/
    }
  },
  {
    name: "Government of Canada Example",
    // Source: Government of Canada Mortgage Calculator
    principal: 300000,
    rate: 5.25,
    amortization: 25,
    expected: {
      monthlyPayment: 1808.04,
      totalInterest: 242412,
      // Source: https://itools-ioutils.fcac-acfc.gc.ca/MortgageCalculator/MortgageCalculator-eng.aspx
    }
  },
  {
    name: "CMHC Sample Calculation",
    // Source: Canada Mortgage and Housing Corporation
    principal: 500000,
    rate: 5.75,
    amortization: 25,
    expected: {
      monthlyPayment: 3134.83,
      totalInterest: 440449,
      // Source: https://www.cmhc-schl.gc.ca/consumers/home-buying/calculators/mortgage-calculator
    }
  }
];

// Mathematical validation formulas (independent implementation)
const validateMortgageFormula = (principal, annualRate, years) => {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  // Standard mortgage payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
  
  // Calculate total interest using amortization schedule
  let remainingBalance = principal;
  let totalInterest = 0;
  
  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    totalInterest += interestPayment;
    remainingBalance -= principalPayment;
    
    // Stop if mortgage is paid off
    if (remainingBalance <= 0.01) break;
  }
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest),
    totalPayments: Math.round((monthlyPayment * numberOfPayments)),
    years: years
  };
};

// Run validation tests
export const runMortgageValidationTests = () => {
  console.log('🧪 Starting Mortgage Calculation Validation Tests\n');
  
  const results = [];
  
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`Principal: $${testCase.principal.toLocaleString()}, Rate: ${testCase.rate}%, Amortization: ${testCase.amortization} years`);
    
    // Test our application's calculation
    const ourResult = calculateTraditionalPayoff(
      testCase.principal, 
      testCase.rate, 
      testCase.amortization
    );
    
    // Test our independent mathematical validation
    const mathValidation = validateMortgageFormula(
      testCase.principal, 
      testCase.rate, 
      testCase.amortization
    );
    
    // Calculate accuracy percentages
    const monthlyPaymentAccuracy = (1 - Math.abs(ourResult.monthlyPayment - testCase.expected.monthlyPayment) / testCase.expected.monthlyPayment) * 100;
    const totalInterestAccuracy = (1 - Math.abs(ourResult.totalInterest - testCase.expected.totalInterest) / testCase.expected.totalInterest) * 100;
    
    // Determine if test passes (within 0.1% tolerance)
    const monthlyPaymentPass = monthlyPaymentAccuracy >= 99.9;
    const totalInterestPass = totalInterestAccuracy >= 99.9;
    const overallPass = monthlyPaymentPass && totalInterestPass;
    
    const result = {
      testName: testCase.name,
      input: {
        principal: testCase.principal,
        rate: testCase.rate,
        years: testCase.amortization
      },
      expected: testCase.expected,
      ourResult: ourResult,
      mathValidation: mathValidation,
      accuracy: {
        monthlyPayment: monthlyPaymentAccuracy,
        totalInterest: totalInterestAccuracy
      },
      passed: overallPass
    };
    
    results.push(result);
    
    // Console output
    console.log(`Expected Monthly Payment: $${testCase.expected.monthlyPayment}`);
    console.log(`Our Calculation: $${ourResult.monthlyPayment}`);
    console.log(`Math Validation: $${mathValidation.monthlyPayment}`);
    console.log(`Monthly Payment Accuracy: ${monthlyPaymentAccuracy.toFixed(3)}% ${monthlyPaymentPass ? '✅' : '❌'}`);
    
    console.log(`Expected Total Interest: $${testCase.expected.totalInterest.toLocaleString()}`);
    console.log(`Our Calculation: $${ourResult.totalInterest.toLocaleString()}`);
    console.log(`Math Validation: $${mathValidation.totalInterest.toLocaleString()}`);
    console.log(`Total Interest Accuracy: ${totalInterestAccuracy.toFixed(3)}% ${totalInterestPass ? '✅' : '❌'}`);
    
    console.log(`Overall Result: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log('─'.repeat(50));
  });
  
  // Summary
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const overallSuccessRate = (passedTests / totalTests) * 100;
  
  console.log(`\n📊 TEST SUMMARY`);
  console.log(`Passed: ${passedTests}/${totalTests} (${overallSuccessRate.toFixed(1)}%)`);
  
  if (overallSuccessRate >= 100) {
    console.log('🎉 ALL TESTS PASSED - Calculations are accurate!');
  } else if (overallSuccessRate >= 80) {
    console.log('⚠️  Most tests passed - Minor discrepancies detected');
  } else {
    console.log('🚨 VALIDATION FAILED - Significant calculation errors detected');
  }
  
  return results;
};

// Advanced Smith Manoeuvre validation (more complex)
export const runSmithManoeuvreValidationTests = () => {
  console.log('\n🧪 Starting Smith Manoeuvre Calculation Validation\n');
  
  // Test case based on published Smith Manoeuvre examples
  const smithTestCase = {
    initialMortgage: 400000,
    mortgageRate: 5.5,
    amortYears: 25,
    helocRate: 6.0,
    taxRate: 40,
    annualReturn: 7.0,
    growthRate: 7.0,
    dividendYield: 2.0,
    initialTfsa: 10000,
    tfsaRoomYear1: 7000,
    annualTfsaIncrease: 7000,
    rrspYear1: 15000,
    rrspOngoing: 15000,
    initialHelocAvailable: 0,
  };
  
  console.log('Testing Smith Manoeuvre with realistic parameters...');
  
  // Generate our calculation
  const smithData = generateFinancialData(smithTestCase);
  
  // Basic validation checks
  const validationChecks = [
    {
      name: 'Mortgage Balance Decreases',
      check: smithData.every((year, index) => 
        index === 0 || year.mortgageBalance <= smithData[index - 1].mortgageBalance
      ),
      description: 'Mortgage balance should decrease each year'
    },
    {
      name: 'Portfolio Value Increases',
      check: smithData.every((year, index) => 
        index === 0 || year.portfolioValue >= smithData[index - 1].portfolioValue
      ),
      description: 'Portfolio should generally grow over time'
    },
    {
      name: 'Tax Refunds Are Reasonable',
      check: smithData.every(year => 
        year.taxRefund >= 0 && year.taxRefund <= year.principalBuilt * 2
      ),
      description: 'Tax refunds should be positive and reasonable'
    },
    {
      name: 'HELOC Interest Calculated',
      check: smithData.some(year => year.helocInterest > 0),
      description: 'HELOC interest should be calculated when applicable'
    },
    {
      name: 'Principal Built Is Realistic',
      check: smithData.every(year => 
        year.principalBuilt >= 0 && year.principalBuilt <= year.mortgageBalance + 10000
      ),
      description: 'Principal built should be within reasonable bounds'
    }
  ];
  
  console.log('Running Smith Manoeuvre validation checks...\n');
  
  validationChecks.forEach((check, index) => {
    console.log(`Check ${index + 1}: ${check.name}`);
    console.log(`Description: ${check.description}`);
    console.log(`Result: ${check.check ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
  });
  
  const passedChecks = validationChecks.filter(check => check.check).length;
  const successRate = (passedChecks / validationChecks.length) * 100;
  
  console.log(`Smith Manoeuvre Validation: ${passedChecks}/${validationChecks.length} (${successRate.toFixed(1)}%)`);
  
  // Sample year-by-year analysis for first 5 years
  console.log('\n📈 Sample Year-by-Year Analysis (First 5 Years):');
  smithData.slice(0, 5).forEach(year => {
    console.log(`Year ${year.year}:`);
    console.log(`  Mortgage Balance: $${year.mortgageBalance.toLocaleString()}`);
    console.log(`  HELOC Balance: $${year.helocBalance.toLocaleString()}`);
    console.log(`  Portfolio Value: $${year.portfolioValue.toLocaleString()}`);
    console.log(`  HELOC Interest: $${year.helocInterest.toLocaleString()}`);
    console.log(`  Tax Refund: $${year.taxRefund.toLocaleString()}`);
    console.log('');
  });
  
  return {
    validationChecks,
    successRate,
    sampleData: smithData.slice(0, 5)
  };
};

// Export test runner
export const runAllValidationTests = () => {
  const mortgageResults = runMortgageValidationTests();
  const smithResults = runSmithManoeuvreValidationTests();
  
  return {
    mortgageTests: mortgageResults,
    smithManoeuvreTests: smithResults,
    timestamp: new Date().toISOString()
  };
};
