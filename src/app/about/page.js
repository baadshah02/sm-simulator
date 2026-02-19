"use client"

import { TrendingUp, DollarSign, PiggyBank, Briefcase, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/page-header"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <PageHeader subtitle="About the Smith Manoeuvre" currentPage="about" />

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
                                By re-borrowing your equity to invest, you convert that &quot;bad debt&quot; into &quot;good debt&quot;, where the interest <strong>is tax-deductible</strong>.
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
                        {[
                            { step: 1, title: "Pay Down Principal", desc: "You pay $1,000 towards your regular mortgage principal." },
                            { step: 2, title: "Re-borrow Immediately", desc: "Your Readvanceable Mortgage (HELOC) limit automatically increases by $1,000. You borrow this back." },
                            { step: 3, title: "Invest", desc: "You invest that $1,000 into dividend-paying Canadian stocks or funds." },
                            { step: 4, title: "Claim Tax Refund", desc: "Come tax time, the interest you paid on the $1,000 HELOC loan is tax-deductible. You get a tax refund." },
                            { step: 5, title: "Repeat & Compound", desc: "You use the tax refund (and dividends) to pay down your mortgage even faster, repeating the cycle." },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="flex gap-4">
                                <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200">{step}</div>
                                <div>
                                    <h4 className="font-semibold text-lg">{title}</h4>
                                    <p className="text-muted-foreground"><strong>{desc.split(' ')[0]} {desc.split(' ')[1]}</strong> {desc.split(' ').slice(2).join(' ')}</p>
                                </div>
                            </div>
                        ))}
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
                            <a href="https://smithmanoeuvre.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium">
                                The Smith Manoeuvre™ Official Website →
                            </a>
                            <p className="text-sm text-muted-foreground mt-1">
                                The official source by Robinson Smith. Find certified professionals and the original book &quot;Master Your Mortgage for Financial Freedom&quot;.
                            </p>
                        </li>
                        <li>
                            <a href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22100-carrying-charges-interest-expenses.html" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium">
                                CRA: Line 22100 - Carrying charges and interest expenses →
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
                    <a href="/">
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Start Simulating
                        </Button>
                    </a>
                </div>

            </main>
        </div>
    )
}