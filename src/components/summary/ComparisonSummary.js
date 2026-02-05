import React from 'react';

const ComparisonSummary = ({ comparisonData }) => {
  if (!comparisonData) return null;

  return (
    <div className="w-full mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-lg border border-blue-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        🏠 Traditional vs Smith Manoeuvre Comparison
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Traditional Mortgage */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-gray-500 rounded-full mr-3" />
            <h3 className="text-lg font-semibold text-gray-700">Traditional Mortgage</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payoff Time:</span>
              <span className="font-bold text-gray-800">{comparisonData.traditional.years} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Payment:</span>
              <span className="font-bold text-gray-800">${comparisonData.traditional.monthlyPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Interest:</span>
              <span className="font-bold text-red-600">${comparisonData.traditional.totalInterest.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Final Wealth:</span>
              <span className="font-bold text-gray-500">$0</span>
            </div>
          </div>
        </div>

        {/* Smith Manoeuvre */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3" />
            <h3 className="text-lg font-semibold text-green-700">Smith Manoeuvre</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payoff Time:</span>
              <span className="font-bold text-green-700">{comparisonData.smithManoeuvre.years} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Portfolio Value:</span>
              <span className="font-bold text-green-600">${comparisonData.smithManoeuvre.finalPortfolio.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Leveraged:</span>
              <span className="font-bold text-orange-600">${comparisonData.smithManoeuvre.totalLeveraged.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Wealth:</span>
              <span className="font-bold text-blue-600">${comparisonData.smithManoeuvre.netWealth.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Summary */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
          ⚡ Smith Manoeuvre Benefits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {comparisonData.timeSaved > 0 ? `${comparisonData.timeSaved.toFixed(1)}` : 'Same'} 
              {comparisonData.timeSaved > 0 ? ' years' : ''}
            </div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${Math.abs(comparisonData.wealthBuilt).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Wealth Built</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {comparisonData.timeSaved > 0 ? `${((comparisonData.timeSaved / comparisonData.traditional.years) * 100).toFixed(0)}%` : '0%'}
            </div>
            <div className="text-sm text-gray-600">Faster Payoff</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSummary;
