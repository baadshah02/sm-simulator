"use client"

import { memo, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export default memo(function ComparisonSummary({ comparisonData, smithData, noSmithData, allocationPlan, aStarOptimal, explorerResults, robustnessResults, selectedRouteIndex, onSelectRoute }) {
    if (!comparisonData) return null

    const finalSmithYear = smithData?.length > 0 ? smithData[smithData.length - 1] : null
    const finalNoSmithYear = noSmithData?.length > 0 ? noSmithData[noSmithData.length - 1] : null
    const retirementTaxRate = comparisonData.retirementTaxRate || 20
    const inflationRate = comparisonData.inflationRate || 0
    const optimizationMode = comparisonData.optimizationMode || 'classic'

    const smRrspGross = finalSmithYear?.rrspValue || 0
    const smRrspAfterTax = finalSmithYear?.rrspAfterTax || 0
    const noSmRrspGross = finalNoSmithYear?.rrspValue || 0
    const noSmRrspAfterTax = noSmRrspGross * (1 - retirementTaxRate / 100)
    const smInflationAdjusted = finalSmithYear?.inflationAdjustedPortfolio || 0

    // Interest breakdown — memoized since it iterates all years
    const interestBreakdown = useMemo(() => {
        if (!smithData?.length) return null
        let totalHelocInterest = 0, totalDeductibleInterest = 0, totalNonDeductibleInterest = 0, totalTaxSavings = 0, totalMortgageInterest = 0
        smithData.forEach(yd => {
            totalHelocInterest += yd.helocInterest || 0
            if (yd.details?.calculations) {
                totalDeductibleInterest += yd.details.calculations.deductibleInterest || 0
                totalNonDeductibleInterest += (yd.helocInterest || 0) - (yd.details.calculations.deductibleInterest || 0)
                totalTaxSavings += (yd.details.calculations.deductibleInterest || 0) * (yd.details.assumptions.taxRate / 100)
            }
        })
        const firstYear = smithData[0]
        if (firstYear?.details) {
            const mr = firstYear.details.assumptions.mortgageRate / 100
            smithData.forEach(yd => {
                if (yd.details?.beginning) totalMortgageInterest += yd.details.beginning.mortgage * mr
            })
        }
        return {
            totalHelocInterest: Math.round(totalHelocInterest),
            totalDeductibleInterest: Math.round(totalDeductibleInterest),
            totalNonDeductibleInterest: Math.round(totalNonDeductibleInterest),
            totalMortgageInterest: Math.round(totalMortgageInterest),
            totalTaxSavings: Math.round(totalTaxSavings),
            netOutOfPocketInterest: Math.round(totalHelocInterest + totalMortgageInterest - totalTaxSavings),
        }
    }, [smithData])

    return (
        <div className="space-y-4">
            {/* 3-way comparison */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-center">
                        🏠 Strategy Comparison — 30-Year Outlook
                        {optimizationMode !== 'classic' && (
                            <Badge variant="outline" className="ml-2 text-xs bg-emerald-50 text-emerald-700">
                                {optimizationMode === 'smart' ? '🧠 Smart Adaptive' : '🔍 Path Explorer'}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Traditional */}
                        <div className="rounded-lg border p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-zinc-400" />
                                <h3 className="font-semibold text-muted-foreground">Traditional Mortgage</h3>
                            </div>
                            <Row label="Payoff" value={`${comparisonData.traditional.years} years`} />
                            <Row label="Monthly" value={formatCurrency(comparisonData.traditional.monthlyPayment)} />
                            <Row label="Total Interest" value={formatCurrency(comparisonData.traditional.totalInterest)} className="text-red-500" />
                            <Row label="Wealth" value="$0" className="text-muted-foreground" />
                        </div>

                        {/* No-SM */}
                        {finalNoSmithYear && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <h3 className="font-semibold text-blue-700 dark:text-blue-400">No SM (Savings)</h3>
                                </div>
                                <Row label="TFSA" value={formatCurrency(finalNoSmithYear.tfsaValue)} className="text-teal-600" />
                                <Row label="RRSP (gross)" value={formatCurrency(noSmRrspGross)} className="text-indigo-600" />
                                <Row label="RRSP (net)" value={formatCurrency(noSmRrspAfterTax)} className="text-indigo-400" />
                                <div className="border-t pt-2">
                                    <Row label="Portfolio" value={formatCurrency(finalNoSmithYear.portfolioValue)} className="text-blue-600 font-bold" />
                                </div>
                            </div>
                        )}

                        {/* Smith Manoeuvre */}
                        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Smith Manoeuvre</h3>
                                <Badge variant="success" className="ml-auto text-[10px]">Recommended</Badge>
                            </div>
                            <Row label="Payoff" value={`${comparisonData.smithManoeuvre.years} years`} className="text-emerald-700" />
                            <Row label="Portfolio" value={formatCurrency(comparisonData.smithManoeuvre.finalPortfolio)} className="text-emerald-600" />
                            <Row label="HELOC Debt" value={formatCurrency(comparisonData.smithManoeuvre.totalLeveraged)} className="text-orange-500" />
                            <Row label="Net Wealth" value={formatCurrency(comparisonData.smithManoeuvre.netWealth)} className="text-blue-600 font-bold" />
                            {finalSmithYear && (
                                <>
                                    <div className="border-t pt-2">
                                        <Row label="RRSP (net)" value={formatCurrency(smRrspAfterTax)} className="text-indigo-500" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Inflation note — dynamic based on selected strategy */}
                    {inflationRate > 0 && finalSmithYear && (() => {
                        const selectedData = selectedRouteIndex !== null && explorerResults?.topRoutes?.[selectedRouteIndex]?.yearByYearData;
                        const selectedLast = selectedData ? selectedData[selectedData.length - 1] : null;
                        const portfolioToShow = selectedLast?.portfolioValue || finalSmithYear.portfolioValue;
                        const inflationFactor = Math.pow(1 + inflationRate / 100, 30);
                        const adjustedValue = Math.round(portfolioToShow / inflationFactor);
                        const strategyLabel = selectedRouteIndex !== null && explorerResults?.topRoutes?.[selectedRouteIndex]
                            ? `Alternative #${selectedRouteIndex + 1}`
                            : 'SM Optimal';

                        return (
                            <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3 text-sm text-amber-800 dark:text-amber-300">
                                <strong>📉 Inflation:</strong> At {inflationRate}%, the {strategyLabel} portfolio of {formatCurrency(portfolioToShow)} ≈ <strong>{formatCurrency(adjustedValue)}</strong> in today&apos;s dollars.
                            </div>
                        );
                    })()}

                    {/* Interest Analysis — collapsible */}
                    {interestBreakdown && <InterestSummaryRow interestBreakdown={interestBreakdown} traditionalInterest={comparisonData.traditional.totalInterest} />}
                </CardContent>
            </Card>

            {/* Optimizer Mode: Show A* Optimal + Alternatives */}
            {(aStarOptimal || allocationPlan) && (
                <OptimizerResultsCard
                    allocationPlan={allocationPlan}
                    aStarOptimal={aStarOptimal}
                    explorerResults={explorerResults}
                    robustnessResults={robustnessResults}
                    smithData={smithData}
                    retirementTaxRate={retirementTaxRate}
                    taxRate={comparisonData?.smithManoeuvre ? (smithData?.[1]?.details?.assumptions?.taxRate || 53.53) : 53.53}
                    selectedRouteIndex={selectedRouteIndex}
                    onSelectRoute={onSelectRoute}
                />
            )}
        </div>
    )
})

function Row({ label, value, className = "" }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-medium ${className}`}>{value}</span>
        </div>
    )
}

function InterestSummaryRow({ interestBreakdown, traditionalInterest }) {
    const [expanded, setExpanded] = useState(false)
    const saved = traditionalInterest - interestBreakdown.netOutOfPocketInterest

    return (
        <div className="mt-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full rounded-md bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 p-3 flex justify-between items-center hover:bg-emerald-200/60 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
            >
                <span className="text-sm font-medium">💰 Interest Saved vs Traditional</span>
                <span className="flex items-center gap-2">
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(saved)}</span>
                    <span className="text-xs text-muted-foreground">{expanded ? '▲' : '▼'}</span>
                </span>
            </button>
            {expanded && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                    <div className="rounded-lg border p-3 space-y-1.5">
                        <h4 className="font-semibold text-muted-foreground text-xs uppercase">Traditional</h4>
                        <Row label="Mortgage Interest" value={formatCurrency(traditionalInterest)} className="text-red-500" />
                        <div className="border-t pt-1.5">
                            <Row label="Net Cost" value={formatCurrency(traditionalInterest)} className="text-red-600 font-bold" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-emerald-200 p-3 space-y-1.5">
                        <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-xs uppercase">Smith Manoeuvre</h4>
                        <Row label="Mortgage Interest" value={formatCurrency(interestBreakdown.totalMortgageInterest)} className="text-red-500" />
                        <Row label="HELOC Interest" value={formatCurrency(interestBreakdown.totalHelocInterest)} className="text-orange-500" />
                        <div className="pl-3 text-xs space-y-0.5">
                            <Row label="• Deductible" value={formatCurrency(interestBreakdown.totalDeductibleInterest)} className="text-emerald-600" />
                            <Row label="• Non-deductible" value={formatCurrency(interestBreakdown.totalNonDeductibleInterest)} className="text-orange-500" />
                        </div>
                        <Row label="Tax Savings" value={`-${formatCurrency(interestBreakdown.totalTaxSavings)}`} className="text-emerald-600" />
                        <div className="border-t pt-1.5">
                            <Row label="Net Cost" value={formatCurrency(interestBreakdown.netOutOfPocketInterest)} className="text-blue-600 font-bold" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function AllocationPlanCard({ allocationPlan }) {
    const [expanded, setExpanded] = useState(false)
    const displayItems = expanded ? allocationPlan : allocationPlan.slice(0, 5)

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    🧠 Smart Adaptive Allocation Plan
                    <Badge variant="outline" className="text-xs">Year-by-Year</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    How each dollar of cash (refund + dividends + freed principal) is optimally allocated.
                </p>
            </CardHeader>
            <CardContent className="space-y-2">
                {displayItems.map((item, idx) => (
                    <AllocationRow key={idx} item={item} />
                ))}
                {allocationPlan.length > 5 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full text-center text-xs text-blue-600 hover:text-blue-800 py-2 border-t"
                    >
                        {expanded ? 'Show less ▲' : `Show all ${allocationPlan.length} years ▼`}
                    </button>
                )}
            </CardContent>
        </Card>
    )
}

function SmartAllocationList({ allocationPlan }) {
    const [showAll, setShowAll] = useState(false);
    const items = showAll ? allocationPlan : allocationPlan.slice(0, 5);

    return (
        <div className="space-y-2 mt-2" onClick={e => e.stopPropagation()}>
            {items.map((item, idx) => (
                <AllocationRow key={idx} item={item} />
            ))}
            {allocationPlan.length > 5 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-center text-xs text-blue-600 hover:text-blue-800 py-2 border-t"
                >
                    {showAll ? 'Show less ▲' : `Show all ${allocationPlan.length} years ▼`}
                </button>
            )}
        </div>
    );
}

function AllocationRow({ item }) {
    const [showReasoning, setShowReasoning] = useState(false)
    const alloc = item.allocation

    const parts = []
    if (alloc.tfsa > 0) parts.push({ label: 'TFSA', amount: alloc.tfsa, color: 'text-teal-600' })
    if (alloc.rrsp > 0) parts.push({ label: 'RRSP', amount: alloc.rrsp, color: 'text-indigo-600' })
    if (alloc.mortgage > 0) parts.push({ label: 'Mortgage', amount: alloc.mortgage, color: 'text-emerald-600' })
    if (alloc.nonReg > 0) parts.push({ label: 'Non-Reg', amount: alloc.nonReg, color: 'text-amber-600' })

    const isLumpSum = item.type === 'lump_sum_deployment' || item.lumpSumComponent > 0;

    return (
        <div className={`rounded-md border p-3 space-y-1.5 ${isLumpSum ? 'border-purple-300 bg-purple-50/30 dark:bg-purple-950/10' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-muted-foreground w-14">Year {item.year}</span>
                    <span className="text-xs text-muted-foreground">
                        {item.type === 'lump_sum_deployment' ? '💰 Lump Sum Deploy' : item.type === 'initial_heloc' ? '🏦 HELOC Deploy' : '💸 Cash Allocation'}
                    </span>
                    <span className="text-sm font-semibold">{formatCurrency(item.totalCash)}</span>
                    {isLumpSum && (
                        <Badge variant="outline" className="text-[9px] text-purple-600 border-purple-300 bg-purple-50">
                            💰 {formatCurrency(item.lumpSumComponent)} lump sum included
                        </Badge>
                    )}
                </div>
                <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="text-[10px] text-blue-500 hover:text-blue-700"
                >
                    {showReasoning ? 'Hide' : 'Why?'}
                </button>
            </div>

            {/* Source Breakdown */}
            <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-3">
                {item.type === 'initial_heloc' && <span>🏦 HELOC: {formatCurrency(item.totalCash - (item.lumpSumComponent || 0))}</span>}
                {item.refundComponent > 0 && <span>💳 Refund: {formatCurrency(item.refundComponent)}</span>}
                {item.dividendComponent > 0 && <span>📊 Dividends: {formatCurrency(item.dividendComponent)}</span>}
                {item.lumpSumComponent > 0 && <span className="text-purple-600 font-medium">💰 Lump Sum: {formatCurrency(item.lumpSumComponent)}</span>}
            </div>

            {/* Destination Breakdown */}
            <div className="flex flex-wrap gap-2">
                {parts.map((part, i) => (
                    <span key={i} className={`text-xs ${part.color} bg-white dark:bg-zinc-900 border rounded px-2 py-0.5`}>
                        → {part.label}: {formatCurrency(part.amount)}
                    </span>
                ))}
            </div>
            {showReasoning && item.ranked && (
                <div className="mt-2 bg-zinc-50 dark:bg-zinc-900 rounded p-2 text-[10px] space-y-0.5">
                    <p className="font-semibold text-muted-foreground mb-1">Marginal Value Ranking (per $1):</p>
                    {item.ranked.map((r, i) => (
                        <div key={i} className="flex justify-between">
                            <span>{i + 1}. {r.dest}</span>
                            <span className="font-mono">${r.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function ExplorerResultsCard({ explorerResults, selectedRouteIndex, onSelectRoute }) {
    const sc = explorerResults.smartComparison
    const topRoutes = explorerResults.topRoutes || []
    const [expandedRoute, setExpandedRoute] = useState(null)

    const medals = ['🥇', '🥈', '🥉']

    const handleRouteSelect = (idx) => {
        if (selectedRouteIndex === idx) {
            onSelectRoute?.(null) // deselect
        } else {
            onSelectRoute?.(idx)
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    🗺️ Optimal Route Finder
                    <Badge variant="outline" className="text-xs">{explorerResults.iterations} strategies simulated</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Ran {explorerResults.iterations} independent 30-year simulations (Year 1 deployment × Ongoing strategy).
                    Each strategy runs to completion with full SM calculation engine and all CRA/bank limits enforced.
                    Click a route to view its year-by-year data in the table below.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Top 3 Routes */}
                {topRoutes.length > 0 && (
                    <div className="space-y-3">
                        {topRoutes.map((route, idx) => {
                            const isSelected = selectedRouteIndex === idx;
                            return (
                            <div
                                key={idx}
                                className={`rounded-lg border-2 p-4 space-y-3 cursor-pointer transition-all ${
                                    isSelected
                                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-300 shadow-md'
                                        : idx === 0 ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400'
                                        : idx === 1 ? 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
                                        : 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                                }`}
                                onClick={() => handleRouteSelect(idx)}
                            >
                                {/* Route Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{medals[idx]}</span>
                                        <div>
                                            <div className="font-bold text-sm flex items-center gap-2">
                                                Route #{route.rank}
                                                {isSelected && (
                                                    <Badge variant="success" className="text-[9px]">📊 Viewing in Table</Badge>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Mortgage: {route.mortgageBalance === 0 ? '✅ Paid Off' : formatCurrency(route.mortgageBalance) + ' remaining'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xl font-bold ${idx === 0 ? 'text-emerald-600' : ''}`}>{formatCurrency(route.netWealth)}</div>
                                        <div className="text-[10px] text-muted-foreground">After-Tax Net Wealth at Year 30</div>
                                    </div>
                                </div>

                                {/* Account Breakdown */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-teal-600 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 rounded px-2 py-0.5">💎 TFSA: {formatCurrency(route.tfsaValue)}</span>
                                    <span className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 rounded px-2 py-0.5">🛡️ RRSP: {formatCurrency(route.rrspValue)}</span>
                                    <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded px-2 py-0.5">📈 Non-Reg: {formatCurrency(route.nonRegValue)}</span>
                                    <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 rounded px-2 py-0.5">🏦 HELOC: {formatCurrency(route.helocBalance)}</span>
                                </div>

                                {/* Turn-by-Turn Summary */}
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">🧭 Turn-by-Turn Route:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {route.summary.map((step, si) => (
                                            <span key={si} className="text-[10px] bg-white dark:bg-zinc-900 border rounded px-2 py-0.5">
                                                <strong>Y{step.fromYear}{step.fromYear !== step.toYear ? `-${step.toYear}` : ''}</strong>: {step.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Year-by-Year Allocation Detail — shown when expanded */}
                                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setExpandedRoute(expandedRoute === idx ? null : idx)}
                                        className="text-[10px] text-blue-500 hover:text-blue-700"
                                    >
                                        {expandedRoute === idx ? 'Hide year-by-year ▲' : 'Show year-by-year allocations ▼'}
                                    </button>
                                    {!isSelected && (
                                        <button
                                            onClick={() => handleRouteSelect(idx)}
                                            className="text-[10px] text-emerald-600 hover:text-emerald-800 font-medium"
                                        >
                                            Load in table →
                                        </button>
                                    )}
                                </div>
                                {expandedRoute === idx && route.yearByYearData && (
                                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3 space-y-2" onClick={e => e.stopPropagation()}>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Year-by-Year Breakdown</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-[10px]">
                                                <thead>
                                                    <tr className="border-b text-left text-muted-foreground">
                                                        <th className="py-1 pr-2">Year</th>
                                                        <th className="py-1 pr-2">Decision</th>
                                                        <th className="py-1 pr-2 text-right">Mortgage</th>
                                                        <th className="py-1 pr-2 text-right">HELOC</th>
                                                        <th className="py-1 pr-2 text-right">TFSA</th>
                                                        <th className="py-1 pr-2 text-right">RRSP</th>
                                                        <th className="py-1 pr-2 text-right">Non-Reg</th>
                                                        <th className="py-1 pr-2 text-right">Portfolio</th>
                                                        <th className="py-1 text-right">Refund</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {route.yearByYearData.filter(r => r.year > 0).map((yr, yi) => {
                                                        const decision = route.decisions[yi];
                                                        return (
                                                            <tr key={yi} className="border-b border-zinc-200 dark:border-zinc-800">
                                                                <td className="py-1 pr-2 font-bold">{yr.year}</td>
                                                                <td className="py-1 pr-2 max-w-[150px] truncate" title={decision?.name}>{decision?.name || '—'}</td>
                                                                <td className="py-1 pr-2 text-right">{formatCurrency(yr.mortgageBalance)}</td>
                                                                <td className="py-1 pr-2 text-right text-orange-600">{formatCurrency(yr.helocBalance)}</td>
                                                                <td className="py-1 pr-2 text-right text-teal-600">{formatCurrency(yr.tfsaValue)}</td>
                                                                <td className="py-1 pr-2 text-right text-indigo-600">{formatCurrency(yr.rrspValue)}</td>
                                                                <td className="py-1 pr-2 text-right text-amber-600">{formatCurrency(yr.nonRegValue)}</td>
                                                                <td className="py-1 pr-2 text-right font-medium">{formatCurrency(yr.portfolioValue)}</td>
                                                                <td className="py-1 text-right text-blue-600">{formatCurrency(yr.taxRefund)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}

                {/* Distribution Stats */}
                <div>
                    <h4 className="text-sm font-semibold mb-2">📊 Score Distribution (All {explorerResults.iterations} Strategies)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard label="Best" value={formatCurrency(explorerResults.distribution.max)} className="text-emerald-600" />
                        <StatCard label="Median" value={formatCurrency(explorerResults.distribution.median)} className="text-blue-600" />
                        <StatCard label="Average" value={formatCurrency(explorerResults.distribution.avg)} className="text-indigo-600" />
                        <StatCard label="Worst Surviving" value={formatCurrency(explorerResults.distribution.min)} className="text-red-500" />
                    </div>
                </div>

                {/* Smart vs Best Route comparison */}
                {sc && (
                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">🧠 Smart Adaptive vs 🗺️ Best Route</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Row label="Smart Net Wealth" value={formatCurrency(sc.smartNetWealth)} className="text-emerald-600 font-bold" />
                            <Row label="Best Route" value={formatCurrency(sc.bestRouteNetWealth)} className="text-blue-600 font-bold" />
                            <Row label="Difference" value={`${formatCurrency(sc.difference)} (${sc.differencePct}%)`} className="text-muted-foreground" />
                        </div>
                        <div className="mt-2 text-sm font-medium">
                            {sc.verdict}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function computeAfterTaxNetWealth(data, retirementTaxRate = 20, taxRate = 53.53) {
    if (!data?.length) return null;
    const last = data[data.length - 1];
    if (!last) return null;
    const retRate = retirementTaxRate / 100;
    const tRate = taxRate / 100;
    const tfsaNet = last.tfsaValue || 0;
    const rrspNet = (last.rrspValue || 0) * (1 - retRate);
    const nonRegACB = last.details?.craAudit?.closingACB || (last.nonRegValue || 0) * 0.5;
    const unrealizedGain = Math.max(0, (last.nonRegValue || 0) - nonRegACB);
    const capGainsTax = unrealizedGain * 0.5 * tRate;
    const nonRegNet = (last.nonRegValue || 0) - capGainsTax;
    return Math.round(tfsaNet + rrspNet + nonRegNet - (last.helocBalance || 0));
}

function OptimizerResultsCard({ allocationPlan, aStarOptimal, explorerResults, robustnessResults, smithData, retirementTaxRate, taxRate, selectedRouteIndex, onSelectRoute }) {
    const [expandedSection, setExpandedSection] = useState(null);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    🎯 Optimizer Results
                    <Badge variant="outline" className="text-xs">A* Search + Alternatives</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Provably optimal allocation path using A* algorithm with marginal analysis, plus alternative strategies for comparison.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Smart Adaptive Path (Primary Recommended) */}
                {allocationPlan && allocationPlan.length > 0 && (
                    <div
                        className={`rounded-lg border-2 p-4 space-y-3 cursor-pointer transition-all ${
                            selectedRouteIndex === null
                                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-300 shadow-md'
                                : 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400'
                        }`}
                        onClick={() => onSelectRoute?.(null)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🎯</span>
                                <div>
                                    <div className="font-bold text-sm flex items-center gap-2">
                                        Optimal Path (Smart Adaptive)
                                        {selectedRouteIndex === null && (
                                            <Badge variant="success" className="text-[9px]">📊 Viewing in Table</Badge>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-emerald-600">Recommended — Marginal analysis optimized</div>
                                </div>
                            </div>
                            {smithData?.length > 0 && (() => {
                                const afterTaxWealth = computeAfterTaxNetWealth(smithData, retirementTaxRate, taxRate);
                                return afterTaxWealth !== null ? (
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-emerald-600">{formatCurrency(afterTaxWealth)}</div>
                                        <div className="text-[10px] text-muted-foreground">After-Tax Net Wealth</div>
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {/* Year-by-year allocation details */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setExpandedSection(expandedSection === 'smart' ? null : 'smart'); }}
                            className="text-[10px] text-blue-500 hover:text-blue-700"
                        >
                            {expandedSection === 'smart' ? 'Hide allocations ▲' : 'Show year-by-year allocations ▼'}
                        </button>
                        {expandedSection === 'smart' && (
                            <SmartAllocationList allocationPlan={allocationPlan} />
                        )}
                    </div>
                )}

                {/* Alternative Strategies from Path Explorer */}
                {explorerResults?.topRoutes && explorerResults.topRoutes.length > 0 && (
                    <>
                        <div className="border-t pt-3">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                                🔄 Alternative Strategies ({explorerResults.iterations} tested)
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                Click to compare different allocation approaches in the chart and table below
                            </p>
                        </div>
                        {explorerResults.topRoutes.map((route, idx) => (
                            <RouteCard
                                key={idx}
                                route={route}
                                idx={idx}
                                isSelected={selectedRouteIndex === idx}
                                onSelect={() => onSelectRoute?.(selectedRouteIndex === idx ? null : idx)}
                                expandedSection={expandedSection}
                                setExpandedSection={setExpandedSection}
                            />
                        ))}

                        {/* Distribution Stats */}
                        <div className="border-t pt-3">
                            <h4 className="text-sm font-semibold mb-2">📊 Score Distribution</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <StatCard label="Best" value={formatCurrency(explorerResults.distribution.max)} className="text-emerald-600" />
                                <StatCard label="Median" value={formatCurrency(explorerResults.distribution.median)} className="text-blue-600" />
                                <StatCard label="Average" value={formatCurrency(explorerResults.distribution.avg)} className="text-indigo-600" />
                                <StatCard label="Worst" value={formatCurrency(explorerResults.distribution.min)} className="text-red-500" />
                            </div>
                        </div>

                        {/* Robustness Analysis */}
                        {robustnessResults && (
                            <RobustnessCard robustnessResults={robustnessResults} />
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function RouteCard({ route, idx, isSelected, onSelect, expandedSection, setExpandedSection }) {
    const medals = ['🥇', '🥈', '🥉'];
    const sectionKey = `route${idx}`;

    return (
        <div
            className={`rounded-lg border-2 p-4 space-y-3 cursor-pointer transition-all ${
                isSelected
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-300 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300'
            }`}
            onClick={onSelect}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{medals[idx] || '🔹'}</span>
                    <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                            Alternative #{idx + 1}
                            {isSelected && (
                                <Badge variant="success" className="text-[9px]">📊 Viewing in Table</Badge>
                            )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{route.strategyLabel || route.summary[0]?.name}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(route.netWealth)}</div>
                    <div className="text-[10px] text-muted-foreground">After-Tax Net Wealth</div>
                </div>
            </div>

            {/* Account Breakdown */}
            <div className="flex flex-wrap gap-2">
                <span className="text-xs text-teal-600 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 rounded px-2 py-0.5">
                    💎 TFSA: {formatCurrency(route.tfsaValue)}
                </span>
                <span className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 rounded px-2 py-0.5">
                    🛡️ RRSP: {formatCurrency(route.rrspValue)}
                </span>
                <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded px-2 py-0.5">
                    📈 Non-Reg: {formatCurrency(route.nonRegValue)}
                </span>
                <span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 rounded px-2 py-0.5">
                    🏦 HELOC: {formatCurrency(route.helocBalance)}
                </span>
            </div>

            {/* Year-by-year details in Smart Adaptive style */}
            <button
                onClick={(e) => { e.stopPropagation(); setExpandedSection(expandedSection === sectionKey ? null : sectionKey); }}
                className="text-[10px] text-blue-500 hover:text-blue-700"
            >
                {expandedSection === sectionKey ? 'Hide allocations ▲' : 'Show year-by-year allocations ▼'}
            </button>
            {expandedSection === sectionKey && route.yearByYearData && (
                <div className="space-y-2 mt-2" onClick={e => e.stopPropagation()}>
                    {route.yearByYearData.filter(r => r.year > 0).slice(0, 10).map((yr, yi) => {
                        const decision = route.decisions[yi];
                        return (
                            <div key={yi} className="rounded-md border p-2 space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-muted-foreground">Year {yr.year}</span>
                                        <span className="text-muted-foreground text-[10px]">{decision?.name || '—'}</span>
                                    </div>
                                    <span className="font-semibold">Portfolio: {formatCurrency(yr.portfolioValue)}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {yr.tfsaValue > 0 && <span className="text-[10px] text-teal-600 bg-white dark:bg-zinc-900 border rounded px-1.5 py-0.5">TFSA: {formatCurrency(yr.tfsaValue)}</span>}
                                    {yr.rrspValue > 0 && <span className="text-[10px] text-indigo-600 bg-white dark:bg-zinc-900 border rounded px-1.5 py-0.5">RRSP: {formatCurrency(yr.rrspValue)}</span>}
                                    {yr.nonRegValue > 0 && <span className="text-[10px] text-amber-600 bg-white dark:bg-zinc-900 border rounded px-1.5 py-0.5">Non-Reg: {formatCurrency(yr.nonRegValue)}</span>}
                                    {yr.taxRefund > 0 && <span className="text-[10px] text-blue-600 bg-white dark:bg-zinc-900 border rounded px-1.5 py-0.5">Refund: {formatCurrency(yr.taxRefund)}</span>}
                                </div>
                            </div>
                        );
                    })}
                    {route.yearByYearData.length > 11 && (
                        <p className="text-[10px] text-muted-foreground text-center py-2">
                            ... and {route.yearByYearData.length - 11} more years
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function RobustnessCard({ robustnessResults }) {
    const [expanded, setExpanded] = useState(false);
    const { strategies, mostRobust, scenarioNames } = robustnessResults;

    if (!strategies?.length) return null;

    return (
        <div className="border-t pt-3">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 p-3 flex justify-between items-center hover:bg-blue-100/60 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">🛡️ Multi-Scenario Robustness Analysis</span>
                    <Badge variant="outline" className="text-[9px]">{strategies.length * Object.keys(scenarioNames).length} sims</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{expanded ? '▲' : '▼'}</span>
                </div>
            </button>
            {expanded && (
                <div className="mt-3 space-y-3">
                    {/* Most Robust Strategy */}
                    {mostRobust && (
                        <div className="rounded-lg border-2 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🛡️</span>
                                    <div>
                                        <div className="font-bold text-sm text-blue-700">Most Robust Strategy</div>
                                        <div className="text-[10px] text-muted-foreground">{mostRobust.yr1} → {mostRobust.ongoing}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">{formatCurrency(mostRobust.robustnessScore)}</div>
                                    <div className="text-[10px] text-muted-foreground">Robustness Score</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px]">
                                <span className="text-emerald-600">Best: {formatCurrency(mostRobust.bestCase)}</span>
                                <span className="text-red-500">Worst: {formatCurrency(mostRobust.worstCase)}</span>
                                <span className="text-muted-foreground">Range: {formatCurrency(mostRobust.bestCase - mostRobust.worstCase)}</span>
                            </div>
                        </div>
                    )}

                    {/* Strategy × Scenario Matrix */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="py-1 pr-2">#</th>
                                    <th className="py-1 pr-2">Strategy</th>
                                    {Object.entries(scenarioNames).map(([id, name]) => (
                                        <th key={id} className="py-1 pr-2 text-right">{name}</th>
                                    ))}
                                    <th className="py-1 text-right font-bold">Robustness</th>
                                </tr>
                            </thead>
                            <tbody>
                                {strategies.slice(0, 5).map((strat, i) => (
                                    <tr key={i} className={`border-b ${i === 0 ? 'bg-blue-50/50' : ''}`}>
                                        <td className="py-1 pr-2 font-bold">{i + 1}</td>
                                        <td className="py-1 pr-2 max-w-[140px] truncate" title={`${strat.yr1} → ${strat.ongoing}`}>
                                            {strat.yr1} → {strat.ongoing}
                                        </td>
                                        {Object.keys(scenarioNames).map(scenarioId => (
                                            <td key={scenarioId} className={`py-1 pr-2 text-right ${
                                                strat.scenarioScores[scenarioId] === strat.worstCase ? 'text-red-500' :
                                                strat.scenarioScores[scenarioId] === strat.bestCase ? 'text-emerald-600' : ''
                                            }`}>
                                                {formatCurrency(strat.scenarioScores[scenarioId])}
                                            </td>
                                        ))}
                                        <td className="py-1 text-right font-bold text-blue-600">{formatCurrency(strat.robustnessScore)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                        Robustness = 50% Base Case + 50% Average of Stress Scenarios. Higher = more resilient to market shocks.
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, className = "" }) {
    return (
        <div className="rounded-lg border p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`text-sm font-bold mt-1 ${className}`}>{value}</p>
        </div>
    )
}
