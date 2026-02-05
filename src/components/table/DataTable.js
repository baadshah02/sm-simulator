import React from 'react';

const TABLE_HEADERS = [
  { key: 'year', label: 'Year', align: 'left' },
  { key: 'mortgageBalance', label: 'Mortgage Balance', align: 'right' },
  { key: 'helocBalance', label: 'HELOC Balance', align: 'right' },
  { key: 'helocInterest', label: 'HELOC Interest', align: 'right' },
  { key: 'portfolioValue', label: 'Portfolio Value', align: 'right' },
  { key: 'tfsaValue', label: 'TFSA Value', align: 'right' },
  { key: 'rrspValue', label: 'RRSP Value', align: 'right' },
  { key: 'taxRefund', label: 'Tax Refund', align: 'right' },
  { key: 'principalBuilt', label: 'Principal Built', align: 'right' }
];

const DataTable = ({ tableData, selectedYear, onRowClick }) => {
  if (!tableData || tableData.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-md p-6 mb-8">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            {TABLE_HEADERS.map((header) => (
              <th 
                key={header.key}
                className={`p-3 font-semibold text-gray-700 sticky top-0 bg-gray-100 ${
                  header.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr 
              key={row.year} 
              className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedYear === row.year ? 'bg-blue-50' : ''
              }`}
              onClick={() => onRowClick(row.year)}
            >
              {TABLE_HEADERS.map((header) => (
                <td 
                  key={header.key}
                  className={`p-3 border-b border-gray-200 ${
                    header.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {header.key === 'year' ? row[header.key] : row[header.key].toLocaleString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
