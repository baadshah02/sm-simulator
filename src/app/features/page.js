"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import PageHeader from "@/components/page-header"

const FEATURES = [
    {
        category: "🎯 Strategy Optimizer",
        description: "The optimizer runs over 450 simulations to find your best allocation strategy — testing every combination of how to deploy your HELOC capital in Year 1 (8 options) × how to allocate ongoing cash in Years 2-30 (10 strategies) × stress-testing against 5 risk scenarios. Each simulation runs a complete 30-year financial model with all CRA rules enforced.",
        items: [
            { name: "Marginal Value Analysis", desc: "For every dollar available, the engine calculates the after-tax future value of sending it to TFSA, RRSP, Mortgage paydown, or Non-Registered investments — then fills the highest-value destination first." },
            { name: "80 Strategy Combinations", desc: "8 Year 1 deployment options (e.g., TFSA first, RRSP first, all Non-Reg) × 10 ongoing strategies (e.g., Max RRSP+TFSA, Pure SM, HELOC Paydown). Each runs independently for 30 years." },
            { name: "Refinement Pass", desc: "After finding the top strategy, the engine tries switching individual years to alternative approaches — checking if a different allocation in a specific year improves the final outcome." },
            { name: "After-Tax Scoring", desc: "Strategies are ranked by true after-tax net wealth: TFSA (100% tax-free), RRSP (taxed at retirement rate), Non-Reg (capital gains at 50% inclusion rate), minus HELOC debt." },
        ]
    },
    {
        category: "🛡️ Risk Scenario Models",
        description: "Each risk scenario modifies the base simulation's market returns, interest rates, or both — showing how your strategy performs under stress. The robustness analysis runs the top 10 strategies across ALL 5 scenarios (50 additional simulations) to find which approach survives all market conditions best.",
        items: [
            { name: "📊 Base Case", desc: "Uses your exact inputs as-is. No market shocks. This is your \"everything goes according to plan\" scenario." },
            { name: "📉 2008 Crash", desc: "Year 3: -38% market crash. Year 4: -5% continued decline. Years 5-6: +15% and +12% recovery bounce. Dividends reduced by 30% during crash. Models a severe GFC-style event." },
            { name: "📈 Rate Shock", desc: "Year 2+: HELOC rate increases by +2.0%. Year 5+: Mortgage rate increases by +1.5% at renewal. Tests the impact of rising interest rate environments on your leveraged strategy." },
            { name: "🐌 Stagflation", desc: "Years 1-10: Investment returns halved, HELOC rate +1.5%, mortgage rate +1.0%, inflation jumps to 4%. A prolonged low-growth, high-cost environment lasting a full decade." },
            { name: "⏳ Lost Decade", desc: "Years 1-10: Only 2% annual returns (vs typical 7%), dividend yield drops to 1%. After Year 10, normal returns resume. Models a Japan-style extended flat market." },
        ]
    },
    {
        category: "💰 Lump Sum Planning",
        description: "Model a one-time cash injection from outside savings (bonus, inheritance, tax refund, etc.). The optimizer determines the best deployment across all available accounts.",
        items: [
            { name: "Optimal Deployment", desc: "When a lump sum is specified, the marginal value engine determines whether to put it in TFSA, RRSP, mortgage prepayment, or a combination — based on which generates the highest 30-year after-tax wealth." },
            { name: "Visual Tracking", desc: "Lump sum years are highlighted in purple throughout the app: allocation cards, flow charts, and year detail popups all clearly show the injection and where the money was deployed." },
        ]
    },
    {
        category: "📊 Visualization & Year-by-Year Detail",
        description: "Every year of the 30-year simulation is fully transparent — click any year to see the complete money flow.",
        items: [
            { name: "Flow Visualization", desc: "Stacked area chart shows mortgage & HELOC (below zero) and TFSA, RRSP, Non-Reg investments (above). Key milestones marked: Mortgage-Free year and Wealth > Debt crossover point." },
            { name: "Annual Cash Flows", desc: "Bar chart breaks down each year's money movement: standard mortgage principal, SM acceleration boost, lump sum injection, and CRA tax refund." },
            { name: "Money Flow Diagram", desc: "Click any table row to see a step-by-step visualization: mortgage payment → interest/principal split → HELOC re-borrow → investment → deductions → tax refund → SM boost. Shows exactly how each dollar flows." },
            { name: "CRA Audit Trail", desc: "Full tax compliance tracking: Adjusted Cost Base (ACB), deductible vs non-deductible HELOC interest, RRSP deductions, dividend income, estimated refund, and cumulative deductible interest." },
        ]
    },
    {
        category: "🏠 Canadian Tax & Mortgage Calculations",
        description: "All calculations follow Canadian tax law and mortgage conventions precisely.",
        items: [
            { name: "Mortgage Compounding", desc: "Fixed-rate mortgages use semi-annual compounding as required by Canada's Interest Act — the effective monthly rate is calculated as (1 + annual_rate/2)^(1/6) - 1. Variable-rate mortgages use monthly compounding (annual_rate/12)." },
            { name: "Provincial Tax Rates", desc: "Combined federal + provincial marginal tax rates auto-filled for all provinces and territories. Custom rate option available for non-standard situations." },
            { name: "CRA Contribution Limits", desc: "TFSA annual room ($7,000 in 2024, configurable), RRSP annual maximum ($31,560), and room replenishment from 18% of earned income are all tracked and enforced." },
            { name: "Readvanceable Mortgage", desc: "When mortgage principal is paid down, the freed room is immediately available for HELOC re-borrowing — this is the core mechanism that makes the Smith Manoeuvre work." },
            { name: "Tax Refund Calculation", desc: "Refund = (RRSP contribution × marginal tax rate) + (deductible HELOC interest × marginal tax rate). This refund is then applied to accelerate the next year's mortgage paydown." },
        ]
    },
    {
        category: "⚙️ Presets & Configuration",
        description: "Start with a built-in preset or create your own. Custom presets save all your current form settings and appear alongside built-in presets for quick switching.",
        items: [
            { name: "Vanilla SM Preset", desc: "Built-in baseline: $500K mortgage, no TFSA/RRSP, no HELOC — shows the pure Smith Manoeuvre mechanism without any registered account optimization." },
            { name: "Create Custom Presets", desc: "Configure your exact financial situation, then click '+ Save as Preset' to save it. Custom presets appear in the preset bar with a ⭐ icon and can be loaded with one click. Remove them by hovering and clicking ✕." },
            { name: "Model Save & Compare", desc: "Save multiple simulation results as named models. Compare them side-by-side: mortgage payoff year, final portfolio, net wealth, total tax refunds across different configurations." },
            { name: "5 Risk Scenarios", desc: "Switch between Base Case, 2008 Crash, Rate Shock, Stagflation, and Lost Decade to see how your strategy performs under different market conditions." },
        ]
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen">
            <PageHeader subtitle="Features Overview" currentPage="features" />

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold">🇨🇦 Smith Manoeuvre Simulator</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        A comprehensive Canadian wealth strategy analysis tool that runs <strong>450+ simulations</strong> to find 
                        your optimal allocation strategy, stress-tests it against 5 risk scenarios, and provides complete 
                        year-by-year transparency with CRA compliance tracking.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                        <Badge variant="outline">450+ Simulations</Badge>
                        <Badge variant="outline">5 Risk Scenarios</Badge>
                        <Badge variant="outline">30-Year Projections</Badge>
                        <Badge variant="outline">CRA Compliant</Badge>
                        <Badge variant="outline">After-Tax Scoring</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {FEATURES.map((section, si) => (
                        <Card key={si}>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="text-lg font-semibold">{section.category}</h3>
                                {section.description && (
                                    <p className="text-sm text-muted-foreground border-l-2 border-emerald-300 pl-3">
                                        {section.description}
                                    </p>
                                )}
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