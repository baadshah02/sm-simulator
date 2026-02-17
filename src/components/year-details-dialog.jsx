"use client"

import { useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils"
import SmithFlowDiagram from "@/components/smith-flow-diagram"

export default function YearDetailsDialog({ yearData, open, onOpenChange, onNavigate, totalYears = 30 }) {
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onOpenChange(false)
        if (e.key === 'ArrowLeft' && yearData?.year > 1) onNavigate?.(yearData.year - 1)
        if (e.key === 'ArrowRight' && yearData?.year < totalYears) onNavigate?.(yearData.year + 1)
    }, [onOpenChange, onNavigate, yearData?.year, totalYears])

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [open, handleKeyDown])

    if (!open || !yearData || !yearData.details) return null

    const { details, year } = yearData
    const { beginning, calculations, end, percentChanges, craAudit } = details

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/80"
                onClick={() => onOpenChange(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
                <div
                    className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    {/* Title with navigation */}
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={year <= 1}
                            onClick={() => onNavigate?.(year - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-semibold">📅 Year {year}</h2>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            disabled={year >= totalYears}
                            onClick={() => onNavigate?.(year + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground ml-2">← → arrow keys to navigate</span>
                    </div>

                    <div className="space-y-5">
                        {/* Flow Diagram */}
                        <SmithFlowDiagram yearData={yearData} />

                        {/* Compact Balances */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">💰 Balances</h3>
                            <Card>
                                <CardContent className="pt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-xs"></TableHead>
                                                <TableHead className="text-xs text-right">Mortgage</TableHead>
                                                <TableHead className="text-xs text-right">HELOC</TableHead>
                                                <TableHead className="text-xs text-right">TFSA</TableHead>
                                                <TableHead className="text-xs text-right">RRSP</TableHead>
                                                <TableHead className="text-xs text-right">Non-Reg</TableHead>
                                                <TableHead className="text-xs text-right font-bold">Portfolio</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-xs font-medium">Start</TableCell>
                                                <TableCell className="text-right text-xs text-red-500">{formatCurrency(beginning.mortgage)}</TableCell>
                                                <TableCell className="text-right text-xs text-orange-500">{formatCurrency(beginning.heloc)}</TableCell>
                                                <TableCell className="text-right text-xs text-teal-600">{formatCurrency(beginning.tfsa)}</TableCell>
                                                <TableCell className="text-right text-xs text-indigo-600">{formatCurrency(beginning.rrsp)}</TableCell>
                                                <TableCell className="text-right text-xs text-amber-600">{formatCurrency(beginning.nonReg)}</TableCell>
                                                <TableCell className="text-right text-xs font-bold text-emerald-600">{formatCurrency(beginning.portfolio)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-xs font-medium">End</TableCell>
                                                <TableCell className="text-right text-xs text-red-500">{formatCurrency(end.mortgage)}</TableCell>
                                                <TableCell className="text-right text-xs text-orange-500">{formatCurrency(end.heloc)}</TableCell>
                                                <TableCell className="text-right text-xs text-teal-600">{formatCurrency(end.tfsa)}</TableCell>
                                                <TableCell className="text-right text-xs text-indigo-600">{formatCurrency(end.rrsp)}</TableCell>
                                                <TableCell className="text-right text-xs text-amber-600">{formatCurrency(end.nonReg)}</TableCell>
                                                <TableCell className="text-right text-xs font-bold text-emerald-600">{formatCurrency(end.portfolio)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <div className="mt-3 flex justify-between items-center px-2">
                                        <div className="text-xs text-muted-foreground">
                                            Debt: <span className="font-medium text-red-500">{formatCurrency(end.mortgage + end.heloc)}</span>
                                        </div>
                                        <div className="text-sm font-bold text-blue-600">
                                            Net Wealth: {formatCurrency(end.portfolio - end.heloc)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* How P Was Calculated — Waterfall */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">🧮 How Principal Was Calculated</h3>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="space-y-1.5">
                                        <WaterfallRow label="Standard Principal (from mortgage payment)" value={calculations.standardPrincipal} />
                                        {calculations.dividendsThisYear > 0 && (
                                            <WaterfallRow label="+ Dividend reinvestment boost" value={calculations.dividendsThisYear} color="text-green-600" prefix="+" />
                                        )}
                                        {calculations.refund > 0 && (
                                            <WaterfallRow label="+ Tax refund boost (RRSP + interest)" value={calculations.refund} color="text-blue-600" prefix="+" />
                                        )}
                                        {calculations.P > calculations.standardPrincipal + calculations.dividendsThisYear + calculations.refund && (
                                            <WaterfallRow
                                                label="+ Compounding effect"
                                                value={calculations.P - calculations.standardPrincipal - calculations.dividendsThisYear - calculations.refund}
                                                color="text-purple-600"
                                                prefix="+"
                                            />
                                        )}
                                        <div className="border-t pt-1.5">
                                            <WaterfallRow label="= Accelerated Principal (P)" value={calculations.P} bold highlight />
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <p className="text-[10px] text-muted-foreground">HELOC Interest</p>
                                            <p className="text-xs font-semibold">{formatCurrency(calculations.helocInterest)}</p>
                                        </div>
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <p className="text-[10px] text-muted-foreground">Deductible</p>
                                            <p className="text-xs font-semibold text-emerald-600">{formatCurrency(calculations.deductibleInterest)}</p>
                                        </div>
                                        <div className="rounded-md bg-muted/50 p-2">
                                            <p className="text-[10px] text-muted-foreground">New Invested</p>
                                            <p className="text-xs font-semibold">{formatCurrency(calculations.additionalDeductible)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* CRA Audit Trail */}
                        {craAudit && (
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">🧾 CRA Audit Trail</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* ACB Tracking */}
                                    <Card>
                                        <CardContent className="pt-4">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Adjusted Cost Base (Non-Reg)</p>
                                            <div className="space-y-1">
                                                <AuditRow label="Opening ACB" value={craAudit.openingACB} />
                                                {craAudit.initialInvestment > 0 && (
                                                    <AuditRow label="+ Initial HELOC → Non-Reg" value={craAudit.initialInvestment} color="text-emerald-600" />
                                                )}
                                                {craAudit.newInvestments > 0 && (
                                                    <AuditRow label="+ New investments (re-borrowed)" value={craAudit.newInvestments} color="text-emerald-600" />
                                                )}
                                                {craAudit.reinvestedDividends > 0 && (
                                                    <AuditRow label="+ Reinvested dividends" value={craAudit.reinvestedDividends} color="text-green-600" />
                                                )}
                                                <div className="border-t pt-1">
                                                    <AuditRow label="Closing ACB" value={craAudit.closingACB} bold />
                                                </div>
                                                <div className="border-t pt-1">
                                                    <AuditRow label="Market Value" value={craAudit.marketValue} />
                                                    <AuditRow
                                                        label="Unrealized Gain"
                                                        value={craAudit.unrealizedGain}
                                                        color={craAudit.unrealizedGain >= 0 ? "text-emerald-600" : "text-red-500"}
                                                    />
                                                    <AuditRow label="Potential Cap. Gains Tax" value={craAudit.potentialCapGainsTax} color="text-red-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Tax Deductions */}
                                    <Card>
                                        <CardContent className="pt-4">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Tax Filing Summary</p>
                                            <div className="space-y-1">
                                                <AuditRow label="HELOC Interest (deductible)" value={craAudit.deductibleInterest} color="text-emerald-600" />
                                                <AuditRow label="HELOC Interest (non-deductible)" value={craAudit.nonDeductibleInterest} color="text-orange-500" />
                                                <AuditRow label="RRSP Deduction" value={craAudit.rrspDeduction} color="text-indigo-600" />
                                                <AuditRow label="Dividend Income (taxable)" value={craAudit.dividendIncome} color="text-amber-600" />
                                                <div className="border-t pt-1">
                                                    <AuditRow label="Total Deductions" value={craAudit.totalDeductions} bold />
                                                    <AuditRow label="Estimated Refund" value={craAudit.estimatedRefund} color="text-blue-600" bold />
                                                </div>
                                                <div className="border-t pt-1 mt-1">
                                                    <AuditRow label="Cumulative Deductible Interest" value={craAudit.cumulativeDeductibleInterest} />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </section>
                        )}

                        {/* Growth */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">📈 Growth</h3>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                <GrowthMetric label="TFSA" pct={percentChanges.tfsa} />
                                <GrowthMetric label="RRSP" pct={percentChanges.rrsp} />
                                <GrowthMetric label="Non-Reg" pct={percentChanges.nonReg} />
                                <GrowthMetric label="Portfolio" pct={percentChanges.portfolio} />
                                <GrowthMetric label="Mort. ↓" pct={percentChanges.mortgageDecrease} inverted />
                                <GrowthMetric label="HELOC ↑" pct={percentChanges.helocIncrease} />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}

function WaterfallRow({ label, value, color = "", prefix = "", bold = false, highlight = false }) {
    return (
        <div className={`flex justify-between items-center px-2 py-0.5 rounded ${highlight ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}>
            <span className={`text-sm ${bold ? "font-semibold" : ""}`}>{label}</span>
            <span className={`text-sm font-medium ${color} ${bold ? "font-bold" : ""}`}>
                {prefix && value > 0 ? prefix : ""}{formatCurrency(value)}
            </span>
        </div>
    )
}

function AuditRow({ label, value, color = "", bold = false }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs">{label}</span>
            <span className={`text-xs ${bold ? "font-bold" : "font-medium"} ${color}`}>
                {formatCurrency(value)}
            </span>
        </div>
    )
}

function GrowthMetric({ label, pct, inverted = false }) {
    const val = parseFloat(pct)
    const isPositive = inverted ? val > 0 : val > 0
    return (
        <div className="rounded-lg border p-2 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
            <Badge variant={isPositive ? "success" : val === 0 ? "secondary" : "warning"} className="text-[10px]">
                {val > 0 ? '+' : ''}{pct}%
            </Badge>
        </div>
    )
}
