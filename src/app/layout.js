import "./globals.css";

export const metadata = {
    title: "Smith Manoeuvre Simulator | Canadian Wealth Strategy",
    description: "Simulate the Smith Manoeuvre strategy for Canadian homeowners. Compare scenarios, track TFSA/RRSP growth, and optimize your mortgage for wealth building.",
    keywords: "Smith Manoeuvre, Canadian mortgage, HELOC, tax deduction, TFSA, RRSP, wealth building",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen bg-background antialiased">
                {children}
            </body>
        </html>
    );
}
