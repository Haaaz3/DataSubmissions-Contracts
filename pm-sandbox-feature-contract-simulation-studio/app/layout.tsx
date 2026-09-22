import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import AppShell from "@/components/AppShell";
import { FeatureFlagsProvider } from "@/components/FeatureFlagsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import FeatureControls from "@/components/FeatureControls";
import FooterNav from "@/components/FooterNav";

export const metadata: Metadata = {
  title: "Oracle Health AI Data Platform",
  description: "Oracle Health AI Data Platform — portfolio intelligence and performance insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased"> 
        <ThemeProvider>
          <FeatureFlagsProvider>
            <NavBar />
            <AppShell>{children}</AppShell>

            <FeatureControls />
            <FooterNav />
          </FeatureFlagsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
