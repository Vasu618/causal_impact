import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://causal-impact.example.com"),
  title: "Causal Impact Platform — Bayesian Causal Inference for A/B Testing",
  description:
    "Upload time-series data, pick an intervention date, and let Bayesian Structural Time-Series reveal whether your campaign actually caused the lift — or whether it was just seasonality.",
  keywords: [
    "causal inference",
    "CausalImpact",
    "Bayesian Structural Time-Series",
    "A/B testing",
    "marketing analytics",
    "counterfactual",
  ],
  authors: [{ name: "Causal Impact Platform" }],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32x32.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Causal Impact Platform",
    description: "Prove causation, not just correlation. Bayesian causal inference for marketing analytics.",
    type: "website",
    images: [{ url: "/og-image.png", width: 512, height: 512, alt: "Causal Impact logo" }],
  },
  twitter: {
    card: "summary",
    title: "Causal Impact Platform",
    description: "Prove causation, not just correlation. Bayesian causal inference for marketing analytics.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
