"use client"

import { useState, useCallback, useEffect, useMemo, Suspense } from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { useFormData } from "@/hooks/useFormData"
import { JAY_PROFILE } from "@/lib/formFields"
import {
    generateFinancialData,
    generateNoSmithData,
    calculateTraditionalPayoff,
    calculateSmithManoeuvrePayoff
} from "@/lib/financialCalculations"
import { PRESETS } from "@/lib/presets"
import { getScenarioById } from "@/lib/scenarios"

import FinancialForm from "@/components/financial-form"
import ComparisonSummary from "@/components/comparison-summary"
import DataTable from "@/components/data-table"
import YearDetailsDialog from "@/components/year-details-dialog"
import ScenarioSelector from "@/components/scenario-selector"
import ModelComparison from "@/components/model-comparison"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, BarChart3, RotateCcw, Save } from "lucide-react"

// Lazy-load the heavy Recharts-based FlowChart (200KB+ library)
const FlowChart = dynamic(() => import("@/components/flow-chart"), {
    ssr: false,
    loading: () => (
        <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading chart...
        </div>
    ),
})

export default function HomePage() {
    const pathname = usePathname()
    const profile = useMemo(() => {
        if (pathname?.includes('/jay')) return JAY_PROFILE
        return null
    }, [pathname])

    const { formData, setFormData, handleChange, handleInputChange, resetForm } = useFormData(profile)
    const [tableData, setTableData] = useState([])
    const [noSmithData, setNoSmithData] = useState([])
    const [comparisonData, setComparisonData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedYear, setSelectedYear] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Scenario state
    const [selectedScenario, setSelectedScenario] = useState('base')

    // Allocation plan + explorer results (from Smart/Explorer modes)
    const [allocationPlan, setAllocationPlan] = useState(null)
    const [explorerResults, setExplorerResults] = useState(null)
    const [aStarOptimal, setAStarOptimal] = useState(null)
    const [robustnessResults, setRobustnessResults] = useState(null)
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(null)

    // Saved models for comparison
    const [savedModels, setSavedModels] = useState([])
    const [modelName, setModelName] = useState('')
    const [showSaveInput, setShowSaveInput] = useState(false)

    const handleGenerate = useCallback(() => {
        try {
            setIsLoading(true)

            // Get scenario overrides function
            const scenario = getScenarioById(selectedScenario)
            const overridesFn = scenario.id !== 'base' ? scenario.yearOverrides : null

            const data = generateFinancialData(formData, overridesFn)
            setTableData(data)

            // Extract allocation plan, A* optimal, explorer results, and robustness
            setAllocationPlan(data.allocationPlan || null)
            setAStarOptimal(data.aStarOptimal || null)
            setExplorerResults(data.explorerResults || null)
            setRobustnessResults(data.robustnessResults || null)

            const noSmData = generateNoSmithData(formData)
            setNoSmithData(noSmData)

            const traditionalPayoff = calculateTraditionalPayoff(
                formData.initialMortgage,
                formData.mortgageRate,
                formData.amortYears,
                formData.mortgageType
            )
            const smithPayoff = calculateSmithManoeuvrePayoff(data)

            setComparisonData({
                traditional: traditionalPayoff,
                smithManoeuvre: smithPayoff,
                timeSaved: traditionalPayoff.years - smithPayoff.years,
                interestSaved: traditionalPayoff.totalInterest - (smithPayoff.totalLeveraged || 0),
                wealthBuilt: smithPayoff.finalPortfolio || 0,
                retirementTaxRate: formData.retirementTaxRate,
                inflationRate: formData.inflationRate,
                optimizationMode: formData.optimizationMode || 'classic',
            })
        } catch (error) {
            console.error('Error generating financial data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [formData, selectedScenario])

    // Auto-regenerate when scenario changes (if data already exists)
    useEffect(() => {
        if (tableData.length > 0) {
            handleGenerate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedScenario])

    const handleRowClick = useCallback((year) => {
        const yearRow = tableData.find(d => d.year === year)
        if (yearRow) {
            setSelectedYear(yearRow)
            setDialogOpen(true)
        }
    }, [tableData])

    const handleDialogClose = useCallback((open) => {
        setDialogOpen(open)
    }, [])

    const handleYearNavigate = useCallback((year) => {
        const yearRow = tableData.find(d => d.year === year)
        if (yearRow) setSelectedYear(yearRow)
    }, [tableData])

    const handleReset = useCallback(() => {
        resetForm()
        setTableData([])
        setNoSmithData([])
        setComparisonData(null)
        setSelectedScenario('base')
        setAllocationPlan(null)
        setAStarOptimal(null)
        setExplorerResults(null)
        setRobustnessResults(null)
        setSelectedRouteIndex(null)
    }, [resetForm])

    const handleLoadPreset = useCallback((presetFormData) => {
        setFormData(presetFormData)
    }, [setFormData])

    // Model save/compare handlers
    const handleSaveModel = useCallback(() => {
        if (!tableData.length) return
        const name = modelName.trim() || `Model ${savedModels.length + 1}`
        const scenario = getScenarioById(selectedScenario)
        setSavedModels(prev => [...prev, {
            name,
            formData: { ...formData },
            data: tableData,
            scenario: scenario.name,
        }])
        setModelName('')
        setShowSaveInput(false)
    }, [tableData, modelName, formData, selectedScenario, savedModels.length])

    const handleRemoveModel = useCallback((index) => {
        setSavedModels(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleLoadModel = useCallback((index) => {
        const model = savedModels[index]
        if (model) {
            setFormData(model.formData)
        }
    }, [savedModels, setFormData])

    const currentMode = formData.optimizationMode || 'classic'

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
                            <p className="text-xs text-muted-foreground">Canadian Wealth Strategy Analysis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {currentMode !== 'classic' && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                {currentMode === 'optimizer' ? '🎯 Optimizer' : currentMode === 'smart' ? '🧠 Smart' : '🔍 Explorer'}
                            </Badge>
                        )}
                        <Badge variant="outline" className="hidden sm:flex">🇨🇦 Canada</Badge>
                        <a href="/features">
                            <Button variant="ghost" size="sm" className="text-xs">Features</Button>
                        </a>
                        <a href="/about">
                            <Button variant="ghost" size="sm" className="text-xs">About</Button>
                        </a>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Form */}
                <FinancialForm
                    formData={formData}
                    onValueChange={handleChange}
                    onInputChange={handleInputChange}
                    onLoadPreset={handleLoadPreset}
                    presets={PRESETS}
                />

                {/* Actions Row: Scenario + Generate + Save + Reset */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <ScenarioSelector
                        selectedScenario={selectedScenario}
                        onScenarioChange={setSelectedScenario}
                    />
                    <div className="flex gap-2">
                        <Button size="lg" onClick={handleGenerate} disabled={isLoading}>
                            <Calculator className="h-4 w-4 mr-2" />
                            {isLoading ? 'Calculating...' : 'Generate'}
                        </Button>
                        {tableData.length > 0 && (
                            <>
                                {showSaveInput ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={modelName}
                                            onChange={e => setModelName(e.target.value)}
                                            placeholder="Model name..."
                                            className="h-10 px-3 rounded-md border text-sm w-32"
                                            onKeyDown={e => { if (e.key === 'Enter') handleSaveModel() }}
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={handleSaveModel}>Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)}>✕</Button>
                                    </div>
                                ) : (
                                    <Button variant="outline" size="lg" onClick={() => setShowSaveInput(true)}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Model
                                    </Button>
                                )}
                            </>
                        )}
                        <Button variant="outline" size="lg" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Model Comparison (when ≥ 1 saved) */}
                {savedModels.length >= 1 && (
                    <ModelComparison
                        models={savedModels}
                        onRemoveModel={handleRemoveModel}
                        onLoadModel={handleLoadModel}
                    />
                )}

                {/* Results — only render when data exists */}
                {comparisonData && (
                    <ComparisonSummary
                        comparisonData={comparisonData}
                        smithData={tableData}
                        noSmithData={noSmithData}
                        allocationPlan={allocationPlan}
                        aStarOptimal={aStarOptimal}
                        explorerResults={explorerResults}
                        robustnessResults={robustnessResults}
                        selectedRouteIndex={selectedRouteIndex}
                        onSelectRoute={setSelectedRouteIndex}
                    />
                )}

                {tableData.length > 0 && (
                    <FlowChart
                        smithData={
                            selectedRouteIndex !== null && explorerResults?.topRoutes?.[selectedRouteIndex]?.yearByYearData
                                ? explorerResults.topRoutes[selectedRouteIndex].yearByYearData
                                : aStarOptimal?.yearByYearData && selectedRouteIndex === 'astar'
                                    ? aStarOptimal.yearByYearData
                                    : tableData
                        }
                        noSmithData={noSmithData}
                        optimizationMode={currentMode}
                    />
                )}

                {tableData.length > 0 && (
                    <DataTable
                        tableData={
                            selectedRouteIndex !== null && explorerResults?.topRoutes?.[selectedRouteIndex]?.yearByYearData
                                ? explorerResults.topRoutes[selectedRouteIndex].yearByYearData
                                : tableData
                        }
                        onRowClick={handleRowClick}
                        optimizationMode={currentMode}
                        selectedRouteName={
                            selectedRouteIndex !== null && explorerResults?.topRoutes?.[selectedRouteIndex]
                                ? `Route #${selectedRouteIndex + 1}`
                                : null
                        }
                    />
                )}

                {dialogOpen && (
                    <YearDetailsDialog
                        yearData={selectedYear}
                        open={dialogOpen}
                        onOpenChange={handleDialogClose}
                        onNavigate={handleYearNavigate}
                        totalYears={30}
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t mt-12 py-6 text-center text-xs text-muted-foreground">
                <p>Smith Manoeuvre Simulator — For educational purposes only. Consult a financial advisor.</p>
            </footer>
        </div>
    )
}