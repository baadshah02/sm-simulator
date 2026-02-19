"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp, DollarSign, PiggyBank, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">About Smith Manoeuvre Simulator</h1>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Simulator
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                {/* Intro Section */}
                <section className="space-y-4 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-emerald-950 dark:text-emerald-50">
                        Convert Your Mortgage Interest into Tax Deductions
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        The Smith Manoeuvre is a financial strategy for Canadian homeowners that allows you to make your mortgage interest tax-deductible while building an investment portfolio.
                    </p>
                </section>

                {/* The Concept Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-red-500" />
                                The Problem
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Your standard mortgage interest is <strong>not tax-deductible</strong>. It is paid with after-tax dollars, making it the most expensive debt you own.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                The Solution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                By re-borrowing your equity to invest, you convert that "bad debt" into "good debt", where the interest <strong>is tax-deductible</strong>.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Step-by-Step Example */}
                <section className="bg-muted/30 rounded-xl p-8 border">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <PiggyBank className="h-6 w-6 text-emerald-600" />
                        A Simple Example
                    </h3>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">1</div>
                            <div>
                                <h4 className="font-semibold text-lg">Pay Down Principal</h4>
                                <p className="text-muted-foreground">You pay <strong>$1,000</strong> towards your regular mortgage principal.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">2</div>
                            <div>
                                <h4 className="font-semibold text-lg">Re-borrow Immediately</h4>
                                <p className="text-muted-foreground">Your Readvanceable Mortgage (HELOC) limit automatically increases by <strong>$1,000</strong>. You borrow this back.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">3</div>
                            <div>
                                <h4 className="font-semibold text-lg">Invest</h4>
                                <p className="text-muted-foreground">You invest that <strong>$1,000</strong> into dividend-paying Canadian stocks or funds.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">4</div>
                            <div>
                                <h4 className="font-semibold text-lg">Claim Tax Refund</h4>
                                <p className="text-muted-foreground">Come tax time, the interest you paid on the <strong>$1,000</strong> HELOC loan is tax-deductible. You get a tax refund.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">5</div>
                            <div>
                                <h4 className="font-semibold text-lg">Repeat & Compound</h4>
                                <p className="text-muted-foreground">You use the tax refund (and dividends) to pay down your mortgage even faster, repeating the cycle.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Official Resources */}
                <section className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-8 border border-emerald-100 dark:border-emerald-900">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-emerald-600" />
                        Official Resources
                    </h3>
                    <ul className="space-y-3">
                        <li>
                            <a
                                href="https://smithmanoeuvre.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                            >
                                The Smith Manoeuvre™ Official Website
                                <ArrowLeft className="h-3 w-3 rotate-180" />
                            </a>
                            <p className="text-sm text-muted-foreground mt-1">
                                The official source by Robinson Smith. Find certified professionals and the original book "Master Your Mortgage for Financial Freedom".
                            </p>
                        </li>
                        <li>
                            <a
                                href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22100-carrying-charges-interest-expenses.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                            >
                                CRA: Line 22100 - Carrying charges and interest expenses
                                <ArrowLeft className="h-3 w-3 rotate-180" />
                            </a>
                            <p className="text-sm text-muted-foreground mt-1">
                                Official Canada Revenue Agency details on deducting interest expenses for investment income.
                            </p>
                        </li>
                    </ul>
                </section>

                {/* Call to Action */}
                <div className="text-center py-8">
                    <p className="text-xl font-medium mb-6">
                        The result? You pay off your mortgage years earlier and build a massive investment portfolio simultaneously.
                    </p>
                    <Link href="/">
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <TrendingUp className="h-5 w-5 mr-2" />
                            Start Simulating
                        </Button>
                    </Link>
                </div>

            </main>
        </div>
    )
}
