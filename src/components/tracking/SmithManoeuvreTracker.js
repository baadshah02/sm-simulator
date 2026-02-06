import React, { useState, useMemo } from 'react';

const InterestTrackingTab = ({ 
  interestRecords, 
  setInterestRecords, 
  interestForm, 
  setInterestForm,
  handleInterestSubmit,
  interestSummary,
  formatCurrency,
  formatDate,
  selectedYear,
  setSelectedYear,
  accountTypes,
  months 
}) => (
  <div className="space-y-8">
    {/* Year Selector */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">View Year</h3>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {[...Array(10)].map((_, i) => {
            const year = new Date().getFullYear() - 5 + i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>
      </div>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Total Interest {selectedYear}</h3>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(interestSummary.totalInterest)}</p>
          </div>
          <div className="text-blue-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900">Deductible Portion</h3>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(interestSummary.totalDeductible)}</p>
          </div>
          <div className="text-green-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Records</h3>
            <p className="text-2xl font-bold text-purple-700">{interestSummary.recordCount}</p>
          </div>
          <div className="text-purple-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Add Interest Payment Form */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="mr-3 text-2xl">💳</span>
        Add Interest Payment
      </h3>
      
      <form onSubmit={handleInterestSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={interestForm.date}
            onChange={(e) => setInterestForm(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interest Amount</label>
          <input
            type="number"
            step="0.01"
            value={interestForm.interestAmount}
            onChange={(e) => setInterestForm(prev => ({ ...prev, interestAmount: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account
            <span className="text-xs text-gray-500 ml-2">(Auto-determines deductibility)</span>
          </label>
          <select
            value={interestForm.account}
            onChange={(e) => setInterestForm(prev => ({ ...prev, account: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {accountTypes.map(account => (
              <option key={account.value} value={account.value}>
                {account.label} {account.deductible ? '(Deductible)' : '(Non-deductible)'}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <input
            type="text"
            value={interestForm.notes}
            onChange={(e) => setInterestForm(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional notes"
          />
        </div>
        
        <div className="md:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Interest Payment
          </button>
        </div>
      </form>
    </div>

    {/* Interest Records Table */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-3 text-2xl">📋</span>
          Interest Payment History
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deductible</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interestRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No interest payment records yet. Add your first record above.
                </td>
              </tr>
            ) : (
              interestRecords.slice().reverse().map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(record.interestAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      record.account && record.account.includes('Investment') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.account || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-semibold">
                    {formatCurrency(record.deductiblePortion)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const InvestmentTrackingTab = ({
  investmentRecords,
  setInvestmentRecords,
  investmentForm,
  setInvestmentForm,
  handleInvestmentSubmit,
  handleInvestmentChange,
  investmentSummary,
  formatCurrency,
  formatDate,
  currentYear
}) => (
  <div className="space-y-8">
    {/* Investment Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-xl border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">Total Invested {currentYear}</h3>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(investmentSummary.totalInvested)}</p>
          </div>
          <div className="text-emerald-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-xl border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">Investment Records</h3>
            <p className="text-2xl font-bold text-indigo-700">{investmentSummary.recordCount}</p>
          </div>
          <div className="text-indigo-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Add Investment Form */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="mr-3 text-2xl">📈</span>
        Add Investment Record
      </h3>
      
      <form onSubmit={handleInvestmentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={investmentForm.date}
            onChange={(e) => handleInvestmentChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Investment Type</label>
          <select
            value={investmentForm.investmentType}
            onChange={(e) => handleInvestmentChange('investmentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Non-Registered">Non-Registered</option>
            <option value="TFSA">TFSA</option>
            <option value="RRSP">RRSP</option>
            <option value="RESP">RESP</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
          <input
            type="text"
            value={investmentForm.symbol}
            onChange={(e) => handleInvestmentChange('symbol', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., AAPL, VTI"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Company/Fund Name</label>
          <input
            type="text"
            value={investmentForm.companyName}
            onChange={(e) => handleInvestmentChange('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Apple Inc., Vanguard Total Stock Market"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shares</label>
          <input
            type="number"
            step="0.001"
            value={investmentForm.shares}
            onChange={(e) => handleInvestmentChange('shares', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.000"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price per Share</label>
          <input
            type="number"
            step="0.01"
            value={investmentForm.pricePerShare}
            onChange={(e) => handleInvestmentChange('pricePerShare', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
          <input
            type="number"
            step="0.01"
            value={investmentForm.totalAmount}
            onChange={(e) => handleInvestmentChange('totalAmount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Auto-calculated"
            readOnly
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Commission</label>
          <input
            type="number"
            step="0.01"
            value={investmentForm.commission}
            onChange={(e) => handleInvestmentChange('commission', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={investmentForm.currency}
            onChange={(e) => handleInvestmentChange('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <input
            type="text"
            value={investmentForm.notes}
            onChange={(e) => handleInvestmentChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional notes"
          />
        </div>
        
        <div className="md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Add Investment Record
          </button>
        </div>
      </form>
    </div>

    {/* Investment Records Table */}
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-3 text-2xl">📊</span>
          Investment History
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {investmentRecords.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  No investment records yet. Add your first investment above.
                </td>
              </tr>
            ) : (
              investmentRecords.slice().reverse().map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      record.investmentType === 'Non-Registered' ? 'bg-blue-100 text-blue-800' :
                      record.investmentType === 'TFSA' ? 'bg-green-100 text-green-800' :
                      record.investmentType === 'RRSP' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {record.investmentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.symbol}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {record.shares.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(record.pricePerShare)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(record.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {record.commission > 0 ? formatCurrency(record.commission) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const SmithManoeuvreTracker = () => {
  const [activeTab, setActiveTab] = useState('interest');
  const [interestRecords, setInterestRecords] = useState([]);
  const [investmentRecords, setInvestmentRecords] = useState([]);
  
  // Interest Payment Form State
  const [interestForm, setInterestForm] = useState({
    date: '',
    interestAmount: '',
    account: 'HELOC - Investment',
    notes: ''
  });

  const currentYear = new Date().getFullYear();
  
  // Year selector state
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Account types and their deductibility
  const accountTypes = [
    { value: 'HELOC - Investment', label: 'HELOC - Investment', deductible: true },
    { value: 'HELOC - Personal', label: 'HELOC - Personal', deductible: false },
    { value: 'Mortgage - Investment', label: 'Mortgage - Investment', deductible: true },
    { value: 'Mortgage - Personal', label: 'Mortgage - Personal', deductible: false },
    { value: 'Line of Credit - Investment', label: 'Line of Credit - Investment', deductible: true },
    { value: 'Line of Credit - Personal', label: 'Line of Credit - Personal', deductible: false }
  ];

  // Helper function to determine if account is deductible
  const isAccountDeductible = (accountValue) => {
    const account = accountTypes.find(acc => acc.value === accountValue);
    return account ? account.deductible : false;
  };

  // Investment Form State
  const [investmentForm, setInvestmentForm] = useState({
    date: '',
    investmentType: 'Non-Registered',
    symbol: '',
    companyName: '',
    shares: '',
    pricePerShare: '',
    totalAmount: '',
    commission: '',
    currency: 'CAD',
    notes: ''
  });
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate totals for summary
  const interestSummary = useMemo(() => {
    const selectedYearRecords = interestRecords.filter(record => 
      new Date(record.date).getFullYear() === selectedYear
    );
    const totalInterest = selectedYearRecords.reduce((sum, record) => sum + parseFloat(record.interestAmount || 0), 0);
    const totalDeductible = selectedYearRecords.reduce((sum, record) => sum + parseFloat(record.deductiblePortion || 0), 0);
    
    return { totalInterest, totalDeductible, recordCount: selectedYearRecords.length };
  }, [interestRecords, selectedYear]);

  const investmentSummary = useMemo(() => {
    const currentYearRecords = investmentRecords.filter(record => 
      new Date(record.date).getFullYear() === currentYear
    );
    const totalInvested = currentYearRecords.reduce((sum, record) => 
      sum + parseFloat(record.totalAmount || 0) + parseFloat(record.commission || 0), 0
    );
    
    return { totalInvested, recordCount: currentYearRecords.length };
  }, [investmentRecords, currentYear]);

  // Handle Interest Form
  const handleInterestSubmit = (e) => {
    e.preventDefault();
    
    const interestAmount = parseFloat(interestForm.interestAmount);
    const deductiblePortion = isAccountDeductible(interestForm.account) ? interestAmount : 0;
    
    const newRecord = {
      id: Date.now(),
      ...interestForm,
      interestAmount,
      deductiblePortion,
      createdAt: new Date().toISOString()
    };

    setInterestRecords(prev => [...prev, newRecord]);
    setInterestForm({
      date: '',
      interestAmount: '',
      account: 'HELOC - Investment',
      notes: ''
    });
  };

  // Handle Investment Form
  const handleInvestmentSubmit = (e) => {
    e.preventDefault();
    
    const newRecord = {
      id: Date.now(),
      ...investmentForm,
      shares: parseFloat(investmentForm.shares),
      pricePerShare: parseFloat(investmentForm.pricePerShare),
      totalAmount: parseFloat(investmentForm.totalAmount),
      commission: parseFloat(investmentForm.commission || 0),
      createdAt: new Date().toISOString()
    };

    setInvestmentRecords(prev => [...prev, newRecord]);
    setInvestmentForm({
      date: '',
      investmentType: 'Non-Registered',
      symbol: '',
      companyName: '',
      shares: '',
      pricePerShare: '',
      totalAmount: '',
      commission: '',
      currency: 'CAD',
      notes: ''
    });
  };

  // Auto-calculate total amount when shares and price change
  const handleInvestmentChange = (field, value) => {
    const updatedForm = { ...investmentForm, [field]: value };
    
    if (field === 'shares' || field === 'pricePerShare') {
      const shares = parseFloat(updatedForm.shares || 0);
      const price = parseFloat(updatedForm.pricePerShare || 0);
      updatedForm.totalAmount = (shares * price).toFixed(2);
    }
    
    setInvestmentForm(updatedForm);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Smith Manoeuvre Tracker
        </h1>
        <p className="text-gray-600">
          Track monthly interest payments and investments for accurate ACB calculations and tax reporting
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('interest')}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'interest'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💳 Interest Payments
          </button>
          <button
            onClick={() => setActiveTab('investments')}
            className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'investments'
                ? 'bg-white text-emerald-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 Investment Records
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'interest' ? (
        <InterestTrackingTab 
          interestRecords={interestRecords}
          setInterestRecords={setInterestRecords}
          interestForm={interestForm}
          setInterestForm={setInterestForm}
          handleInterestSubmit={handleInterestSubmit}
          interestSummary={interestSummary}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          accountTypes={accountTypes}
          months={months}
        />
      ) : (
        <InvestmentTrackingTab
          investmentRecords={investmentRecords}
          setInvestmentRecords={setInvestmentRecords}
          investmentForm={investmentForm}
          setInvestmentForm={setInvestmentForm}
          handleInvestmentSubmit={handleInvestmentSubmit}
          handleInvestmentChange={handleInvestmentChange}
          investmentSummary={investmentSummary}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          currentYear={currentYear}
        />
      )}
    </div>
  );
};

export default SmithManoeuvreTracker;
