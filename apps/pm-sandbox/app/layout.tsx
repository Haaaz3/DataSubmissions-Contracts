import type { Metadata } from "next";
import "./globals.css";
import UnionShell from "@/components/union/UnionShell";
import { FeatureFlagsProvider } from "@/components/FeatureFlagsProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Austin CI · Connected Product Workspace",
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
            <UnionShell>{children}</UnionShell>
          </FeatureFlagsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
