import type { Metadata } from "next";
import '@xyflow/react/dist/style.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "LaunderGraph AML — Graph Data Science & Anti-Money Laundering Platform",
  description: "Temporal Graph Analytics, Machine Learning & FinCEN SAR Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <body className="h-full flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
