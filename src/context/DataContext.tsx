"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getOptionChainData } from "../services/getOptionChain.api";

interface OptionChainContextType {
  data: any;
  loading: boolean;
  countdown: number;
  totals: { ceOI: number; peOI: number; ceVol: number; peVol: number };
  pcr: string;
}

const OptionChainContext = createContext<OptionChainContextType | undefined>(undefined);

export function OptionChainProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(35);

  const updateData = async () => {
    try {
      const result = await getOptionChainData();
      setData(result);
      setLoading(false);
      setCountdown(35);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    updateData();
    const timer = setInterval(updateData, 35000);
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 35));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(countdownTimer);
    };
  }, []);

  // useMemo prevents heavy calculations on every countdown tick
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
    return { totals, pcr, optionData };
  }, [data]);

  return (
    <OptionChainContext.Provider value={{ data, loading, countdown, ...processedMetrics }}>
      {children}
    </OptionChainContext.Provider>
  );
}

export const useOptionChain = () => {
  const context = useContext(OptionChainContext);
  if (!context) throw new Error("useOptionChain must be used within Provider");
  return context;
};