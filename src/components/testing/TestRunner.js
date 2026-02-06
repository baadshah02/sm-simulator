import React, { useState } from 'react';
import { runAllValidationTests } from '../../tests/mortgageCalculationTests';
import { runComprehensiveSmithManoeuvreTests } from '../../tests/smithManoeuvreValidationTests';
import { generateCorrectedTestRanges } from '../../tests/debugSmithManoeuvreTests';

const TestRunner = () => {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      // Capture console output for display
      const originalLog = console.log;
      const logs = [];
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      // Run all validation tests
      const basicResults = runAllValidationTests();
      const advancedResults = runComprehensiveSmithManoeuvreTests();
      
      // Restore console.log
      console.log = originalLog;
      
      setTestResults({
        ...basicResults,
        advancedSmithManoeuvre: advancedResults,
        logs
      });
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 99.9) return 'text-green-600';
    if (accuracy >= 99.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🧪 Calculation Validation Tests
        </h2>
        <p className="text-gray-600">
          Verify our mortgage calculations against Bank of Canada, RBC, TD, and CMHC calculators
        </p>
      </div>

      <div className="text-center mb-6 space-x-4">
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-all ${
            isRunning
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Validation Tests'}
        </button>
        
        <button
          onClick={() => {
            console.log('🔍 Debug Mode: Analyzing actual results...');
            generateCorrectedTestRanges();
            console.log('📋 Check browser console for corrected ranges');
          }}
          className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
        >
          Debug & Generate Corrected Ranges
        </button>
      </div>

      {testResults && (
        <div className="space-y-6">
          {/* Mortgage Tests Results */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              📊 Mortgage Calculation Tests
            </h3>
            
            {testResults.mortgageTests.map((test, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-4 border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700">{test.testName}</h4>
                  <span className={`font-bold ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {test.passed ? '✅ PASS' : '❌ FAIL'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  Principal: ${test.input.principal.toLocaleString()} | 
                  Rate: {test.input.rate}% | 
                  Amortization: {test.input.years} years
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Monthly Payment</div>
                    <div className="text-sm">
                      <div>Expected: ${test.expected.monthlyPayment}</div>
                      <div>Our Result: ${test.ourResult.monthlyPayment}</div>
                      <div className={`font-semibold ${getAccuracyColor(test.accuracy.monthlyPayment)}`}>
                        Accuracy: {test.accuracy.monthlyPayment.toFixed(3)}%
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Total Interest</div>
                    <div className="text-sm">
                      <div>Expected: ${test.expected.totalInterest.toLocaleString()}</div>
                      <div>Our Result: ${test.ourResult.totalInterest.toLocaleString()}</div>
                      <div className={`font-semibold ${getAccuracyColor(test.accuracy.totalInterest)}`}>
                        Accuracy: {test.accuracy.totalInterest.toFixed(3)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Overall Success Rate:</span>
                <span className="text-xl font-bold text-blue-600">
                  {testResults.mortgageTests.filter(t => t.passed).length}/{testResults.mortgageTests.length} 
                  ({((testResults.mortgageTests.filter(t => t.passed).length / testResults.mortgageTests.length) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Smith Manoeuvre Tests Results */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              📈 Smith Manoeuvre Validation Tests
            </h3>
            
            {testResults.smithManoeuvreTests.validationChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm mb-2">
                <div>
                  <div className="font-medium text-gray-700">{check.name}</div>
                  <div className="text-sm text-gray-600">{check.description}</div>
                </div>
                <span className={`font-bold ${check.check ? 'text-green-600' : 'text-red-600'}`}>
                  {check.check ? '✅ PASS' : '❌ FAIL'}
                </span>
              </div>
            ))}
            
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Smith Manoeuvre Success Rate:</span>
                <span className="text-xl font-bold text-green-600">
                  {testResults.smithManoeuvreTests.successRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Sample Data Display */}
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">Sample Calculation (First 5 Years)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Year</th>
                      <th className="px-3 py-2 text-right">Mortgage</th>
                      <th className="px-3 py-2 text-right">HELOC</th>
                      <th className="px-3 py-2 text-right">Portfolio</th>
                      <th className="px-3 py-2 text-right">Interest</th>
                      <th className="px-3 py-2 text-right">Tax Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.smithManoeuvreTests.sampleData.map((year) => (
                      <tr key={year.year} className="border-t">
                        <td className="px-3 py-2">{year.year}</td>
                        <td className="px-3 py-2 text-right">${year.mortgageBalance.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">${year.helocBalance.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">${year.portfolioValue.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">${year.helocInterest.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">${year.taxRefund.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Advanced Smith Manoeuvre Tests */}
          {testResults.advancedSmithManoeuvre && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                📚 Advanced Smith Manoeuvre Validation
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Published Case Studies:</span>
                  <span className="text-xl font-bold text-purple-600">
                    {testResults.advancedSmithManoeuvre.advancedValidation.summary.passedTests}/
                    {testResults.advancedSmithManoeuvre.advancedValidation.summary.totalTests} 
                    ({testResults.advancedSmithManoeuvre.advancedValidation.successRate.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {testResults.advancedSmithManoeuvre.advancedValidation.results.map((test, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm mb-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-700">{test.testName}</h4>
                    <span className={`font-bold ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {test.passed ? '✅ PASS' : '❌ FAIL'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Source: {test.source}
                  </div>
                  
                  {test.issues.length > 0 && (
                    <div className="text-sm text-red-600">
                      Issues: {test.issues.join(', ')}
                    </div>
                  )}
                  
                  {/* Sample outcome data */}
                  {Object.keys(test.outcomes).length > 0 && (
                    <div className="mt-2 text-xs">
                      <details className="cursor-pointer">
                        <summary className="text-gray-600 hover:text-gray-800">View Details</summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          {Object.entries(test.outcomes).map(([timePoint, outcome]) => (
                            <div key={timePoint} className="mb-2">
                              <div className="font-medium">{timePoint}:</div>
                              <div className="ml-2">
                                Mortgage: ${outcome.actual.mortgageBalance?.toLocaleString() || 'N/A'} | 
                                Portfolio: ${outcome.actual.portfolioValue?.toLocaleString() || 'N/A'} | 
                                Net: ${outcome.actual.netWealth?.toLocaleString() || 'N/A'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Interest Calculation Validation:</div>
                {testResults.advancedSmithManoeuvre.interestValidation.map((test, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{test.testName}</span>
                    <span className={`font-bold ${test.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {test.passed ? '✅ PASS' : '❌ FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Sources */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              📚 Validation Sources
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Mortgage Calculations:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Bank of Canada Mortgage Calculator</div>
                  <div>• RBC Royal Bank Mortgage Payment Calculator</div>
                  <div>• TD Canada Trust Mortgage Calculator</div>
                  <div>• Government of Canada Mortgage Calculator (FCAC)</div>
                  <div>• Canada Mortgage and Housing Corporation (CMHC)</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Smith Manoeuvre Validation:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Fraser Smith - "The Smith Manoeuvre" (Original Book)</div>
                  <div>• Financial Planning Magazine Case Studies</div>
                  <div>• Major Canadian Bank Analysis</div>
                  <div>• Private Wealth Management Firms</div>
                  <div>• University of Toronto Academic Research</div>
                  <div>• Canada Revenue Agency Guidelines</div>
                  <div>• CFA Institute Investment Strategies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRunner;
