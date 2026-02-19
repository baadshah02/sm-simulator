"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const COLUMNS = [
    { key: 'year', label: 'Yr' },
    { key: 'mortgageBalance', label: 'Mortgage' },
    { key: 'helocBalance', label: 'HELOC' },
    { key: 'tfsaValue', label: 'TFSA' },
    { key: 'rrspValue', label: 'RRSP' },
    { key: 'nonRegValue', label: 'Non-Reg' },
    { key: 'portfolioValue', label: 'Portfolio' },
    { key: 'taxRefund', label: 'Refund' },
    { key: 'principalBuilt', label: 'P Built' },
]

const MODE_LABELS = {
    classic: '📊 Classic SM',
    smart: '🧠 Smart Adaptive',
    explorer: '🔍 Path Explorer',
    optimizer: '🎯 Optimizer',
}

export default function DataTable({ tableData, onRowClick, optimizationMode = 'classic', selectedRouteName = null }) {
    const [sortKey, setSortKey] = useState('year')
    const [sortAsc, setSortAsc] = useState(true)

    const sortedData = useMemo(() => {
        if (!tableData?.length) return []
        const sorted = [...tableData].sort((a, b) => {
            const aVal = a[sortKey] ?? 0
            const bVal = b[sortKey] ?? 0
            return sortAsc ? aVal - bVal : bVal - aVal
        })
        return sorted
    }, [tableData, sortKey, sortAsc])

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc)
        } else {
            setSortKey(key)
            setSortAsc(true)
        }
    }

    if (!tableData?.length) return null

    const lastYear = tableData[tableData.length - 1]
    const netWealth = lastYear ? (lastYear.portfolioValue - lastYear.helocBalance) : 0
    const debtToWealth = lastYear?.portfolioValue > 0
        ? ((lastYear.helocBalance / lastYear.portfolioValue) * 100).toFixed(1)
        : 0

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        📊 Year-by-Year Results
                        <Badge variant="outline" className="text-xs">
                            {MODE_LABELS[optimizationMode] || MODE_LABELS.classic}
                        </Badge>
                        {selectedRouteName && (
                            <Badge variant="success" className="text-xs">
                                🗺️ {selectedRouteName}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="outline">Net Wealth: {formatCurrency(netWealth)}</Badge>
                        <Badge variant={parseFloat(debtToWealth) < 50 ? "success" : "warning"}>
                            D/W: {debtToWealth}%
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {COLUMNS.map(col => (
                                <TableHead key={col.key} className="text-center whitespace-nowrap">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-1 text-xs font-medium"
                                        onClick={() => handleSort(col.key)}
                                    >
                                        {col.label}
                                        {sortKey === col.key ? (
                                            sortAsc ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                                        ) : (
                                            <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />
                                        )}
                                    </Button>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((row) => (
                            <TableRow
                                key={row.year}
                                className="cursor-pointer hover:bg-muted/80"
                                onClick={() => onRowClick?.(row.year)}
                            >
                                <TableCell className="text-center font-medium text-xs">{row.year}</TableCell>
                                <TableCell className="text-right text-xs text-red-600 dark:text-red-400">{formatCurrency(row.mortgageBalance, true)}</TableCell>
                                <TableCell className="text-right text-xs text-orange-600 dark:text-orange-400">{formatCurrency(row.helocBalance, true)}</TableCell>
                                <TableCell className="text-right text-xs text-teal-600 dark:text-teal-400">{formatCurrency(row.tfsaValue, true)}</TableCell>
                                <TableCell className="text-right text-xs text-indigo-600 dark:text-indigo-400">{formatCurrency(row.rrspValue, true)}</TableCell>
                                <TableCell className="text-right text-xs text-amber-600 dark:text-amber-400">{formatCurrency(row.nonRegValue, true)}</TableCell>
                                <TableCell className="text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.portfolioValue, true)}</TableCell>
                                <TableCell className="text-right text-xs text-blue-600 dark:text-blue-400">{formatCurrency(row.taxRefund, true)}</TableCell>
                                <TableCell className="text-right text-xs">{formatCurrency(row.principalBuilt, true)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
