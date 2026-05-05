"use client";

import { useOptionChain } from "@/src/context/DataContext";
import { useState, useMemo, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function ChartPage() {
    const { data, loading, countdown } = useOptionChain();

    const [startStrike, setStartStrike] = useState<number>(0);
    const [endStrike, setEndStrike] = useState<number>(0);

    // 1. Extract all available strikes
    const strikePrices = useMemo(() => {
        return data?.filtered?.data?.map((item: any) => item.strikePrice) || [];
    }, [data]);

    // 2. AUTO-INITIALIZE: This only runs once when data first arrives
    useEffect(() => {
        if (strikePrices.length > 0 && startStrike === 0) {
            const mid = Math.floor(strikePrices.length / 2);
            setStartStrike(strikePrices[mid - 8]); // Show 8 strikes below
            setEndStrike(strikePrices[mid + 8]);   // Show 8 strikes above
        }
    }, [strikePrices, startStrike]);

    // 3. THE REFRESH ENGINE: This recalculates the chart data 
    // whenever 'data', 'startStrike', or 'endStrike' changes.
    const filteredChartData = useMemo(() => {
        if (!data?.filtered?.data) return [];

        return data.filtered.data
            .filter((item: any) =>
                item.strikePrice >= startStrike &&
                item.strikePrice <= endStrike
            )
            .map((item: any) => ({
                strike: item.strikePrice,
                callOI: item.CE?.openInterest || 0,
                putOI: item.PE?.openInterest || 0,
                // Adding "Change in OI" as a bonus metric for tooltips
                callChg: item.CE?.changeinOpenInterest || 0,
                putChg: item.PE?.changeinOpenInterest || 0,
            }));
    }, [data, startStrike, endStrike]); // These dependencies are the key!

    if (loading) return <div className="p-10 text-white font-mono text-center">SYNCING WITH NSE...</div>;

    return (
        <main className="min-h-screen bg-black p-6 text-white">
            {/* Control Panel */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Range Start</span>
                        <select
                            value={startStrike}
                            onChange={(e) => setStartStrike(Number(e.target.value))}
                            className="block w-32 rounded-lg border border-zinc-700 bg-black p-2 text-sm outline-none focus:ring-1 ring-blue-500"
                        >
                            {strikePrices.map((s: number) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4 text-zinc-600">→</div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Range End</span>
                        <select
                            value={endStrike}
                            onChange={(e) => setEndStrike(Number(e.target.value))}
                            className="block w-32 rounded-lg border border-zinc-700 bg-black p-2 text-sm outline-none focus:ring-1 ring-blue-500"
                        >
                            {strikePrices
                                .filter((s: number) => s >= startStrike)
                                .map((s: number) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                {/* Live Pulse Header */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Automatic Refresh</p>
                        <p className="font-mono text-xl font-bold text-blue-500 italic">{countdown}s</p>
                    </div>
                    <div className="h-10 w-px bg-zinc-800" />
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="h-[600px] w-full rounded-3xl border border-zinc-800 bg-zinc-900/10 p-4 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                        <XAxis
                            dataKey="strike"
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#71717a"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            cursor={{ fill: '#ffffff', opacity: 0.03 }}
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend verticalAlign="top" align="center" height={40} />

                        <Bar
                            dataKey="callOI"
                            name="CALL OI"
                            fill="#f43f5e"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                            animationDuration={500} // Smooth transition on refresh
                        />
                        <Bar
                            dataKey="putOI"
                            name="PUT OI"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                            animationDuration={500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </main>
    );
}