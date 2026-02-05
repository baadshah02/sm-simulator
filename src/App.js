import React, { useState } from 'react';
import '@xyflow/react/dist/style.css';

// Components
import YearDetails from './YearDetails';
import FinancialForm from './components/form/FinancialForm';
import ComparisonSummary from './components/summary/ComparisonSummary';
import DataTable from './components/table/DataTable';

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
  const [tableData, setTableData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="max-w-6xl mx-auto p-5 bg-gray-100 min-h-screen text-gray-800">
      {/* Header */}
      <header className="text-center mb-8 p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-900">
          Financial Simulation Calculator
        </h1>
        <p className="text-gray-600 mt-2">
          Smith Manoeuvre Strategy Analysis Tool
        </p>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center">
        {/* Financial Form */}
        <FinancialForm 
          formData={formData}
          onChange={handleChange}
        />

        {/* Generate Button */}
        <button 
          onClick={handleGenerateTable}
          disabled={isLoading}
          className={`px-6 py-3 font-semibold rounded-lg shadow-md transition-all mb-8 ${
            isLoading 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:translate-y-0'
          }`}
          aria-label="Generate financial simulation table"
        >
          {isLoading ? 'Calculating...' : 'Generate Table'}
        </button>

        {/* Comparison Summary */}
        <ComparisonSummary comparisonData={comparisonData} />

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
      </main>
    </div>
  );
};

export default App;
