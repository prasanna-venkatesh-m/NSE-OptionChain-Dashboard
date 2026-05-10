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

/**
 * Checks if the current time is within Indian Market Hours
 * Days: Monday (1) to Friday (5)
 * Time: 09:00 to 16:00 IST
 */
const isMarketOpen = () => {
  const now = new Date();
  // Convert current system time to Indian Standard Time (IST)
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  const day = istTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();

  // 1. Check if it's a Weekday (Mon-Fri)
  const isWeekday = day >= 1 && day <= 5;

  // 2. Check if hours are between 09:00 and 15:59
  // This covers the entire range from 9:00:00 AM to 3:59:59 PM
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
      setCountdown(35); // Reset countdown after successful fetch
    } catch (err) {
      console.error("Fetch failed", err);
      setLoading(false);
    }
  };

  // Effect for Fetching Data (Polling)
  useEffect(() => {
    // Initial load: fetch once regardless of time so the UI isn't empty
    updateData();

    const timer = setInterval(() => {
      if (isMarketOpen()) {
        updateData();
      } else {
        console.log("Market Closed (Mon-Fri 9am-4pm only). Refresh paused.");
      }
    }, 35000); // 35 seconds

    return () => clearInterval(timer);
  }, [symbol, expiry]);

  // Effect for the Visual Countdown UI
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        // If market is closed, freeze the countdown at 35
        if (!isMarketOpen()) return 35;
        // Otherwise tick down
        return prev > 0 ? prev - 1 : 35;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, []);

  // Data Processing (OI Totals and PCR)
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
    
    const pcrValue = totals.ceOI > 0 ? (totals.peOI / totals.ceOI).toFixed(2) : "0.00";
    
    return { totals, pcr: pcrValue };
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
  if (!context) {
    throw new Error("useOptionChain must be used within an OptionChainProvider");
  }
  return context;
};