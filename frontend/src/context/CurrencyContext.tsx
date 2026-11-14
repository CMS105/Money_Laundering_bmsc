'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatAmount: (amountUSD: number, compact?: boolean) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const USD_TO_INR_RATE = 83.5;

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lg_currency') as Currency;
      if (saved === 'USD' || saved === 'INR') {
        setCurrencyState(saved);
      }
    } catch {
      // ignore SSR or localStorage access errors
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('lg_currency', c);
    } catch {
      // ignore
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'INR' : 'USD');
  };

  const formatAmount = (amountUSD: number, compact: boolean = false): string => {
    if (isNaN(amountUSD) || amountUSD == null) return currency === 'USD' ? '$0' : '₹0';

    if (currency === 'USD') {
      if (compact) {
        if (amountUSD >= 1000000) {
          return `$${(amountUSD / 1000000).toFixed(2)}M`;
        }
        if (amountUSD >= 1000) {
          return `$${(amountUSD / 1000).toFixed(1)}K`;
        }
        return `$${Math.round(amountUSD).toLocaleString('en-US')}`;
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(amountUSD);
    }

    // INR formatting
    const inrVal = amountUSD * USD_TO_INR_RATE;
    if (compact) {
      if (inrVal >= 10000000) {
        return `₹${(inrVal / 10000000).toFixed(2)} Cr`;
      }
      if (inrVal >= 100000) {
        return `₹${(inrVal / 100000).toFixed(2)} L`;
      }
      return `₹${Math.round(inrVal).toLocaleString('en-IN')}`;
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(inrVal));
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatAmount,
        symbol: currency === 'USD' ? '$' : '₹',
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Return safe fallback if rendered outside provider
    return {
      currency: 'USD',
      setCurrency: () => {},
      toggleCurrency: () => {},
      symbol: '$',
      formatAmount: (val: number, compact = false) => {
        if (compact) {
          if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
          if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
          return `$${Math.round(val).toLocaleString()}`;
        }
        return `$${Math.round(val).toLocaleString()}`;
      },
    };
  }
  return context;
};
