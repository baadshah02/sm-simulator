"use client"

import { formatCurrency } from "@/lib/utils"

// Color-coded arrow: green for deductible/growth paths, orange for non-deductible
function FlowArrow({ label, amount, direction = "down", variant = "default" }) {
    const colorMap = {
        default: "text-muted-foreground/60",
        deductible: "text-emerald-500",
        nonDeductible: "text-orange-400",
        refund: "text-blue-500",
    }
    const arrowColor = colorMap[variant] || colorMap.default
    const labelColorMap = {
        default: "text-muted-foreground",
        deductible: "text-emerald-600 dark:text-emerald-400",
        nonDeductible: "text-orange-500",
        refund: "text-blue-600",
    }
    const labelColor = labelColorMap[variant] || labelColorMap.default

    const isRight = direction === "right"

    return (
        <div className={`flex ${isRight ? 'flex-row' : 'flex-col'} items-center justify-center gap-0.5`}>
            <svg
                width={isRight ? 40 : 20}
                height={isRight ? 20 : 26}
                viewBox={isRight ? "0 0 40 20" : "0 0 20 26"}
                className={arrowColor}
            >
                {isRight ? (
                    <>
                        <line x1="0" y1="10" x2="32" y2="10" stroke="currentColor" strokeWidth="2" />
                        <polygon points="32,6 40,10 32,14" fill="currentColor" />
                    </>
                ) : (
                    <>
                        <line x1="10" y1="0" x2="10" y2="18" stroke="currentColor" strokeWidth="2" />
                        <polygon points="6,18 10,26 14,18" fill="currentColor" />
                    </>
                )}
            </svg>
            {(label || amount !== undefined) && (
                <div className="text-center">
                    {amount !== undefined && (
                        <span className={`text-xs font-bold ${labelColor} block`}>
                            {formatCurrency(amount)}
                        </span>
                    )}
                    {label && <span className={`text-[10px] ${labelColor} block leading-tight`}>{label}</span>}
                </div>
            )}
        </div>
    )
}

function FlowNode({ icon, title, amount, color = "border-border", bg = "bg-card", subtitle, highlight = false }) {
    return (
        <div className={`rounded-lg border-2 ${color} ${bg} px-3 py-2 text-center shadow-sm min-w-[120px] ${highlight ? 'ring-2 ring-emerald-400/50' : ''}`}>
            <div className="text-lg leading-none mb-0.5">{icon}</div>
            <div className="text-xs font-semibold truncate">{title}</div>
            {amount !== undefined && (
                <div className="text-sm font-bold mt-0.5">{formatCurrency(amount)}</div>
            )}
            {subtitle && <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>}
        </div>
    )
}

function SplitArrow({ leftLabel, rightLabel, leftAmount, rightAmount }) {
    return (
        <div className="flex items-start justify-center gap-8 py-1">
            <div className="flex flex-col items-center">
                <svg width="20" height="24" viewBox="0 0 20 24" className="text-red-400">
                    <line x1="10" y1="0" x2="10" y2="16" stroke="currentColor" strokeWidth="2" />
                    <polygon points="6,16 10,24 14,16" fill="currentColor" />
                </svg>
                {leftAmount !== undefined && (
                    <span className="text-xs font-bold text-red-500">{formatCurrency(leftAmount)}</span>
                )}
                {leftLabel && <span className="text-[10px] text-red-400">{leftLabel}</span>}
            </div>
            <div className="flex flex-col items-center">
                <svg width="20" height="24" viewBox="0 0 20 24" className="text-emerald-500">
                    <line x1="10" y1="0" x2="10" y2="16" stroke="currentColor" strokeWidth="2" />
                    <polygon points="6,16 10,24 14,16" fill="currentColor" />
                </svg>
                {rightAmount !== undefined && (
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(rightAmount)}</span>
                )}
                {rightLabel && <span className="text-[10px] text-emerald-600">{rightLabel}</span>}
            </div>
        </div>
    )
}

export default function SmithFlowDiagram({ yearData }) {
    if (!yearData || !yearData.details) return null

    const { details, year } = yearData
    const { beginning, calculations, assumptions, end, craAudit } = details

    const mortgagePaymentAnnual = calculations.standardPrincipal + (beginning.mortgage * (assumptions.mortgageRate / 100))
    const interestPaid = mortgagePaymentAnnual - calculations.standardPrincipal
    const principalFreed = calculations.P
    const deductibleInterest = calculations.deductibleInterest
    const taxRefund = calculations.refund
    const additionalDeductible = calculations.additionalDeductible
    const dividends = calculations.dividendsThisYear
    const rrspContrib = assumptions.rrspContrib
    const tfsaContrib = assumptions.tfsaContrib
    const smBoost = principalFreed - calculations.standardPrincipal

    return (
        <div className="py-2">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                🔄 Year {year} — Money Flow
            </h3>

            <div className="flex flex-col items-center gap-1 overflow-x-auto">

                {/* Step 1: Mortgage Payment */}
                <FlowNode
                    icon="🏠"
                    title="Mortgage Payment"
                    amount={Math.round(mortgagePaymentAnnual)}
                    color="border-red-300"
                    bg="bg-red-50 dark:bg-red-950/30"
                    subtitle={`Balance: ${formatCurrency(beginning.mortgage)}`}
                />

                {/* Split into interest & principal */}
                <SplitArrow
                    leftLabel="Interest (wasted)"
                    rightLabel="Principal (freed)"
                    leftAmount={Math.round(interestPaid)}
                    rightAmount={Math.round(calculations.standardPrincipal)}
                />

                <div className="flex items-start gap-8">
                    <FlowNode
                        icon="💸"
                        title="Mort. Interest"
                        amount={Math.round(interestPaid)}
                        color="border-red-200"
                        bg="bg-red-50/50 dark:bg-red-950/20"
                        subtitle="Non-deductible"
                    />
                    <div className="flex flex-col items-center">
                        <FlowNode
                            icon="🔑"
                            title="Principal Built"
                            amount={Math.round(principalFreed)}
                            color="border-emerald-300"
                            bg="bg-emerald-50 dark:bg-emerald-950/30"
                            subtitle={smBoost > 0 ? `Std: ${formatCurrency(calculations.standardPrincipal)} + Boost: ${formatCurrency(smBoost)}` : "Standard"}
                            highlight={smBoost > 0}
                        />
                    </div>
                </div>

                {/* Step 2: Re-borrow on HELOC — color-coded green (deductible path) */}
                <FlowArrow label="Re-borrow → invest" variant="deductible" />

                <FlowNode
                    icon="🏦"
                    title="HELOC"
                    amount={Math.round(end.heloc)}
                    color="border-orange-300"
                    bg="bg-orange-50 dark:bg-orange-950/30"
                    subtitle={`+${formatCurrency(additionalDeductible)} deductible`}
                />

                {/* Step 3: Invest */}
                <FlowArrow label="Invest" variant="deductible" />

                <div className="flex items-start gap-3 flex-wrap justify-center">
                    {additionalDeductible > 0 && (
                        <FlowNode
                            icon="📈"
                            title="Non-Reg"
                            amount={Math.round(end.nonReg)}
                            color="border-amber-300"
                            bg="bg-amber-50 dark:bg-amber-950/30"
                            subtitle={`+${formatCurrency(additionalDeductible)} HELOC`}
                        />
                    )}
                    {tfsaContrib > 0 && (
                        <FlowNode
                            icon="💎"
                            title="TFSA"
                            amount={Math.round(end.tfsa)}
                            color="border-teal-300"
                            bg="bg-teal-50 dark:bg-teal-950/30"
                            subtitle={`+${formatCurrency(tfsaContrib)}/yr`}
                        />
                    )}
                    {rrspContrib > 0 && (
                        <FlowNode
                            icon="🛡️"
                            title="RRSP"
                            amount={Math.round(end.rrsp)}
                            color="border-indigo-300"
                            bg="bg-indigo-50 dark:bg-indigo-950/30"
                            subtitle={`+${formatCurrency(rrspContrib)}/yr`}
                        />
                    )}
                </div>

                {/* Step 4: Returns & deductions */}
                <FlowArrow label="Returns & deductions" variant="deductible" />

                <div className="flex items-start gap-4 flex-wrap justify-center">
                    {dividends > 0 && (
                        <FlowNode
                            icon="💵"
                            title="Dividends"
                            amount={dividends}
                            color="border-green-300"
                            bg="bg-green-50 dark:bg-green-950/30"
                            subtitle="Reinvested"
                        />
                    )}
                    {deductibleInterest > 0 && (
                        <FlowNode
                            icon="📝"
                            title="HELOC Interest"
                            amount={Math.round(deductibleInterest)}
                            color="border-emerald-300"
                            bg="bg-emerald-50/50 dark:bg-emerald-950/20"
                            subtitle="✅ Tax Deductible"
                        />
                    )}
                    {rrspContrib > 0 && (
                        <FlowNode
                            icon="🧾"
                            title="RRSP Deduction"
                            amount={Math.round(rrspContrib)}
                            color="border-indigo-200"
                            bg="bg-indigo-50/50 dark:bg-indigo-950/20"
                            subtitle={`@ ${assumptions.taxRate}%`}
                        />
                    )}
                </div>

                {/* Step 5: Tax Refund */}
                <FlowArrow label="CRA refund" amount={Math.round(taxRefund)} variant="refund" />

                <FlowNode
                    icon="💳"
                    title="Tax Refund"
                    amount={Math.round(taxRefund)}
                    color="border-blue-400"
                    bg="bg-blue-50 dark:bg-blue-950/30"
                    subtitle="→ Accelerates paydown"
                    highlight
                />

                {/* Step 6: Accelerate */}
                <FlowArrow label="Extra mortgage payment" variant="deductible" />

                <FlowNode
                    icon="⚡"
                    title="SM Boost"
                    amount={smBoost > 0 ? Math.round(smBoost) : 0}
                    color="border-emerald-400"
                    bg="bg-emerald-50 dark:bg-emerald-950/30"
                    subtitle="Extra principal beyond standard"
                    highlight
                />

                {/* Dynamic year-end summary (replaces static cycle note) */}
                <div className="mt-2 rounded-lg border border-border bg-muted/30 px-4 py-2 w-full max-w-md">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mortgage</span>
                            <span className="font-medium text-red-500">
                                {formatCurrency(beginning.mortgage)} → {formatCurrency(end.mortgage)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Portfolio</span>
                            <span className="font-medium text-emerald-600">
                                {formatCurrency(beginning.portfolio)} → {formatCurrency(end.portfolio)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">HELOC</span>
                            <span className="font-medium text-orange-500">
                                {formatCurrency(beginning.heloc)} → {formatCurrency(end.heloc)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Net Wealth</span>
                            <span className="font-bold text-blue-600">
                                {formatCurrency(end.portfolio - end.heloc)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
