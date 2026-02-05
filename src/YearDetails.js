import React, { useState, useEffect, useMemo } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Enhanced Custom Node Component with integrated info display
const FinancialNode = ({ data, selected, onShowDetails }) => {

  const getNodeStyle = (type) => {
    const styles = {
      borrow: {
        gradient: 'from-red-50 to-red-100',
        border: 'border-red-300',
        text: 'text-red-700',
        icon: '🏦',
        iconBg: 'bg-red-500'
      },
      invest: {
        gradient: 'from-green-50 to-green-100',
        border: 'border-green-300',
        text: 'text-green-700',
        icon: '📈',
        iconBg: 'bg-green-500'
      },
      tax: {
        gradient: 'from-blue-50 to-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-700',
        icon: '💰',
        iconBg: 'bg-blue-500'
      },
      mortgage: {
        gradient: 'from-purple-50 to-purple-100',
        border: 'border-purple-300',
        text: 'text-purple-700',
        icon: '🏠',
        iconBg: 'bg-purple-500'
      },
      growth: {
        gradient: 'from-emerald-50 to-emerald-100',
        border: 'border-emerald-300',
        text: 'text-emerald-700',
        icon: '🚀',
        iconBg: 'bg-emerald-500'
      },
      cycle: {
        gradient: 'from-orange-50 to-orange-100',
        border: 'border-orange-300',
        text: 'text-orange-700',
        icon: '🔄',
        iconBg: 'bg-orange-500'
      }
    };
    return styles[type] || styles.invest;
  };

  const style = getNodeStyle(data.type);

  return (
    <>
      <div
        className={`
          relative p-3 sm:p-4 rounded-2xl border-2 shadow-lg cursor-pointer
          bg-gradient-to-br ${style.gradient} ${style.border}
          hover:shadow-xl transform transition-all duration-300 hover:scale-105
          w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px]
        `}
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails(data);
        }}
      >
        {/* Connection handles for React Flow */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{ backgroundColor: '#10b981', width: 8, height: 8, left: -4 }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{ backgroundColor: '#10b981', width: 8, height: 8, top: -4 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{ backgroundColor: '#10b981', width: 8, height: 8, right: -4 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{ backgroundColor: '#10b981', width: 8, height: 8, bottom: -4 }}
        />
        {/* Icon */}
        <div className="flex justify-center mb-2 sm:mb-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${style.iconBg} flex items-center justify-center text-white text-lg sm:text-xl shadow-md`}>
            {style.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-center text-xs sm:text-sm leading-tight mb-1 sm:mb-2">
          {data.title}
        </h3>

        {/* Amount */}
        {data.amount && (
          <div className={`text-center text-sm sm:text-lg font-bold ${style.text} mb-1 sm:mb-2`}>
            {data.amount.toString().includes('%') ? data.amount : `$${data.amount}`}
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-gray-600 text-center leading-relaxed hidden sm:block">
          {data.description}
        </p>

        {/* Click indicator */}
        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-60" />
      </div>

    </>
  );
};

const nodeTypes = { financial: FinancialNode };

function YearDetails({ year, onClose, tableData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeInfoPanel, setActiveInfoPanel] = useState(null);
  
  const handleShowDetails = (nodeData) => {
    setActiveInfoPanel(activeInfoPanel?.id === nodeData.id ? null : nodeData);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Data processing
  const row = tableData.find(r => r.year === year);
  if (!row) return null;

  const { details } = row;
  const { beginning, assumptions, calculations, end, percentChanges } = details;

  // Create detailed step data for accurate Smith Manoeuvre visualization
  const stepData = useMemo(() => [
    {
      id: '1',
      title: 'Initial HELOC Borrowing',
      type: 'borrow',
      amount: (assumptions.rrspContrib + assumptions.tfsaContrib).toLocaleString(),
      description: 'Borrow from HELOC to fund TFSA/RRSP in Year 1',
      tooltipTitle: 'Year 1: Initial Investment Funding',
      tooltipContent: `Step 1: Borrow $${(assumptions.rrspContrib + assumptions.tfsaContrib).toLocaleString()} from HELOC to fully fund RRSP ($${assumptions.rrspContrib.toLocaleString()}) and TFSA ($${assumptions.tfsaContrib.toLocaleString()}) for the year. This creates the initial tax-deductible debt.`,
      moneyFlow: `HELOC → RRSP: $${assumptions.rrspContrib.toLocaleString()}, HELOC → TFSA: $${assumptions.tfsaContrib.toLocaleString()}`
    },
    {
      id: '2',
      title: 'RRSP Tax Refund',
      type: 'tax',
      amount: Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString(),
      description: 'RRSP contribution triggers government tax refund',
      tooltipTitle: 'Tax Refund Result',
      tooltipContent: `Step 2: The $${assumptions.rrspContrib.toLocaleString()} RRSP contribution generates a tax refund of $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()} at ${assumptions.taxRate}% tax rate. This is the government's contribution to your strategy.`,
      moneyFlow: `Government returns $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()} via tax refund`
    },
    {
      id: '3',
      title: 'Tax Refund → Mortgage',
      type: 'mortgage',
      amount: Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString(),
      description: 'Apply tax refund to mortgage principal',
      tooltipTitle: 'Mortgage Principal Payment',
      tooltipContent: `Step 3: Apply the entire $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()} tax refund directly to mortgage principal. This reduces non-deductible debt and creates available HELOC room.`,
      moneyFlow: `Tax refund → Mortgage principal reduction: $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()}`
    },
    {
      id: '4',
      title: 'Re-borrow for Investment',
      type: 'borrow',
      amount: Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString(),
      description: 'Borrow paid-down principal for non-reg investment',
      tooltipTitle: 'Debt Conversion Strategy',
      tooltipContent: `Step 4: Re-borrow the $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()} just paid down on the mortgage from HELOC. This converts non-deductible mortgage debt into tax-deductible investment debt.`,
      moneyFlow: `HELOC → Non-Registered Investment: $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()}`
    },
    {
      id: '5',
      title: 'Monthly Principal Payment',
      type: 'mortgage',
      amount: Math.round(calculations.standardPrincipal / 12).toLocaleString(),
      description: 'Monthly mortgage principal becomes available',
      tooltipTitle: 'Monthly Mortgage Principal Cycle',
      tooltipContent: `Step 5: Each month, approximately $${Math.round(calculations.standardPrincipal / 12).toLocaleString()} of your mortgage payment goes to principal (vs interest). This principal amount becomes available HELOC room that can be re-borrowed for investments. Dividends add a small additional amount (~$${Math.round((assumptions.initialNonReg * (assumptions.dividendYield / 100)) / 12).toLocaleString()}/month initially).`,
      moneyFlow: `Monthly mortgage principal: ~$${Math.round(calculations.standardPrincipal / 12).toLocaleString()}/month becomes available + small dividend income`
    },
    {
      id: '6',
      title: 'Monthly Cycle Repeat',
      type: 'cycle',
      amount: '12x',
      description: 'Repeat monthly: Principal → Mortgage → Re-borrow',
      tooltipTitle: 'Monthly Smith Manoeuvre Cycle',
      tooltipContent: `Step 6: Repeat monthly - Take principal buildup from investments, apply to mortgage, then re-borrow for more investments. This happens 12 times per year, compounding the strategy's effectiveness.`,
      moneyFlow: `Monthly cycle: Investment principal → Mortgage → HELOC → New investments (12x per year)`
    },
    {
      id: '7',
      title: 'Annual Portfolio Result',
      type: 'growth',
      amount: `+${percentChanges.portfolio}%`,
      description: 'Year-end portfolio growth from strategy',
      tooltipTitle: 'Annual Growth Results',
      tooltipContent: `Step 7: By year end, the combined effect of tax-advantaged investing, debt conversion, and monthly compounding results in ${percentChanges.portfolio}% portfolio growth worth $${Math.round(end.portfolio).toLocaleString()}.`,
      moneyFlow: `Total portfolio value: $${Math.round(end.portfolio).toLocaleString()} (+${percentChanges.portfolio}%)`
    }
  ], [calculations, assumptions, percentChanges, end.portfolio]);

  // Create nodes with proper spacing to avoid overlap
  const computedNodes = useMemo(() => {
    // Better positioning with more space between cards
    const positions = [
      { x: 50, y: 50 },      // Borrow HELOC
      { x: 350, y: 50 },     // Invest  
      { x: 650, y: 50 },     // Tax Refund
      { x: 650, y: 300 },    // Pay Mortgage
      { x: 350, y: 300 },    // Re-advance
      { x: 50, y: 300 },     // Additional Investment
      { x: 350, y: 550 }     // Growth
    ];

    return stepData.map((step, index) => ({
      id: step.id,
      position: positions[index],
      data: step,
      type: 'financial',
      draggable: false,
      selectable: false,
    }));
  }, [stepData]);

  // Create flexible animated edges with better label positioning
  const computedEdges = useMemo(() => {
    const edgeConnections = [
      { from: '1', to: '2', label: `$${Math.round(calculations.P / 1000)}K`, sourceHandle: 'right', targetHandle: 'left', pathOptions: { offset: 20, curvature: 0.3 } },
      { from: '2', to: '3', label: `$${Math.round(calculations.refund / 1000)}K`, sourceHandle: 'right', targetHandle: 'left', pathOptions: { offset: 20, curvature: 0.3 } },
      { from: '3', to: '4', label: `$${Math.round(calculations.P / 1000)}K`, sourceHandle: 'bottom', targetHandle: 'top', pathOptions: { offset: 30, curvature: 0.4 } },
      { from: '4', to: '5', label: `$${Math.round(calculations.P / 1000)}K`, sourceHandle: 'left', targetHandle: 'right', pathOptions: { offset: 25, curvature: 0.3 } },
      { from: '5', to: '6', label: `$${Math.round(calculations.additionalDeductible / 1000)}K`, sourceHandle: 'left', targetHandle: 'right', pathOptions: { offset: 25, curvature: 0.3 } },
      { from: '6', to: '7', label: `+${percentChanges.portfolio}%`, sourceHandle: 'bottom', targetHandle: 'top', pathOptions: { offset: 30, curvature: 0.4 } }
    ];

    return edgeConnections.map((connection, index) => ({
      id: `edge-${connection.from}-${connection.to}`,
      source: connection.from,
      sourceHandle: connection.sourceHandle,
      target: connection.to,
      targetHandle: connection.targetHandle,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: '#10b981',
        strokeWidth: 3,
        strokeDasharray: '10,5',
      },
      markerEnd: {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: '#10b981',
      },
      label: connection.label,
      labelStyle: {
        fill: '#065f46',
        fontSize: 12,
        fontWeight: 600,
        textShadow: '0 2px 4px rgba(255,255,255,0.9)'
      },
      labelBgStyle: {
        fill: '#ecfdf5',
        stroke: '#10b981',
        strokeWidth: 1.5,
        rx: 6,
        ry: 6,
        padding: 4
      },
      pathOptions: connection.pathOptions
    }));
  }, [calculations.P, calculations.refund, calculations.additionalDeductible, percentChanges.portfolio]);

  // Update React Flow when data changes
  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 md:inset-4 bg-white shadow-2xl md:rounded-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-900">
              Year {year} Financial Flow
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-all"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content with scrolling */}
        <div className="flex-1 overflow-y-auto">
          {/* Summary Cards */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <div className="text-xl font-bold text-red-600">${calculations.P.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Leveraged</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <div className="text-xl font-bold text-green-600">${calculations.refund.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Tax Savings</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <div className="text-xl font-bold text-blue-600">+{percentChanges.portfolio}%</div>
                <div className="text-sm text-gray-600">Portfolio Growth</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                <div className="text-xl font-bold text-purple-600">${Math.round(end.portfolio).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Final Portfolio</div>
              </div>
            </div>
          </div>

          {/* Main Flow Diagram */}
          <div className="bg-gray-50 p-3 sm:p-6">
            <div className="h-[700px] relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <ReactFlow
                nodes={computedNodes}
                edges={computedEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={{ 
                  financial: (props) => <FinancialNode {...props} onShowDetails={handleShowDetails} />
                }}
                onNodeClick={(event, node) => {
                  event.stopPropagation();
                  handleShowDetails(node.data);
                }}
                fitView
                fitViewOptions={{ padding: 50 }}
                minZoom={0.4}
                maxZoom={1.2}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                proOptions={{ hideAttribution: true }}
              >
                <Background variant="dots" gap={20} size={1} color="#e5e7eb" />
                <Controls showZoom showFitView showInteractive={false} />
              </ReactFlow>
            </div>
          </div>

          {/* Collapsible Detail Sections */}
          <div className="p-6 space-y-6 bg-white">
            {/* Beginning Values */}
            <details className="group rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all">
                <span className="text-lg font-semibold text-gray-800">Beginning of Year {year} Values</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <div className="px-5 pb-5 pt-3 space-y-3 text-sm bg-white">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Mortgage Balance:</span>
                  <span className="font-medium">${beginning.mortgage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>HELOC Balance:</span>
                  <span className="font-medium">${beginning.heloc.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>TFSA Value:</span>
                  <span className="font-medium">${beginning.tfsa.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>RRSP Value:</span>
                  <span className="font-medium">${beginning.rrsp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Non-Registered Value:</span>
                  <span className="font-medium">${beginning.nonReg.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t-2 border-blue-200 text-blue-900">
                  <span>Total Portfolio Value:</span>
                  <span>${beginning.portfolio.toLocaleString()}</span>
                </div>
              </div>
            </details>

            {/* End Values */}
            <details className="group rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all">
                <span className="text-lg font-semibold text-gray-800">End of Year {year} Values</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <div className="px-5 pb-5 pt-3 space-y-3 text-sm bg-white">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Mortgage Remaining:</span>
                  <span className="font-medium">${Math.round(end.mortgage).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>HELOC Balance:</span>
                  <span className="font-medium">${Math.round(end.heloc).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>TFSA Value:</span>
                  <span className="font-medium">${Math.round(end.tfsa).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>RRSP Value:</span>
                  <span className="font-medium">${Math.round(end.rrsp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Non-Registered Value:</span>
                  <span className="font-medium">${Math.round(end.nonReg).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t-2 border-green-200 text-green-900">
                  <span>Total Portfolio:</span>
                  <span>${Math.round(end.portfolio).toLocaleString()}</span>
                </div>
              </div>
            </details>

            {/* Key Calculations */}
            <details className="group rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow" open>
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all">
                <span className="text-lg font-semibold text-gray-800">Key Calculations & Strategy Details</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <div className="px-5 pb-5 pt-3 space-y-3 text-sm bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 border-b border-purple-200 pb-1">Core Calculations</h4>
                    <div className="flex justify-between py-1">
                      <span>Standard Principal Payment:</span>
                      <span className="font-medium">${calculations.standardPrincipal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Accelerated Principal (P):</span>
                      <span className="font-bold text-green-700">${calculations.P.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Total Tax Refund:</span>
                      <span className="font-bold text-blue-700">${calculations.refund.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Additional Deductible Debt:</span>
                      <span className="font-medium">${calculations.additionalDeductible.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 border-b border-purple-200 pb-1">Interest & Averages</h4>
                    <div className="flex justify-between py-1">
                      <span>Average Deductible Balance:</span>
                      <span className="font-medium">${calculations.averageDeductible.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Deductible HELOC Interest:</span>
                      <span className="font-medium">${calculations.deductibleInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Total HELOC Interest Charged:</span>
                      <span className="font-medium">${calculations.helocInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Average Non-Reg Balance:</span>
                      <span className="font-medium">${calculations.averageNonReg.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* Performance Analytics */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Year {year} Performance Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className={`text-lg font-bold ${percentChanges.portfolio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {percentChanges.portfolio >= 0 ? '+' : ''}{percentChanges.portfolio}%
                  </div>
                  <div className="text-xs text-gray-600">Total Portfolio Growth</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className={`text-lg font-bold ${percentChanges.mortgageDecrease > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    -{percentChanges.mortgageDecrease}%
                  </div>
                  <div className="text-xs text-gray-600">Mortgage Reduction</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl shadow-sm md:col-span-1 col-span-2">
                  <div className="text-lg font-bold text-blue-600">
                    ${Math.round((end.portfolio - beginning.portfolio)).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Net Wealth Increase</div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Footer with instructions */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">💡 Click on each card to see detailed strategy information</div>
              <div className="text-xs text-gray-500">
                Net Wealth Increase: ${Math.round(end.portfolio - beginning.portfolio).toLocaleString()} • 
                Mortgage Reduced: {percentChanges.mortgageDecrease}%
              </div>
            </div>
          </div>
      </div>

      {/* External Info Panel - Outside React Flow */}
      {activeInfoPanel && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={() => setActiveInfoPanel(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] z-[9999]">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-lg">{activeInfoPanel.tooltipTitle}</h3>
                  <button 
                    onClick={() => setActiveInfoPanel(null)}
                    className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed">{activeInfoPanel.tooltipContent}</p>
                
                {activeInfoPanel.moneyFlow && (
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="font-medium text-green-800 text-sm mb-2">💰 Money Flow Details:</div>
                    <div className="text-green-700 text-sm leading-relaxed">{activeInfoPanel.moneyFlow}</div>
                  </div>
                )}

                {/* Strategy Impact */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-800 font-medium text-sm">Strategy Impact:</div>
                  <div className="text-blue-700 text-sm mt-2">
                    {activeInfoPanel.type === 'borrow' && 'Creates tax-deductible debt for investment leverage'}
                    {activeInfoPanel.type === 'invest' && 'Builds wealth through tax-efficient compound growth'}
                    {activeInfoPanel.type === 'tax' && 'Government subsidizes investment through tax savings'}
                    {activeInfoPanel.type === 'mortgage' && 'Converts non-deductible debt to investment capital'}
                    {activeInfoPanel.type === 'growth' && 'Demonstrates compound wealth creation power'}
                    {activeInfoPanel.type === 'cycle' && 'Monthly repetition accelerates wealth building through compounding'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default YearDetails;
