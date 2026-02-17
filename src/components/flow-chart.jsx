"use client"

import { useState } from "react"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, Legend, ReferenceLine, ComposedChart, Bar
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
            <p className="font-bold text-sm mb-2">Year {label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                        {entry.name}
                    </span>
                    <span className="font-medium">{formatCurrency(Math.abs(entry.value))}</span>
                </div>
            ))}
            {payload.length > 0 && (() => {
                const debt = Math.abs(payload.find(p => p.dataKey === 'negMortgage')?.value || 0)
                    + Math.abs(payload.find(p => p.dataKey === 'negHeloc')?.value || 0)
                const wealth = (payload.find(p => p.dataKey === 'tfsaValue')?.value || 0)
                    + (payload.find(p => p.dataKey === 'rrspValue')?.value || 0)
                    + (payload.find(p => p.dataKey === 'nonRegValue')?.value || 0)
                return (
                    <div className="border-t pt-1.5 mt-1">
                        <div className="flex justify-between">
                            <span className="text-red-500">Total Debt</span>
                            <span className="font-medium text-red-500">{formatCurrency(debt)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-emerald-600">Total Wealth</span>
                            <span className="font-medium text-emerald-600">{formatCurrency(wealth)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Net Position</span>
                            <span className={wealth - debt > 0 ? "text-emerald-600" : "text-red-500"}>
                                {formatCurrency(wealth - debt)}
                            </span>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}


export default function FlowChart({ smithData, noSmithData }) {
    const [showComparison, setShowComparison] = useState(false)

    if (!smithData?.length) return null

    // Prepare chart data — debt shown as negative for visual clarity
    const chartData = smithData.map((row, i) => {
        const noSm = noSmithData?.[i] || {}
        const stdPrincipal = row.details?.calculations?.standardPrincipal || 0
        const accelerationBoost = Math.max(0, row.principalBuilt - stdPrincipal)
        return {
            year: row.year,
            // Debt (negative side)
            negMortgage: -row.mortgageBalance,
            negHeloc: -row.helocBalance,
            // Wealth (positive side)
            tfsaValue: row.tfsaValue,
            rrspValue: row.rrspValue,
            nonRegValue: row.nonRegValue,
            // Tax refund & decomposed principal (for flow bars)
            taxRefund: row.taxRefund,
            stdPrincipal: Math.round(stdPrincipal),
            accelerationBoost: Math.round(accelerationBoost),
            // Comparison line
            noSmPortfolio: noSm.portfolioValue || 0,
            noSmMortgage: -(noSm.mortgageBalance || 0),
        }
    })

    // Find the year where portfolio exceeds total debt
    const crossoverYear = chartData.find(d =>
        (d.tfsaValue + d.rrspValue + d.nonRegValue) > Math.abs(d.negMortgage + d.negHeloc) &&
        d.year > 0
    )

    // Find mortgage payoff year
    const payoffYear = chartData.find(d => d.negMortgage === 0 && d.year > 0)

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <CardTitle className="text-lg">📊 Smith Manoeuvre Flow Visualization</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            How debt converts to wealth — mortgage &amp; HELOC below, investments above
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {payoffYear && (
                            <Badge variant="success">🏠 Mortgage Free: Year {payoffYear.year}</Badge>
                        )}
                        {crossoverYear && (
                            <Badge variant="outline">📈 Wealth &gt; Debt: Year {crossoverYear.year}</Badge>
                        )}
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                        >
                            {showComparison ? 'Hide' : 'Show'} No-SM Comparison
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Main stacked area chart */}
                <ResponsiveContainer width="100%" height={450}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                        <defs>
                            <linearGradient id="gradMortgage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15} />
                            </linearGradient>
                            <linearGradient id="gradHeloc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.7} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.15} />
                            </linearGradient>
                            <linearGradient id="gradTfsa" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.7} />
                            </linearGradient>
                            <linearGradient id="gradRrsp" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.7} />
                            </linearGradient>
                            <linearGradient id="gradNonReg" x1="0" y1="1" x2="0" y2="0">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.7} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 11 }}
                            label={{ value: 'Year', position: 'insideBottom', offset: -5, fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => {
                                const abs = Math.abs(v)
                                if (abs >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
                                if (abs >= 1000) return `$${(v / 1000).toFixed(0)}K`
                                return `$${v}`
                            }}
                            label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 12 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />

                        {/* Zero line */}
                        <ReferenceLine y={0} stroke="#888" strokeWidth={2} />

                        {/* Debt areas (negative) */}
                        <Area
                            type="monotone"
                            dataKey="negMortgage"
                            name="🏠 Mortgage"
                            stackId="debt"
                            fill="url(#gradMortgage)"
                            stroke="#ef4444"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="negHeloc"
                            name="🏦 HELOC"
                            stackId="debt"
                            fill="url(#gradHeloc)"
                            stroke="#f97316"
                            strokeWidth={2}
                        />

                        {/* Wealth areas (positive) */}
                        <Area
                            type="monotone"
                            dataKey="nonRegValue"
                            name="📈 Non-Reg"
                            stackId="wealth"
                            fill="url(#gradNonReg)"
                            stroke="#f59e0b"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="rrspValue"
                            name="🛡️ RRSP"
                            stackId="wealth"
                            fill="url(#gradRrsp)"
                            stroke="#6366f1"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="tfsaValue"
                            name="💎 TFSA"
                            stackId="wealth"
                            fill="url(#gradTfsa)"
                            stroke="#14b8a6"
                            strokeWidth={2}
                        />

                        {/* Comparison dashed lines — always rendered, visibility toggled */}
                        <Area
                            type="monotone"
                            dataKey="noSmPortfolio"
                            name="No-SM Portfolio"
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth={2.5}
                            strokeDasharray="6 3"
                            hide={!showComparison}
                        />
                        <Area
                            type="monotone"
                            dataKey="noSmMortgage"
                            name="No-SM Mortgage"
                            fill="none"
                            stroke="#f472b6"
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            hide={!showComparison}
                        />

                        {/* Milestones */}
                        {payoffYear && (
                            <ReferenceLine
                                x={payoffYear.year}
                                stroke="#22c55e"
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                                label={{ value: '🏠 Mortgage-Free', position: 'top', fontSize: 10, fill: '#22c55e' }}
                            />
                        )}
                        {crossoverYear && crossoverYear.year !== payoffYear?.year && (
                            <ReferenceLine
                                x={crossoverYear.year}
                                stroke="#3b82f6"
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                                label={{ value: '📈 Wealth > Debt', position: 'top', fontSize: 10, fill: '#3b82f6' }}
                            />
                        )}

                        <Legend
                            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                            iconType="square"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Annual flows bar chart */}
                <div className="mt-6">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">💸 Annual Cash Flows</h4>
                    <ResponsiveContainer width="100%" height={180}>
                        <ComposedChart data={chartData.filter(d => d.year > 0)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`}
                            />
                            <RechartsTooltip
                                formatter={(value, name) => [formatCurrency(value), name]}
                                contentStyle={{ fontSize: 11 }}
                            />
                            <Bar dataKey="stdPrincipal" name="🏠 Std Principal" stackId="principal" fill="#22c55e" opacity={0.7} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="accelerationBoost" name="⚡ SM Boost" stackId="principal" fill="#10b981" opacity={0.5} radius={[2, 2, 0, 0]} />
                            <Bar dataKey="taxRefund" name="💳 Tax Refund" fill="#3b82f6" opacity={0.7} radius={[2, 2, 0, 0]} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
