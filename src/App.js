import React, { useState } from 'react';
import '@xyflow/react/dist/style.css';

// Components
import YearDetails from './YearDetails';
import FinancialForm from './components/form/FinancialForm';
import ComparisonSummary from './components/summary/ComparisonSummary';
import DataTable from './components/table/DataTable';
import TestRunner from './components/testing/TestRunner';
import HamburgerMenu from './components/navigation/HamburgerMenu';
import SmithManoeuvreTracker from './components/tracking/SmithManoeuvreTracker';

// Hooks
import { useFormData } from './hooks/useFormData';

// Utils
import { 
  generateFinancialData, 
  calculateTraditionalPayoff, 
  calculateSmithManoeuvrePayoff 
} from './utils/financialCalculations';

const App = () => {
  // Custom hook for form state management
  const { formData, handleChange } = useFormData();

  // Local component state
  const [currentPage, setCurrentPage] = useState('calculator');
  const [tableData, setTableData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTests, setShowTests] = useState(false);

  const handleGenerateTable = async () => {
    try {
      setIsLoading(true);
      
      // Generate financial data using utility function
      const data = generateFinancialData(formData);
      setTableData(data);
      
      // Calculate comparison data
      const traditionalPayoff = calculateTraditionalPayoff(
        formData.initialMortgage, 
        formData.mortgageRate, 
        formData.amortYears
      );
      
      const smithManoeuvrePayoff = calculateSmithManoeuvrePayoff(data);
      
      setComparisonData({
        traditional: traditionalPayoff,
        smithManoeuvre: smithManoeuvrePayoff,
        timeSaved: traditionalPayoff.years - smithManoeuvrePayoff.years,
        interestSaved: traditionalPayoff.totalInterest - (smithManoeuvrePayoff.totalLeveraged || 0),
        wealthBuilt: smithManoeuvrePayoff.finalPortfolio || 0
      });
    } catch (error) {
      console.error('Error generating financial data:', error);
      // Could add error state and user notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearSelection = (year) => {
    setSelectedYear(year);
  };

  const handleCloseYearDetails = () => {
    setSelectedYear(null);
  };

  const renderCalculatorPage = () => (
    <div className="max-w-6xl mx-auto px-8 py-5 text-gray-800">
      {/* Financial Form */}
      <FinancialForm 
        formData={formData}
        onChange={handleChange}
      />

      {/* Generate Button */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={handleGenerateTable}
          disabled={isLoading}
          className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-all ${
            isLoading 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:translate-y-0'
          }`}
          aria-label="Generate financial simulation table"
        >
          {isLoading ? 'Calculating...' : 'Generate Table'}
        </button>
      </div>

      {/* Comparison Summary */}
      <ComparisonSummary comparisonData={comparisonData} smithData={tableData} />

      {/* Toggle Test Runner */}
      <div className="mb-8 text-center">
        <button
          onClick={() => setShowTests(!showTests)}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {showTests ? 'Hide' : 'Show'} Calculation Validation Tests
        </button>
      </div>

      {/* Test Runner (conditionally displayed) */}
      {showTests && <TestRunner />}

      {/* Data Table */}
      <DataTable 
        tableData={tableData}
        selectedYear={selectedYear}
        onRowClick={handleYearSelection}
      />

      {/* Year Details Modal */}
      {selectedYear && (
        <YearDetails 
          year={selectedYear} 
          onClose={handleCloseYearDetails} 
          tableData={tableData} 
        />
      )}
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'calculator':
        return renderCalculatorPage();
      case 'tracker':
        return <SmithManoeuvreTracker />;
      default:
        return renderCalculatorPage();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header with Navigation */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu */}
            <HamburgerMenu 
              onPageChange={setCurrentPage}
              currentPage={currentPage}
            />
            
            {/* Title */}
            <div className="flex-1 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                {currentPage === 'calculator' ? 'Financial Simulation Calculator' : 'Smith Manoeuvre Tracker'}
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {currentPage === 'calculator' ? 'Smith Manoeuvre Strategy Analysis Tool' : 'Track Interest & Investments for ACB'}
              </p>
            </div>
            
            {/* Spacer to balance hamburger menu */}
            <div className="w-12"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default App;
