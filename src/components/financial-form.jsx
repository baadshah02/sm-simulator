"use client"

import { FORM_FIELDS } from "@/lib/formFields"
import { PROVINCES } from "@/lib/provinceData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Info } from "lucide-react"

const SECTION_ICONS = {
    'Mortgage Settings': '🏠',
    'HELOC & Tax Settings': '🏦',
    'Investment Returns': '📈',
    'TFSA Settings': '💎',
    'RRSP Settings': '🛡️',
    'Optimization Settings': '🧠',
}

const provinceOptions = PROVINCES.map(p => ({ value: p.value, label: p.label }))

function FieldTooltip({ content }) {
    if (!content) return null
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function FormField({ field, value, onValueChange, onInputChange }) {
    const id = `field-${field.name}`

    if (field.type === 'select') {
        const options = field.options === 'provinces' ? provinceOptions : field.options
        return (
            <div className="space-y-2">
                <Label htmlFor={id} className="flex items-center text-sm">
                    {field.label}
                    <FieldTooltip content={field.tooltipContent} />
                </Label>
                <Select value={value?.toString()} onValueChange={(val) => onValueChange(field.name, val)}>
                    <SelectTrigger id={id}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {options?.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="flex items-center text-sm">
                {field.label}
                <FieldTooltip content={field.tooltipContent} />
            </Label>
            <Input
                id={id}
                type={field.type || "number"}
                step={field.step}
                name={field.name}
                value={value}
                onChange={onInputChange}
            />
        </div>
    )
}

export default function FinancialForm({ formData, onValueChange, onInputChange, onLoadPreset, presets, onSavePreset, customPresetIds = [], onRemovePreset }) {
    const optimizationMode = formData.optimizationMode || 'classic'
    const isSmartMode = optimizationMode !== 'classic'

    return (
        <div className="space-y-3">
            {/* Preset Buttons */}
            {presets && presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-muted-foreground self-center mr-1">Presets:</span>
                    {presets.map(preset => {
                        const isCustom = customPresetIds.includes(preset.id);
                        return (
                            <span key={preset.id} className="relative group inline-flex">
                                <button
                                    onClick={() => onLoadPreset(preset.formData)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium hover:bg-muted transition-colors ${isCustom ? 'border-amber-300 bg-amber-50/50' : ''}`}
                                    title={preset.description}
                                >
                                    <span>{preset.icon}</span>
                                    {preset.name}
                                </button>
                                {isCustom && onRemovePreset && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemovePreset(preset.id); }}
                                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove preset"
                                    >
                                        ✕
                                    </button>
                                )}
                            </span>
                        );
                    })}
                    {onSavePreset && (
                        <button
                            onClick={onSavePreset}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-emerald-300 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Save current settings as a preset"
                        >
                            <span>+</span>
                            Save as Preset
                        </button>
                    )}
                </div>
            )}

            {/* Form Accordion */}
            <Accordion type="multiple" defaultValue={['Mortgage Settings', 'HELOC & Tax Settings']} className="space-y-3">
                {FORM_FIELDS.map((section) => {
                    // For smartOnly sections, always show the optimizationMode selector
                    // but hide the other fields unless in smart/explorer mode
                    const isSectionSmartOnly = section.smartOnly === true
                    const fieldsToRender = isSectionSmartOnly
                        ? section.fields.filter(f => f.name === 'optimizationMode' || isSmartMode)
                        : section.fields

                    return (
                        <AccordionItem key={section.section} value={section.section} className="border rounded-lg px-1">
                            <Card className="border-0 shadow-none">
                                <AccordionTrigger className="px-5 py-3 hover:no-underline">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span>{SECTION_ICONS[section.section] || '⚙️'}</span>
                                        {section.section}
                                        {isSectionSmartOnly && isSmartMode && (
                                            <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-2">
                                                {optimizationMode === 'optimizer' ? '🎯 Active' : optimizationMode === 'smart' ? '🧠 Active' : '🔍 Active'}
                                            </span>
                                        )}
                                    </CardTitle>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <CardContent className="pt-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {fieldsToRender.map((field) => (
                                                <FormField
                                                    key={field.name}
                                                    field={field}
                                                    value={formData[field.name]}
                                                    onValueChange={onValueChange}
                                                    onInputChange={onInputChange}
                                                />
                                            ))}
                                        </div>
                                        {isSectionSmartOnly && !isSmartMode && (
                                            <p className="text-xs text-muted-foreground mt-3 italic">
                                                Select Optimizer to configure advanced optimization settings.
                                            </p>
                                        )}
                                    </CardContent>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    )
}