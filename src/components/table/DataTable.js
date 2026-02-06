import React, { useState, useMemo } from 'react';

const DataTable = ({ tableData, selectedYear, onRowClick }) => {
  const [sortField, setSortField] = useState('year');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Calculate additional Smith Manoeuvre metrics
  const enhancedData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    return tableData.map((row, index) => {
      const netWealth = row.portfolioValue - row.helocBalance;
      const debtToWealthRatio = row.portfolioValue > 0 ? (row.helocBalance / row.portfolioValue * 100) : 0;
      const taxEfficiency = row.taxRefund / Math.max(row.helocInterest || 1, 1) * 100;
      const previousRow = index > 0 ? tableData[index - 1] : null;
      const wealthGrowth = previousRow ? ((netWealth - (previousRow.portfolioValue - previousRow.helocBalance)) / Math.max(previousRow.portfolioValue - previousRow.helocBalance, 1) * 100) : 0;
      
      return {
        ...row,
        netWealth,
        debtToWealthRatio,
        taxEfficiency: Math.min(taxEfficiency, 100),
        wealthGrowth
      };
    });
  }, [tableData]);

  // Sorting logic
  const sortedData = useMemo(() => {
    return [...enhancedData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction;
      }
      return aVal.toString().localeCompare(bVal.toString()) * direction;
    });
  }, [enhancedData, sortField, sortDirection]);

  // Early return after all hooks are called
  if (!tableData || tableData.length === 0) return null;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (value, compact = false) => {
    if (compact && Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (compact && Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-orange-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getWealthTrendIcon = (growth) => {
    if (growth > 10) return '📈';
    if (growth > 0) return '↗️';
    if (growth < -10) return '📉';
    if (growth < 0) return '↘️';
    return '➡️';
  };

  // Card View Component for mobile
  const CardView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedData.map((row) => (
        <div
          key={row.year}
          className={`bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 ${
            selectedYear === row.year 
              ? 'border-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => onRowClick(row.year)}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-800 to-gray-800 text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Year {row.year}</h3>
              <span className="text-2xl">{getWealthTrendIcon(row.wealthGrowth)}</span>
            </div>
            <div className="text-sm opacity-90 mt-1">
              Net Wealth: <span className="font-semibold">{formatCurrency(row.netWealth)}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-lg font-bold text-green-700">{formatCurrency(row.portfolioValue, true)}</div>
                <div className="text-xs text-green-600">Total Portfolio</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <div className="text-lg font-bold text-orange-700">{formatCurrency(row.helocBalance, true)}</div>
                <div className="text-xs text-orange-600">HELOC Debt</div>
              </div>
            </div>

            {/* Account Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-teal-50 rounded-lg">
                <span className="text-sm font-medium text-teal-700">💎 TFSA</span>
                <span className="font-semibold text-teal-800">{formatCurrency(row.tfsaValue, true)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-indigo-700">🛡️ RRSP</span>
                <span className="font-semibold text-indigo-800">{formatCurrency(row.rrspValue, true)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                <span className="text-sm font-medium text-amber-700">📈 Non-Reg</span>
                <span className="font-semibold text-amber-800">{formatCurrency(row.nonRegValue, true)}</span>
              </div>
            </div>

            {/* Smith Manoeuvre Metrics */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax Refund:</span>
                <span className="font-semibold text-green-600">{formatCurrency(row.taxRefund, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Principal Built:</span>
                <span className="font-semibold text-purple-600">{formatCurrency(row.principalBuilt, true)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax Efficiency:</span>
                <span className="font-semibold text-blue-600">{formatPercent(row.taxEfficiency)}</span>
              </div>
            </div>

            {/* Debt to Wealth Ratio Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Debt/Wealth Ratio</span>
                <span>{formatPercent(row.debtToWealthRatio)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(100 - row.debtToWealthRatio)}`}
                  style={{ width: `${Math.min(100 - row.debtToWealthRatio, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Enhanced Table Headers - Net Wealth and Total Portfolio moved to right of Principal
  const tableHeaders = [
    { key: 'year', label: 'Year', align: 'center', sortable: true, icon: '📅' },
    { key: 'mortgageBalance', label: 'Mortgage Left', align: 'right', sortable: true, icon: '🏠' },
    { key: 'helocBalance', label: 'HELOC Debt', align: 'right', sortable: true, icon: '🏦' },
    { key: 'tfsaValue', label: 'TFSA', align: 'right', sortable: true, icon: '💎' },
    { key: 'rrspValue', label: 'RRSP', align: 'right', sortable: true, icon: '🛡️' },
    { key: 'nonRegValue', label: 'Non-Reg', align: 'right', sortable: true, icon: '📈' },
    { key: 'taxRefund', label: 'Tax Refund', align: 'right', sortable: true, icon: '💳' },
    { key: 'principalBuilt', label: 'Principal', align: 'right', sortable: true, icon: '🏗️' },
    { key: 'netWealth', label: 'Net Wealth', align: 'right', sortable: true, icon: '💰', highlight: true },
    { key: 'portfolioValue', label: 'Total Portfolio', align: 'right', sortable: true, icon: '📊' }
  ];

  const TableView = () => (
    <div className="overflow-hidden">
      <table className="w-full min-w-full table-auto text-xs">
        <thead>
          <tr className="bg-gradient-to-r from-slate-800 to-gray-800 text-white">
            {tableHeaders.map((header) => (
              <th 
                key={header.key}
                className={`px-1 py-2 font-semibold text-xs cursor-pointer transition-colors hover:bg-slate-700 ${
                  header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'
                } ${header.highlight ? 'bg-slate-700' : ''}`}
                onClick={() => header.sortable && handleSort(header.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">{header.icon}</span>
                    <span className="truncate">{header.label}</span>
                  </div>
                  {header.sortable && (
                    <div className="flex flex-col">
                      <span className={`text-xs ${sortField === header.key && sortDirection === 'asc' ? 'text-blue-300' : 'text-gray-400'}`}>▲</span>
                      <span className={`text-xs ${sortField === header.key && sortDirection === 'desc' ? 'text-blue-300' : 'text-gray-400'}`}>▼</span>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedData.map((row, index) => (
            <tr 
              key={row.year} 
              className={`group cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedYear === row.year 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 shadow-md' 
                  : index % 2 === 0 ? 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50' : 'bg-gray-50/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
              }`}
              onClick={() => onRowClick(row.year)}
            >
              <td className="px-1 py-2 text-center">
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs group-hover:shadow-lg transition-shadow">
                    {row.year}
                  </div>
                </div>
              </td>
              <td className="px-1 py-2 text-right">
                <div className="flex flex-col items-end">
                  <span className="font-medium text-sm text-red-600">{formatCurrency(row.mortgageBalance, true)}</span>
                  {row.mortgageBalance === 0 && (
                    <span className="text-xs text-green-500 font-bold">PAID! 🎉</span>
                  )}
                </div>
              </td>
              <td className="px-1 py-2 text-right">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-sm text-orange-600">{formatCurrency(row.helocBalance, true)}</span>
                  <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(row.debtToWealthRatio, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-1 py-2 text-right">
                <span className="font-medium text-sm text-teal-600">{formatCurrency(row.tfsaValue, true)}</span>
              </td>
              <td className="px-1 py-2 text-right">
                <span className="font-medium text-sm text-indigo-600">{formatCurrency(row.rrspValue, true)}</span>
              </td>
              <td className="px-1 py-2 text-right">
                <span className="font-medium text-sm text-amber-600">{formatCurrency(row.nonRegValue, true)}</span>
              </td>
              <td className="px-1 py-2 text-right">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-sm text-green-600">{formatCurrency(row.taxRefund, true)}</span>
                  <span className="text-xs text-gray-500">{formatPercent(row.taxEfficiency, 0)}</span>
                </div>
              </td>
              <td className="px-1 py-2 text-right">
                <span className="font-medium text-sm text-purple-600">{formatCurrency(row.principalBuilt, true)}</span>
              </td>
              <td className="px-1 py-2 text-right">
                <div className="flex flex-col items-end">
                  <span className={`font-bold text-sm ${row.netWealth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(row.netWealth, true)}
                  </span>
                  {row.wealthGrowth !== 0 && (
                    <span className={`text-xs flex items-center ${row.wealthGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <span className="mr-1">{getWealthTrendIcon(row.wealthGrowth)}</span>
                      {formatPercent(Math.abs(row.wealthGrowth), 0)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-1 py-2 text-right">
                <span className="font-semibold text-sm text-blue-700">{formatCurrency(row.portfolioValue, true)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-800 text-white px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-2xl font-bold">🚀 Smith Manoeuvre Progress</h3>
            <p className="text-slate-300 mt-1">Track your wealth building journey • Click any row for detailed analysis</p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'table' 
                  ? 'bg-white text-slate-800 shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📊 Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'cards' 
                  ? 'bg-white text-slate-800 shadow-md' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📱 Cards
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {viewMode === 'cards' ? <CardView /> : <TableView />}
      </div>
      
      {/* Footer */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <p className="text-sm text-gray-600">
            💡 <strong>Net Wealth</strong> = Total Portfolio - HELOC Debt • Shows true Smith Manoeuvre value
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>Positive Growth</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>Moderate Risk</span>
            <span className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
