"use client";

import OptionChainTable from "../components/common/OptionChainTableComponent";
import { useOptionChain } from "../context/DataContext";

export default function Home() {
  const { data, loading, countdown, totals, pcr } = useOptionChain();

  // Show a sleek loading state that matches your dark theme
  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="animate-pulse font-mono text-sm tracking-widest text-slate-400">
          ESTABLISHING NSE DATA STREAM...
        </p>
      </div>
    );
  }

  const optionData = data?.filtered?.data || [];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* --- Header Section --- */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-white to-gray-500 bg-clip-text text-3xl font-extrabold tracking-tighter text-transparent uppercase">
            Nifty Real-Time
          </h1>
          <p className="text-[10px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
            Live Option Chain Metrics
          </p>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px] tracking-widest text-zinc-400">
            SYNC IN {countdown}S
          </span>
        </div>
      </div>

      {/* --- Summary Cards --- */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Call Side Summary */}
        <div className="rounded-xl border-t-2 border-emerald-500 bg-zinc-900 p-5 shadow-2xl transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Total Calls (CE)
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs text-zinc-400">Open Interest</span>
              <span className="font-mono text-2xl font-bold text-emerald-400">
                {totals.ceOI.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-end border-t border-zinc-800 pt-2">
              <span className="text-xs text-zinc-400">Volume</span>
              <span className="font-mono text-lg text-zinc-300">
                {totals.ceVol.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* PCR Sentiment Card */}
        <div className="flex flex-col items-center justify-center rounded-xl border-t-2 border-blue-500 bg-zinc-900 p-5 shadow-2xl">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Sentiment (PCR)
          </p>
          <span className={`font-mono text-6xl font-black tracking-tighter ${
            Number(pcr) > 1 ? "text-emerald-500" : "text-rose-500"
          }`}>
            {pcr}
          </span>
          <div className={`mt-2 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter ${
            Number(pcr) > 1 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          }`}>
            {Number(pcr) > 1 ? "Bullish (PE Writing)" : "Bearish (CE Writing)"}
          </div>
        </div>

        {/* Put Side Summary */}
        <div className="rounded-xl border-t-2 border-rose-500 bg-zinc-900 p-5 shadow-2xl transition-transform hover:scale-[1.02]">
          <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Total Puts (PE)
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs text-zinc-400">Open Interest</span>
              <span className="font-mono text-2xl font-bold text-rose-400">
                {totals.peOI.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-end border-t border-zinc-800 pt-2">
              <span className="text-xs text-zinc-400">Volume</span>
              <span className="font-mono text-lg text-zinc-300">
                {totals.peVol.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* --- Main Table Section --- */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
        <OptionChainTable data={optionData} />
      </div>
    </main>
  );
}