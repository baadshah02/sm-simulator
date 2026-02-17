"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const COMPARISON_ROWS = [
    { label: 'Mortgage Payoff', key: 'payoffYear', format: v => v ? `Year ${v}` : 'Not in 30 yrs' },
    { label: 'Final Portfolio', key: 'finalPortfolio', format: v => formatCurrency(v) },
    { label: 'Final HELOC', key: 'finalHeloc', format: v => formatCurrency(v) },
    { label: 'Net Wealth', key: 'netWealth', format: v => formatCurrency(v), highlight: true },
    { label: 'Total Tax Refunds', key: 'totalRefunds', format: v => formatCurrency(v) },
    { label: 'Year 10 Portfolio', key: 'yr10Portfolio', format: v => formatCurrency(v) },
    { label: 'Year 20 Portfolio', key: 'yr20Portfolio', format: v => formatCurrency(v) },
]

function extractMetrics(data) {
    if (!data?.length) return {}
    const last = data[data.length - 1]
    const payoffRow = data.find(d => d.mortgageBalance === 0)
    const yr10 = data.find(d => d.year === 10)
    const yr20 = data.find(d => d.year === 20)
    return {
        payoffYear: payoffRow?.year || null,
        finalPortfolio: last.portfolioValue,
        finalHeloc: last.helocBalance,
        netWealth: last.portfolioValue - last.helocBalance,
        totalRefunds: data.reduce((sum, d) => sum + (d.taxRefund || 0), 0),
        yr10Portfolio: yr10?.portfolioValue || 0,
        yr20Portfolio: yr20?.portfolioValue || 0,
    }
}

export default function ModelComparison({ models, onRemoveModel, onLoadModel }) {
    if (!models || models.length < 1) return null

    const needsMore = models.length < 2

    const metricsPerModel = useMemo(() =>
        models.map(m => ({ ...m, metrics: extractMetrics(m.data) })),
        [models]
    )

    // Find best value per metric for highlighting
    const bestPerRow = useMemo(() => {
        const bests = {}
        COMPARISON_ROWS.forEach(row => {
            const values = metricsPerModel.map(m => m.metrics[row.key]).filter(v => v !== null && v !== undefined)
            if (values.length > 0) {
                bests[row.key] = row.key === 'finalHeloc'
                    ? Math.min(...values)  // lower is better for debt
                    : Math.max(...values)  // higher is better for everything else
            }
        })
        return bests
    }, [metricsPerModel])

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">⚖️ Model Comparison</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{models.length} model{models.length !== 1 ? 's' : ''} saved</Badge>
                        {needsMore && <Badge variant="warning">Save another model to compare</Badge>}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs min-w-[140px]">Metric</TableHead>
                                {metricsPerModel.map((m, i) => (
                                    <TableHead key={i} className="text-center text-xs min-w-[120px]">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="font-medium truncate max-w-[80px]">{m.name}</span>
                                            <button
                                                onClick={() => onRemoveModel(i)}
                                                className="text-muted-foreground hover:text-red-500 transition-colors ml-1"
                                                title="Remove model"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        {m.scenario && m.scenario !== 'base' && (
                                            <Badge variant="warning" className="text-[9px] mt-0.5">{m.scenario}</Badge>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {COMPARISON_ROWS.map(row => (
                                <TableRow key={row.key}>
                                    <TableCell className={`text-xs ${row.highlight ? 'font-semibold' : ''}`}>
                                        {row.label}
                                    </TableCell>
                                    {metricsPerModel.map((m, i) => {
                                        const val = m.metrics[row.key]
                                        const isBest = metricsPerModel.length > 1 && val === bestPerRow[row.key]
                                        return (
                                            <TableCell
                                                key={i}
                                                className={`text-center text-xs ${row.highlight ? 'font-bold' : 'font-medium'} ${isBest ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                                            >
                                                {row.format(val)}
                                                {isBest && metricsPerModel.length > 1 && (
                                                    <span className="ml-1 text-[9px]">✓</span>
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-wrap gap-2 p-3 border-t">
                    {metricsPerModel.map((m, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onLoadModel(i)}
                        >
                            Load "{m.name}"
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
