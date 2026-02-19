"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, ArrowLeft } from "lucide-react"

/**
 * Shared header component used across all pages for consistency.
 * @param {string} subtitle - Text shown below the title
 * @param {string} currentPage - 'home' | 'features' | 'about' — highlights current nav
 * @param {React.ReactNode} extraBadge - Optional badge (e.g., optimizer mode indicator)
 */
export default function PageHeader({ subtitle = "Canadian Wealth Strategy Analysis", currentPage = "home", extraBadge = null }) {
    const isSubPage = currentPage !== 'home';

    return (
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Smith Manoeuvre Simulator</h1>
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        </div>
                    </a>
                </div>
                <div className="flex items-center gap-2">
                    {extraBadge}
                    <Badge variant="outline" className="hidden sm:flex">🇨🇦 Canada</Badge>
                    <a href="/features">
                        <Button
                            variant={currentPage === 'features' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="text-xs"
                        >
                            Features
                        </Button>
                    </a>
                    <a href="/about">
                        <Button
                            variant={currentPage === 'about' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="text-xs"
                        >
                            About
                        </Button>
                    </a>
                    {isSubPage && (
                        <a href="/">
                            <Button variant="outline" size="sm" className="text-xs gap-1">
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Simulator
                            </Button>
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
}