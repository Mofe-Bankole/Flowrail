import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowRail — payout operations on Tempo",
  description:
    "Payout operations for businesses on Tempo. You define the rules once; every run is checked against them, batched into one transaction, and reconciled against a stablecoin rail.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${newsreader.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
