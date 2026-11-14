import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from 'next/font/google';
import '@xyflow/react/dist/style.css';
import "./globals.css";
import { CurrencyProvider } from "../context/CurrencyContext";
import { AuthProvider } from "../context/AuthContext";

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "LaunderyLens — Financial Crime Intelligence & Anti-Money Laundering Platform",
  description: "Enterprise Graph Data Science, Temporal Network Analytics & FinCEN Form 111 Intelligence",
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
    <html lang="en" className={`h-full ${manrope.variable} ${ibmPlexMono.variable}`}>
      <body className="h-full flex flex-col antialiased bg-[#172B35] text-[#E8E5DA] selection:bg-[#75A99A]/30 selection:text-[#E8E5DA]">
        <AuthProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
