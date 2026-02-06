import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Enhanced Custom Node Component with integrated info display
const FinancialNode = ({ data, selected, onShowDetails }) => {
  // Get hover state from data
  const isHovered = data.isHovered || false;

  const getNodeStyle = (type) => {
    const styles = {
      // TFSA Account Theme - Modern Teal (Tax-Free = Freedom)
      tfsa: {
        gradient: 'from-teal-50 to-cyan-100',
        border: 'border-teal-300',
        text: 'text-teal-700',
        icon: '💎',
        iconBg: 'bg-teal-500'
      },
      tfsaFlow: {
        gradient: 'from-teal-50 to-teal-100',
        border: 'border-teal-300',
        text: 'text-teal-700',
        icon: '🏦',
        iconBg: 'bg-teal-500'
      },
      // RRSP Account Theme - Modern Indigo (Tax-Deferred = Wise/Mature)  
      rrsp: {
        gradient: 'from-indigo-50 to-purple-100',
        border: 'border-indigo-300',
        text: 'text-indigo-700',
        icon: '🛡️',
        iconBg: 'bg-indigo-500'
      },
      rrspFlow: {
        gradient: 'from-indigo-50 to-indigo-100',
        border: 'border-indigo-300',
        text: 'text-indigo-700',
        icon: '💰',
        iconBg: 'bg-indigo-500'
      },
      // Non-Registered Account Theme - Modern Amber (Active Trading = Energy)
      nonReg: {
        gradient: 'from-amber-50 to-orange-100',
        border: 'border-amber-300',
        text: 'text-amber-700',
        icon: '⚡',
        iconBg: 'bg-amber-500'
      },
      nonRegFlow: {
        gradient: 'from-amber-50 to-amber-100',
        border: 'border-amber-300',
        text: 'text-amber-700',
        icon: '📈',
        iconBg: 'bg-amber-500'
      },
      // Legacy types for other cards
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
          hover:shadow-xl transform transition-transform duration-200
          w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px]
          ${isHovered ? 'scale-105' : 'scale-100'}
        `}
        style={{ opacity: data.nodeOpacity || 1 }}

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
            {data.amount}
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

function YearDetails({ year, onClose, tableData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeInfoPanel, setActiveInfoPanel] = useState(null);
  
  const handleShowDetails = (nodeData) => {
    setActiveInfoPanel(activeInfoPanel?.id === nodeData.id ? null : nodeData);
  };

  // Memoize nodeTypes
  const nodeTypes = useMemo(() => ({
    financial: (props) => <FinancialNode {...props} onShowDetails={handleShowDetails} />
  }), []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Data processing - Find row first but don't return early
  const row = tableData.find(r => r.year === year);
  
  // All hooks must be called before any conditional returns
  // Create detailed step-by-step cards showing complete money flow
  const stepData = useMemo(() => {
    if (!row) return [];
    
    const { details } = row;
    const { beginning, assumptions, calculations, end, percentChanges } = details;
    
    // Detailed step-by-step flow cards - Enhanced Smith Manoeuvre Breakdown
    return [
      // Step 1: Initial HELOC borrows for TFSA
      {
        id: 'step1-heloc-tfsa',
        title: 'Step 1: Fund TFSA',
        type: 'borrow',
        amount: `$${assumptions.tfsaContrib.toLocaleString()}`,
        description: 'HELOC → TFSA Investment',
        tooltipTitle: 'Step 1: HELOC Funds TFSA',
        tooltipContent: `Start of year: HELOC borrows $${assumptions.tfsaContrib.toLocaleString()} to fund your TFSA contribution. This creates immediate tax-free investment growth potential.`,
        moneyFlow: `HELOC Credit: $${assumptions.tfsaContrib.toLocaleString()} → TFSA Account`
      },
      
      // Step 2: Initial HELOC borrows for RRSP  
      {
        id: 'step2-heloc-rrsp',
        title: 'Step 2: Fund RRSP',
        type: 'borrow',
        amount: `$${assumptions.rrspContrib.toLocaleString()}`,
        description: 'HELOC → RRSP Investment',
        tooltipTitle: 'Step 2: HELOC Funds RRSP',
        tooltipContent: `Start of year: HELOC borrows $${assumptions.rrspContrib.toLocaleString()} to fund your RRSP contribution. This generates immediate tax refund of $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()}.`,
        moneyFlow: `HELOC Credit: $${assumptions.rrspContrib.toLocaleString()} → RRSP Account`
      },
      
      // Step 3: Initial non-registered investment funding
      {
        id: 'step3-heloc-nonreg-initial',
        title: 'Step 3: Fund Non-Reg',
        type: 'invest',
        amount: `$${Math.round(assumptions.initialNonReg).toLocaleString()}`,
        description: 'HELOC → Non-Registered',
        tooltipTitle: 'Step 3: Initial Non-Registered Investment',
        tooltipContent: `Beginning of year: You borrow $${Math.round(assumptions.initialNonReg).toLocaleString()} from the HELOC to purchase initial non-registered investments. This creates tax-deductible investment debt from day one.`,
        moneyFlow: `HELOC Credit: $${Math.round(assumptions.initialNonReg).toLocaleString()} → Non-Registered Account`
      },
      
      // Step 4A: Standard Mortgage Principal Payment
      {
        id: 'step4a-standard-principal',
        title: 'Step 4A: Standard Principal',
        type: 'mortgage',
        amount: `$${calculations.standardPrincipal.toLocaleString()}`,
        description: 'Regular Mortgage Payment',
        tooltipTitle: 'Step 4A: Standard Mortgage Principal Payment',
        tooltipContent: `Throughout year: Your regular mortgage payments include $${calculations.standardPrincipal.toLocaleString()} in principal reduction, creating available HELOC credit for reinvestment.`,
        moneyFlow: `Monthly Payments: $${calculations.standardPrincipal.toLocaleString()} → Mortgage Principal Reduction`
      },
      
      // Step 4B: Tax Refunds from RRSP
      {
        id: 'step4b-rrsp-refund',
        title: 'Step 4B: RRSP Tax Refund',
        type: 'tax',
        amount: `$${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()}`,
        description: 'CRA → Bank Account',
        tooltipTitle: 'Step 4B: RRSP Contribution Tax Refund',
        tooltipContent: `Tax time: Government provides $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()} tax refund from your $${assumptions.rrspContrib.toLocaleString()} RRSP contribution (${assumptions.taxRate}% tax rate).`,
        moneyFlow: `CRA RRSP Refund: $${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()} → Bank Account`
      },
      
      // Step 4C: Tax Refunds from Deductible Interest
      {
        id: 'step4c-interest-refund',
        title: 'Step 4C: Interest Tax Refund',
        type: 'tax',
        amount: `$${Math.round(calculations.deductibleInterest * (assumptions.taxRate / 100)).toLocaleString()}`,
        description: 'CRA → Bank Account',
        tooltipTitle: 'Step 4C: Deductible Interest Tax Refund',
        tooltipContent: `Tax time: Government provides $${Math.round(calculations.deductibleInterest * (assumptions.taxRate / 100)).toLocaleString()} tax refund from $${calculations.deductibleInterest.toLocaleString()} in tax-deductible investment interest (${assumptions.taxRate}% tax rate).`,
        moneyFlow: `CRA Interest Refund: $${Math.round(calculations.deductibleInterest * (assumptions.taxRate / 100)).toLocaleString()} → Bank Account`
      },
      
      // Step 4D: Dividend Income  
      {
        id: 'step4d-dividend-income',
        title: 'Step 4D: Dividend Income',
        type: 'invest',
        amount: `$${calculations.dividendsThisYear.toLocaleString()}`,
        description: 'Portfolio → Bank Account',
        tooltipTitle: 'Step 4D: Dividend Income from Investments',
        tooltipContent: `Throughout year: Your non-registered investments generate $${calculations.dividendsThisYear.toLocaleString()} in dividend income (${assumptions.dividendYield}% yield), providing additional capital for reinvestment.`,
        moneyFlow: `Investment Dividends: $${calculations.dividendsThisYear.toLocaleString()} → Bank Account`
      },
      
      // Step 5: All Components Combine into Total Principal (P)
      {
        id: 'step5-combine-p',
        title: 'Step 5: Total Principal (P)',
        type: 'cycle',
        amount: `$${Math.round(calculations.P).toLocaleString()}`,
        description: 'All Components Combined',
        tooltipTitle: 'Step 5: Smith Manoeuvre Formula Creates Total Principal (P)',
        tooltipContent: `Smith Manoeuvre Magic: All components (standard principal $${calculations.standardPrincipal.toLocaleString()} + tax refunds $${calculations.refund.toLocaleString()} + dividends $${calculations.dividendsThisYear.toLocaleString()} + compounding effects) combine using the Smith Manoeuvre formula to create total accelerated principal payment of $${Math.round(calculations.P).toLocaleString()}.`,
        moneyFlow: `Smith Manoeuvre Formula: Multiple Income Sources → Total Principal $${Math.round(calculations.P).toLocaleString()}`
      },
      
      // Step 6: Reinvest Total P Amount
      {
        id: 'step6-reinvest-p',
        title: 'Step 6: Reinvest Total P',
        type: 'invest',
        amount: `$${Math.round(calculations.P).toLocaleString()}`,
        description: 'HELOC → Non-Registered',
        tooltipTitle: 'Step 6: Reinvest Complete Principal Amount',
        tooltipContent: `Year-end: The complete $${Math.round(calculations.P).toLocaleString()} principal amount gets re-borrowed from HELOC and invested in non-registered investments, creating more tax-deductible debt and continuing the wealth-building cycle.`,
        moneyFlow: `HELOC Credit: $${Math.round(calculations.P).toLocaleString()} → Non-Registered Investments`
      },
      
      // Final Results: Investment Account Values
      {
        id: 'result-tfsa',
        title: 'TFSA Final Value',
        type: 'tfsa',
        amount: `$${Math.round(end.tfsa).toLocaleString()}`,
        description: 'Tax-Free Growth Result',
        tooltipTitle: 'TFSA Year-End Value',
        tooltipContent: `End of year: TFSA grows to $${Math.round(end.tfsa).toLocaleString()} through ${assumptions.annualReturn}% investment growth. All gains are completely tax-free forever!`,
        moneyFlow: `Investment Growth: $${assumptions.tfsaContrib.toLocaleString()} → $${Math.round(end.tfsa).toLocaleString()}`
      },
      
      {
        id: 'result-rrsp',
        title: 'RRSP Final Value',
        type: 'rrsp',
        amount: `$${Math.round(end.rrsp).toLocaleString()}`,
        description: 'Tax-Deferred Growth Result', 
        tooltipTitle: 'RRSP Year-End Value',
        tooltipContent: `End of year: RRSP grows to $${Math.round(end.rrsp).toLocaleString()} through ${assumptions.annualReturn}% investment growth. Withdrawals in retirement will be at lower tax rates.`,
        moneyFlow: `Investment Growth: $${assumptions.rrspContrib.toLocaleString()} → $${Math.round(end.rrsp).toLocaleString()}`
      },
      
      {
        id: 'result-nonreg',
        title: 'Non-Reg Final Value',
        type: 'nonReg',
        amount: `$${Math.round(end.nonReg).toLocaleString()}`,
        description: 'Tax-Deductible Growth Result',
        tooltipTitle: 'Non-Registered Year-End Value', 
        tooltipContent: `End of year: Non-registered account grows to $${Math.round(end.nonReg).toLocaleString()} through tax refund reinvestment and ${assumptions.annualReturn}% growth. HELOC interest is tax-deductible!`,
        moneyFlow: `Investment Growth: Tax refunds → $${Math.round(end.nonReg).toLocaleString()}`
      }
    ];
  }, [row]);

  // Create responsive layout
  const computedNodes = useMemo(() => {
    const spacingX = 500;
    const spacingY = 450;
    const startX = 150;
    const startY = 150;

    const positionById = {
      'step1-heloc-tfsa': { x: startX, y: startY },
      'step2-heloc-rrsp': { x: startX + spacingX, y: startY },
      'step3-heloc-nonreg-initial': { x: startX + spacingX * 2, y: startY },
      'step5-combine-p': { x: startX + spacingX * 4, y: startY + spacingY * 2 },
      'step6-reinvest-p': { x: startX + spacingX * 4, y: startY + spacingY * 3 },
      'step4a-standard-principal': { x: startX + spacingX * 3, y: startY },
      'step4b-rrsp-refund': { x: startX + spacingX * 1.5, y: startY + 380 },
      'step4c-interest-refund': { x: startX + spacingX * 2.5, y: startY + 380 },
      'step4d-dividend-income': { x: startX + spacingX * 3.5, y: startY + 380 },
      'result-tfsa': { x: startX, y: startY + spacingY * 3.5 },
      'result-rrsp': { x: startX + spacingX, y: startY + spacingY * 3.5 },
      'result-nonreg': { x: startX + spacingX * 2.5, y: startY + spacingY * 3.5 }
    };

    return stepData.map((step) => ({
      id: step.id,
      position: positionById[step.id] || { x: startX, y: startY },
      data: step,
      type: 'financial',
      draggable: true,
      selectable: true,
      deletable: false,
      connectable: false,
    }));
  }, [stepData]);

  // Create edge connections
  const computedEdges = useMemo(() => {
    if (!row) return [];
    
    const { details } = row;
    const { assumptions, calculations } = details;

    const edgeConnections = [
      { from: 'step2-heloc-rrsp', to: 'step4b-rrsp-refund', label: 'Generates refund' },
      { from: 'step3-heloc-nonreg-initial', to: 'step4c-interest-refund', label: 'Interest deduction' },
      { from: 'step3-heloc-nonreg-initial', to: 'step4d-dividend-income', label: 'Dividends' },
      { from: 'step4a-standard-principal', to: 'step5-combine-p', label: 'Principal component' },
      { from: 'step4b-rrsp-refund', to: 'step5-combine-p', label: 'Refund component' },
      { from: 'step4c-interest-refund', to: 'step5-combine-p', label: 'Tax savings' },
      { from: 'step4d-dividend-income', to: 'step5-combine-p', label: 'Income component' },
      { from: 'step5-combine-p', to: 'step6-reinvest-p', label: `$${Math.round(calculations.P / 1000)}K reinvested` },
      { from: 'step1-heloc-tfsa', to: 'result-tfsa', label: `${assumptions.annualReturn}% growth` },
      { from: 'step2-heloc-rrsp', to: 'result-rrsp', label: `${assumptions.annualReturn}% growth` },
      { from: 'step3-heloc-nonreg-initial', to: 'result-nonreg', label: 'Initial growth' },
      { from: 'step6-reinvest-p', to: 'result-nonreg', label: 'Additional growth' }
    ];

    return edgeConnections.map((connection, index) => {
      const routingMap = {
        'step2-heloc-rrsp-step4b-rrsp-refund': { color: '#3b82f6', sourceHandle: 'bottom', targetHandle: 'top', strokeWidth: 3 },
        'step3-heloc-nonreg-initial-step4c-interest-refund': { color: '#10b981', sourceHandle: 'right', targetHandle: 'left', strokeWidth: 3 },
        'step3-heloc-nonreg-initial-step4d-dividend-income': { color: '#f59e0b', sourceHandle: 'bottom', targetHandle: 'left', strokeWidth: 3 },
        'step4a-standard-principal-step5-combine-p': { color: '#8b5cf6', sourceHandle: 'right', targetHandle: 'top', strokeWidth: 4 },
        'step4b-rrsp-refund-step5-combine-p': { color: '#3b82f6', sourceHandle: 'right', targetHandle: 'left', strokeWidth: 4 },
        'step4c-interest-refund-step5-combine-p': { color: '#10b981', sourceHandle: 'right', targetHandle: 'left', strokeWidth: 4 },
        'step4d-dividend-income-step5-combine-p': { color: '#f59e0b', sourceHandle: 'right', targetHandle: 'left', strokeWidth: 4 },
        'step5-combine-p-step6-reinvest-p': { color: '#dc2626', sourceHandle: 'bottom', targetHandle: 'top', strokeWidth: 5 },
        'step1-heloc-tfsa-result-tfsa': { color: '#14b8a6', sourceHandle: 'bottom', targetHandle: 'top', strokeWidth: 3 },
        'step2-heloc-rrsp-result-rrsp': { color: '#6366f1', sourceHandle: 'bottom', targetHandle: 'top', strokeWidth: 3 },
        'step3-heloc-nonreg-initial-result-nonreg': { color: '#059669', sourceHandle: 'bottom', targetHandle: 'top', strokeWidth: 3 },
        'step6-reinvest-p-result-nonreg': { color: '#dc2626', sourceHandle: 'bottom', targetHandle: 'top', strokeWidth: 4 }
      };
      
      const key = `${connection.from}-${connection.to}`;
      const routing = routingMap[key] || { color: '#6b7280', sourceHandle: 'right', targetHandle: 'left', strokeWidth: 2 };
      
      return {
        id: `edge-${connection.from}-${connection.to}`,
        source: connection.from,
        target: connection.to,
        sourceHandle: routing.sourceHandle,
        targetHandle: routing.targetHandle,
        type: 'smoothstep',
        style: {
          stroke: routing.color,
          strokeWidth: routing.strokeWidth,
        },
        markerEnd: {
          type: 'arrowclosed',
          width: 12,
          height: 12,
          color: routing.color,
        },
        label: connection.label,
        labelStyle: {
          fill: '#ffffff',
          fontSize: 11,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: routing.color,
          stroke: routing.color,
          strokeWidth: 2,
          rx: 8,
          ry: 8,
        },
        labelShowBg: true,
        labelBgPadding: [10, 16]
      };
    });
  }, [row]);
  useEffect(() => {
    if (computedNodes.length > 0 && nodes.length === 0) {
      setNodes(computedNodes);
    }
  }, [computedNodes, nodes.length, setNodes]);

  useEffect(() => {
    if (computedEdges.length > 0) {
      setEdges(computedEdges);
    }
  }, [computedEdges, setEdges]);

  // Early return after all hooks are called
  if (!row) {
    return null;
  }

  const { details } = row;
  const { beginning, assumptions, calculations, end, percentChanges } = details;

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
            <div className="h-[80vh] relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <ReactFlow
                nodes={computedNodes}
                edges={computedEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeClick={(event, node) => {
                  event.stopPropagation();
                  handleShowDetails(node.data);
                }}
                fitView
                fitViewOptions={{ 
                  padding: 0.1,          // Reduced padding to fit more content
                  includeHiddenNodes: false,
                  minZoom: 0.2,          // Allow more zoom out to see everything
                  maxZoom: 1.5           // Adjusted maximum zoom
                }}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}  // Lower default zoom to fit all content
                minZoom={0.2}
                maxZoom={2.0}          // Allow more zoom for detailed viewing
                nodesDraggable={true}        // Enable user dragging
                nodesConnectable={false}     // Disable connecting new edges
                elementsSelectable={true}    // Enable selection for better UX
                nodeOrigin={[0.5, 0.5]}      // Center node origin for better dragging experience
                selectNodesOnDrag={false}    // Disable selection on drag to improve drag performance
                panOnDrag={true}             // Allow normal panning behavior
                panOnScroll={true}           // Allow panning with scroll
                zoomOnScroll={true}          // Allow zooming with scroll
                zoomOnPinch={true}           // Allow pinch-to-zoom on mobile
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
                      <span>🟢 Tax-Deductible Interest:</span>
                      <span className="font-medium text-green-700">${calculations.deductibleInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>🔴 Non-Tax-Deductible Interest:</span>
                      <span className="font-medium text-red-600">${Math.round(calculations.helocInterest - calculations.deductibleInterest).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-gray-200 pt-1">
                      <span>Total HELOC Interest Charged:</span>
                      <span className="font-bold">${calculations.helocInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Average Non-Reg Balance:</span>
                      <span className="font-medium">${calculations.averageNonReg.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* Interest Compounding & Tax Strategy Analysis */}
            <details className="group rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all">
                <span className="text-lg font-semibold text-gray-800">🔄 Interest-on-Interest Compounding & Tax Strategy</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <div className="px-5 pb-5 pt-3 space-y-4 text-sm bg-white">
                {/* Tax-Deductible Interest Flow */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                    🟢 Tax-Deductible Interest Strategy
                  </h5>
                  <div className="space-y-2 text-green-700">
                    <div className="flex justify-between border-b border-green-200 pb-1">
                      <span>Investment-backed HELOC Interest:</span>
                      <span className="font-medium">${calculations.deductibleInterest.toLocaleString()}</span>
                    </div>
                    <div className="text-sm leading-relaxed">
                      <strong>Compounding Effect:</strong> This ${calculations.deductibleInterest.toLocaleString()} interest gets <em>re-borrowed from HELOC</em> (added to investment debt) 
                      and generates a tax refund of ${Math.round(calculations.deductibleInterest * (assumptions.taxRate / 100)).toLocaleString()} 
                      ({assumptions.taxRate}% × ${calculations.deductibleInterest.toLocaleString()}). The government effectively pays {assumptions.taxRate}% of your investment interest!
                    </div>
                    <div className="bg-green-100 p-3 rounded border-l-4 border-green-500 text-green-800 text-xs">
                      <strong>💡 Interest-on-Interest:</strong> As your non-registered investments grow, they generate more dividends, 
                      which create more principal, which gets re-borrowed, creating more tax-deductible interest - this compounds annually!
                    </div>
                  </div>
                </div>

                {/* Non-Tax-Deductible Interest */}
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                    🔴 Non-Tax-Deductible Interest (Paid from Savings)
                  </h5>
                  <div className="space-y-2 text-red-700">
                    <div className="flex justify-between border-b border-red-200 pb-1">
                      <span>TFSA/RRSP Funding Interest:</span>
                      <span className="font-medium">${Math.round(calculations.helocInterest - calculations.deductibleInterest).toLocaleString()}</span>
                    </div>
                    <div className="text-sm leading-relaxed">
                      <strong>Payment Method:</strong> This interest is paid directly from your savings (not re-borrowed). 
                      Since TFSA/RRSP investments don't generate taxable income, the CRA doesn't allow tax deductions on this interest.
                    </div>
                    <div className="bg-red-100 p-3 rounded border-l-4 border-red-500 text-red-800 text-xs">
                      <strong>⚠️ Important:</strong> Only the ${calculations.deductibleInterest.toLocaleString()} investment-backed interest 
                      contributes to your tax refund - not the ${Math.round(calculations.helocInterest - calculations.deductibleInterest).toLocaleString()} 
                       TFSA/RRSP interest.
                    </div>
                  </div>
                </div>

                {/* Total Tax Impact */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-3">💰 Complete Tax Strategy Impact</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                    <div>
                      <div className="text-xs text-blue-600 mb-2">Tax Refund Sources:</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>RRSP Contribution Tax Refund:</span>
                          <span>${Math.round(assumptions.rrspContrib * (assumptions.taxRate / 100)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deductible Interest Tax Refund:</span>
                          <span>${Math.round(calculations.deductibleInterest * (assumptions.taxRate / 100)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-blue-300 pt-1 font-semibold">
                          <span>Total Tax Refund:</span>
                          <span>${calculations.refund.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-blue-600 mb-2">Net Cost Analysis:</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Total HELOC Interest Charged:</span>
                          <span>${calculations.helocInterest.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Government Tax Subsidy:</span>
                          <span>-${Math.round(calculations.deductibleInterest * (assumptions.taxRate / 100)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-blue-300 pt-1 font-semibold">
                          <span>Net Interest Cost:</span>
                          <span>${Math.round(calculations.helocInterest - (calculations.deductibleInterest * (assumptions.taxRate / 100))).toLocaleString()}</span>
                        </div>
                      </div>
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
