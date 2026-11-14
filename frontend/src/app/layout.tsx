import type { Metadata } from "next";
import '@xyflow/react/dist/style.css';
import "./globals.css";
import { CurrencyProvider } from "../context/CurrencyContext";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "LaunderyLens — Multi-Source Financial Crime Intelligence & AML Platform",
  description: "Enterprise Graph Data Science, Temporal Network Analytics & FinCEN Form 111 Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#0B1220] text-[#E5E7EB]">
      <body className="h-full flex flex-col antialiased selection:bg-[#38BDF8]/20 selection:text-[#38BDF8]">
        <AuthProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
