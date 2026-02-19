"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, ArrowLeft } from "lucide-react"

const FEATURES = [
    {
        category: "🎯 Optimization Engine",
        items: [
            { name: "Smart Adaptive Optimizer", desc: "Marginal analysis ranks every dollar destination (TFSA, RRSP, Mortgage, Non-Reg) by after-tax future value — greedily allocating to maximize 30-year wealth." },
            { name: "A* Two-Phase Search", desc: "Phase 1: Tests 80 strategy combinations (8 Year 1 × 10 ongoing). Phase 2: Local refinement on the best — tries switching individual years to find improvements." },
            { name: "Alternative Strategies", desc: "Top 3 genuinely different strategies shown side-by-side. Click any to load its data into the chart and table." },
            { name: "After-Tax Scoring", desc: "All strategies scored by true after-tax wealth: TFSA (tax-free), RRSP (minus retirement tax), Non-Reg (minus capital gains tax)." },
        ]
    },
    {
        category: "🛡️ Risk Analysis",
        items: [
            { name: "5 Risk Scenarios", desc: "Base Case, 2008 Crash (-38% in Year 3), Rate Shock (+2% HELOC), Stagflation (10yr low returns + high rates), Lost Decade (2% returns for 10 years)." },
            { name: "Multi-Scenario Robustness", desc: "Top 10 strategies tested across ALL 5 scenarios. Robustness score = 50% base + 50% average stress. Shows which strategy survives market shocks best." },
            { name: "Scenario × Strategy Matrix", desc: "Expandable table showing every strategy's net wealth under each risk scenario, with color-coded best/worst cases." },
        ]
    },
    {
        category: "💰 Lump Sum Planning",
        items: [
            { name: "One-Time Cash Windfall", desc: "Model a bonus, inheritance, or savings injection. Specify amount and year — optimizer determines best deployment (TFSA, RRSP, or Mortgage)." },
            { name: "Lump Sum Visualization", desc: "Purple-highlighted allocation cards show exactly where lump sum money goes. Flow chart shows purple bar in Annual Cash Flows for the lump sum year." },
            { name: "Lump Sum in Year Details", desc: "Click any year in the table — the popup Money Flow diagram shows the lump sum injection with deployment arrows." },
        ]
    },
    {
        category: "📊 Visualization & Analysis",
        items: [
            { name: "Stacked Area Flow Chart", desc: "Mortgage & HELOC below zero, investments above. Milestones marked: Mortgage-Free year, Wealth > Debt crossover." },
            { name: "Annual Cash Flows", desc: "Bar chart decomposing: Standard Principal, SM Boost, Lump Sum, and Tax Refund for each year." },
            { name: "Year-by-Year Money Flow", desc: "Click any row to see a detailed flow diagram: mortgage payment → interest/principal split → HELOC re-borrow → invest → deductions → refund → SM boost." },
            { name: "CRA Audit Trail", desc: "Every year tracks: Opening/Closing ACB, deductible vs non-deductible interest, RRSP deductions, estimated refund, cumulative deductible interest." },
        ]
    },
    {
        category: "🏠 Canadian Tax Integration",
        items: [
            { name: "Provincial Tax Rates", desc: "Auto-fills combined federal + provincial marginal tax rate for all provinces. Custom rate option available." },
            { name: "Fixed & Variable Mortgages", desc: "Canadian fixed-rate semi-annual compounding (Interest Act) and variable monthly compounding both supported." },
            { name: "TFSA/RRSP Room Tracking", desc: "CRA contribution limits enforced: TFSA annual room, RRSP annual max ($31,560), room replenishment from earned income." },
            { name: "Inflation Adjustment", desc: "Dynamic inflation note shows portfolio value in today's dollars — updates based on selected strategy." },
        ]
    },
    {
        category: "⚙️ Presets & Profiles",
        items: [
            { name: "6 Presets", desc: "Vanilla SM, First-Time Buyer, Mid-Career Pro, Max Leverage, Conservative, Rental Investor — each tests a fundamentally different scenario." },
            { name: "Model Comparison", desc: "Save multiple model snapshots, compare side-by-side: payoff year, final portfolio, net wealth, total refunds." },
            { name: "URL-Based Profiles", desc: "Personal profiles loaded via URL path — keeps sensitive data private from public visitors." },
        ]
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Smith Manoeuvre Simulator</h1>
                            <p className="text-xs text-muted-foreground">Features Overview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="hidden sm:flex">🇨🇦 Canada</Badge>
                        <a href="/">
                            <Button variant="outline" size="sm" className="text-xs gap-1">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back to Simulator
                            </Button>
                        </a>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold">🇨🇦 Smith Manoeuvre Simulator</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        A comprehensive Canadian wealth strategy analysis tool with A* optimization, 
                        multi-scenario robustness testing, and complete CRA compliance tracking.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {FEATURES.map((section, si) => (
                        <Card key={si}>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="text-lg font-semibold">{section.category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.items.map((item, ii) => (
                                        <div key={ii} className="rounded-lg border p-4 space-y-2">
                                            <Badge variant="outline" className="text-xs">
                                                {item.name}
                                            </Badge>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center space-y-4 border-t pt-8">
                    <a href="/">
                        <Button size="lg" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Start Simulating
                        </Button>
                    </a>
                    <p className="text-xs text-muted-foreground">
                        Built for Canadian homeowners exploring the Smith Manoeuvre.<br />
                        For educational purposes only — consult a financial advisor.
                    </p>
                </div>
            </main>
        </div>
    );
}