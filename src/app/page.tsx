"use client";

import { useEffect, useState } from "react";
import { getOptionChainData } from "../services/getOptionChain.api";
import OptionChainTable from "../components/common/OptionChainTableComponent";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(35);

  const updateData = async () => {
    try {
      const result = await getOptionChainData();
      setData(result);
      setLoading(false);
      setCountdown(35); // Reset timer after successful fetch
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    // 1. Initial fetch on load
    updateData();

    // 2. Set up the 35-second interval
    const timer = setInterval(() => {
      updateData();
    }, 35000);

    // 3. Set up a 1-second visual countdown
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 35));
    }, 1000);

    // Clean up timers if the user leaves the page
    return () => {
      clearInterval(timer);
      clearInterval(countdownTimer);
    };
  }, []);

  if (loading) return <div className="p-10 text-white">Initializing NSE Feed...</div>;

  const optionData = data?.filtered?.data || [];

  // Calculate all totals inside your component
  const totals = optionData.reduce((acc: any, curr: any) => {
    acc.ceOI += curr.CE?.openInterest || 0;
    acc.peOI += curr.PE?.openInterest || 0;
    acc.ceVol += curr.CE?.totalTradedVolume || 0;
    acc.peVol += curr.PE?.totalTradedVolume || 0;
    return acc;
  }, { ceOI: 0, peOI: 0, ceVol: 0, peVol: 0 });

  const pcr = totals.ceOI > 0 ? (totals.peOI / totals.ceOI).toFixed(2) : "0.00";

  // --- JSX UI SECTION ---
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      {/* Header with Timer */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
          NIFTY REAL-TIME
        </h1>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-mono text-zinc-400">REFRESH IN {countdown}S</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Call Side Summary */}
        <div className="bg-zinc-900 border-t-2 border-green-500 p-5 rounded-xl shadow-lg">
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Calls (CE) Totals</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">OI:</span>
              <span className="text-xl font-mono text-green-400 font-bold">{totals.ceOI.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-1">
              <span className="text-zinc-400 text-sm">Vol:</span>
              <span className="text-lg font-mono text-zinc-300">{totals.ceVol.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Market Sentiment (PCR) */}
        <div className="bg-zinc-900 border-t-2 border-yellow-500 p-5 rounded-xl shadow-lg flex flex-col items-center justify-center">
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Sentiment (PCR)</p>
          <span className={`text-5xl font-black font-mono ${Number(pcr) > 1 ? 'text-green-500' : 'text-red-500'}`}>
            {pcr}
          </span>
          <p className="text-[10px] text-zinc-500 mt-2 tracking-tighter">
            {Number(pcr) > 1 ? "PE WRITING > CE WRITING (BULLISH)" : "CE WRITING > PE WRITING (BEARISH)"}
          </p>
        </div>

        {/* Put Side Summary */}
        <div className="bg-zinc-900 border-t-2 border-red-500 p-5 rounded-xl shadow-lg">
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Puts (PE) Totals</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">OI:</span>
              <span className="text-xl font-mono text-red-400 font-bold">{totals.peOI.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-1">
              <span className="text-zinc-400 text-sm">Vol:</span>
              <span className="text-lg font-mono text-zinc-300">{totals.peVol.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Your Table Component */}
      <OptionChainTable data={optionData} />
    </main>
  );
}