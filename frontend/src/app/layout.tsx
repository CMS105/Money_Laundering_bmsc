import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@xyflow/react/dist/style.css';
import "./globals.css";
import { CurrencyProvider } from "../context/CurrencyContext";
import { AuthProvider } from "../context/AuthContext";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LaunderLens — Institutional Financial Crime Intelligence Platform",
  description: "Enterprise Graph Data Science, Temporal Network Analytics & FinCEN Form 111 Forensics modeled after Linear & Stripe Radar",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full flex flex-col antialiased bg-[#09090B] text-[#FAFAFA] selection:bg-white/20 selection:text-white font-sans">
        <AuthProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
