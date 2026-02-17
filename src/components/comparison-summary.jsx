"use client"

import { memo, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export default memo(function ComparisonSummary({ comparisonData, smithData, noSmithData }) {
    if (!comparisonData) return null

    const finalSmithYear = smithData?.length > 0 ? smithData[smithData.length - 1] : null
    const finalNoSmithYear = noSmithData?.length > 0 ? noSmithData[noSmithData.length - 1] : null
    const retirementTaxRate = comparisonData.retirementTaxRate || 20
    const inflationRate = comparisonData.inflationRate || 0

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
                    <CardTitle className="text-xl text-center">🏠 Strategy Comparison — 30-Year Outlook</CardTitle>
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

                    {/* Inflation note */}
                    {inflationRate > 0 && finalSmithYear && (
                        <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3 text-sm text-amber-800 dark:text-amber-300">
                            <strong>📉 Inflation:</strong> At {inflationRate}%, the SM portfolio of {formatCurrency(finalSmithYear.portfolioValue)} ≈ <strong>{formatCurrency(smInflationAdjusted)}</strong> in today&apos;s dollars.
                        </div>
                    )}

                    {/* Interest Analysis — collapsible */}
                    {interestBreakdown && <InterestSummaryRow interestBreakdown={interestBreakdown} traditionalInterest={comparisonData.traditional.totalInterest} />}
                </CardContent>
            </Card>

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
