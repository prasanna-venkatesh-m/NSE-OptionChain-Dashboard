"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getOptionChainData } from "../services/getOptionChain.api";

interface OptionChainContextType {
  data: any;
  loading: boolean;
  countdown: number;
  symbol: string;
  expiry: string;
  setSymbol: (s: string) => void;
  setExpiry: (e: string) => void;
  totals: { ceOI: number; peOI: number; ceVol: number; peVol: number };
  pcr: string;
}

const OptionChainContext = createContext<OptionChainContextType | undefined>(undefined);

// Helper function to check if Indian Market is currently open
const isMarketOpen = () => {
  const now = new Date();
  // Convert current time to IST
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = istTime.getHours();
  
  const isWeekday = day > 0 && day < 6;
  const isWorkingHours = hours >= 9 && hours < 16;

  return isWeekday && isWorkingHours;
};

export function OptionChainProvider({ children }: { children: React.ReactNode }) {
  const [symbol, setSymbol] = useState("NIFTY");
  const [expiry, setExpiry] = useState("12-May-2026");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(35);

  const updateData = async () => {
    try {
      setLoading(true);
      const result = await getOptionChainData(symbol, expiry);
      setData(result);
      setLoading(false);
      setCountdown(35);
    } catch (err) {
      console.error("Fetch failed", err);
      setLoading(false);
    }
  };

  // Effect for initial load and polling logic
  useEffect(() => {
    // 1. Initial Fetch: Always run once on mount to get the last available data
    updateData();

    // 2. Set up the 35s polling interval
    const timer = setInterval(() => {
      if (isMarketOpen()) {
        updateData();
      } else {
        console.log("Market is closed. API refresh skipped.");
      }
    }, 35000);

    return () => clearInterval(timer);
  }, [symbol, expiry]);

  // Effect for the visual countdown timer
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        // If market is closed, don't tick down; keep it at the reset value
        if (!isMarketOpen()) return 35;
        return prev > 0 ? prev - 1 : 35;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, []);

  const processedMetrics = useMemo(() => {
    const optionData = data?.filtered?.data || [];
    const totals = optionData.reduce(
      (acc: any, curr: any) => {
        acc.ceOI += curr.CE?.openInterest || 0;
        acc.peOI += curr.PE?.openInterest || 0;
        acc.ceVol += curr.CE?.totalTradedVolume || 0;
        acc.peVol += curr.PE?.totalTradedVolume || 0;
        return acc;
      },
      { ceOI: 0, peOI: 0, ceVol: 0, peVol: 0 }
    );
    const pcr = totals.ceOI > 0 ? (totals.peOI / totals.ceOI).toFixed(2) : "0.00";
    return { totals, pcr };
  }, [data]);

  return (
    <OptionChainContext.Provider
      value={{
        data,
        loading,
        countdown,
        symbol,
        expiry,
        setSymbol,
        setExpiry,
        ...processedMetrics,
      }}
    >
      {children}
    </OptionChainContext.Provider>
  );
}

export const useOptionChain = () => {
  const context = useContext(OptionChainContext);
  if (!context) throw new Error("useOptionChain must be used within Provider");
  return context;
};