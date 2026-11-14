import type { Metadata } from "next";
import '@xyflow/react/dist/style.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "BUILD BEYOND'26 — PS 2.1: Graph-Based Detection of Layered Money Laundering",
  description: "Temporal Graph Engine AML Detection & Explainable AI Narrative Workbench",
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
