import React, { useState } from 'react';
import YearDetails from './YearDetails';
import '@xyflow/react/dist/style.css';

function App() {
  const [formData, setFormData] = useState({
    initialMortgage: 1091000,
    mortgageRate: 3.65,
    amortYears: 30,
    helocRate: 4.70,
    taxRate: 53.5,
    annualReturn: 7,
    growthRate: 7,
    dividendYield: 4,
    initialTfsa: 955 * 39.79,
    tfsaRoomYear1: 42000,
    annualTfsaIncrease: 7000,
    rrspYear1: 50000,
    rrspOngoing: 25000,
    initialHelocAvailable: 300000,
  });

  const [tableData, setTableData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
  };

  const generateTable = () => {
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

      // Calculate values
      const additionalDeductible = P - nonDeductibleFromP;
      const averageDeductible = currentDeductible + additionalDeductible / 2;
      const deductibleInterest = helocRate * averageDeductible;
      const refund = rrspContrib * taxRate + deductibleInterest * taxRate;
      const averageNonReg = currentNonReg + additionalDeductible / 2;
      const helocInterest = helocRate * (currentHeloc - P + P / 2); // average = beginning + P/2
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

    setTableData(data);
  };

return (
    <div className="max-w-6xl mx-auto p-5 bg-gray-100 min-h-screen text-gray-800">
      <header className="text-center mb-8 p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-900">Financial Simulation Calculator</h1>
      </header>
      <main className="flex flex-col items-center">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-6 p-6 bg-white rounded-xl shadow-md">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Initial Mortgage:</label>
            <input type="number" name="initialMortgage" value={formData.initialMortgage} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Mortgage Rate (%):</label>
            <input type="number" step="0.01" name="mortgageRate" value={formData.mortgageRate} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Amortization Years:</label>
            <input type="number" name="amortYears" value={formData.amortYears} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">HELOC Rate (%):</label>
            <input type="number" step="0.01" name="helocRate" value={formData.helocRate} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Tax Rate (%):</label>
            <input type="number" step="0.01" name="taxRate" value={formData.taxRate} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Annual Return (%):</label>
            <input type="number" step="0.01" name="annualReturn" value={formData.annualReturn} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Growth Rate (%):</label>
            <input type="number" step="0.01" name="growthRate" value={formData.growthRate} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Dividend Yield (%):</label>
            <input type="number" step="0.01" name="dividendYield" value={formData.dividendYield} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Initial TFSA Value:</label>
            <input type="number" name="initialTfsa" value={formData.initialTfsa} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">TFSA Room Year 1:</label>
            <input type="number" name="tfsaRoomYear1" value={formData.tfsaRoomYear1} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Annual TFSA Increase:</label>
            <input type="number" name="annualTfsaIncrease" value={formData.annualTfsaIncrease} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">RRSP Year 1:</label>
            <input type="number" name="rrspYear1" value={formData.rrspYear1} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">RRSP Ongoing:</label>
            <input type="number" name="rrspOngoing" value={formData.rrspOngoing} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Initial HELOC Available:</label>
            <input type="number" name="initialHelocAvailable" value={formData.initialHelocAvailable} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </form>
        <button onClick={generateTable} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 active:translate-y-0 transition-all mb-8">Generate Table</button>
        {tableData.length > 0 && (
          <div className="w-full overflow-x-auto bg-white rounded-xl shadow-md p-6 mb-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-semibold text-gray-700 sticky top-0 bg-gray-100">Year</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">Mortgage Balance</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">HELOC Balance</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">HELOC Interest</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">Portfolio Value</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">TFSA Value</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">RRSP Value</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">Tax Refund</th>
                  <th className="p-3 text-right font-semibold text-gray-700 sticky top-0 bg-gray-100">Principal Built</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row) => (
                  <tr 
                    key={row.year} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedYear === row.year ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedYear(row.year)}
                  >
                    <td className="p-3 border-b border-gray-200">{row.year}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.mortgageBalance.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.helocBalance.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.helocInterest.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.portfolioValue.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.tfsaValue.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.rrspValue.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.taxRefund.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-200">{row.principalBuilt.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedYear && (
          <YearDetails 
            year={selectedYear} 
            onClose={() => setSelectedYear(null)} 
            tableData={tableData} 
          />
        )}

      </main>
    </div>
  );
}

export default App;