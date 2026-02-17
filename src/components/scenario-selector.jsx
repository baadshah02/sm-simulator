"use client"

import { SCENARIOS } from "@/lib/scenarios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function ScenarioSelector({ selectedScenario, onScenarioChange }) {
    const current = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0]

    return (
        <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap">Risk Scenario:</label>
            <Select value={selectedScenario} onValueChange={onScenarioChange}>
                <SelectTrigger className="w-[220px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {SCENARIOS.map(scenario => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                            <div className="flex items-center gap-2">
                                <span>{scenario.icon}</span>
                                <span>{scenario.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {current.id !== 'base' && (
                <Badge variant="warning" className="text-xs whitespace-nowrap">
                    {current.description}
                </Badge>
            )}
        </div>
    )
}
