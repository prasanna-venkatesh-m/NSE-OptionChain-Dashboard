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
    ReferenceLine,
    Label,
} from "recharts";

export default function ChartPage() {
    const { data, loading, countdown } = useOptionChain();

    const spotPrice = data?.records?.underlyingValue || 0;
    // New State Management
    const [centerStrike, setCenterStrike] = useState<number>(0);
    const [strikeOffset, setStrikeOffset] = useState<number>(1000); // The +/- range

    // 1. Extract all available strikes
    const strikePrices = useMemo(() => {
        return data?.filtered?.data?.map((item: any) => item.strikePrice) || [];
    }, [data?.filtered?.data]);

    // 2. AUTO-INITIALIZE: Pick the middle strike as default center
    useEffect(() => {
        // Only set if we have strikes, a spot price, and centerStrike hasn't been set yet
        if (strikePrices.length > 0 && spotPrice > 0 && centerStrike === 0) {
            // const initialNearest = strikePrices.reduce((prev, curr) =>
            //     Math.abs(curr - spotPrice) < Math.abs(prev - spotPrice) ? curr : prev
            // );
            setCenterStrike(spotPrice);
        }
    }, [strikePrices, spotPrice, centerStrike]);

    const nearestStrike = useMemo(() => {
        if (!strikePrices.length || !spotPrice) return null;

        return strikePrices.reduce((prev: number, curr: number) =>
            Math.abs(curr - spotPrice) < Math.abs(prev - spotPrice) ? curr : prev
        );
    }, [strikePrices, spotPrice]);

    // 3. REFRESH ENGINE: Calculates bounds based on Center + Offset
    const filteredChartData = useMemo(() => {
        const rawData = data?.filtered?.data;
        if (!rawData || rawData.length === 0) return [];

        const lowerBound = centerStrike - strikeOffset;
        const upperBound = centerStrike + strikeOffset;

        return rawData
            .filter((item: any) =>
                item.strikePrice >= lowerBound &&
                item.strikePrice <= upperBound
            )
            .map((item: any) => ({
                strike: item.strikePrice,
                callOI: item.CE?.openInterest || 0,
                putOI: item.PE?.openInterest || 0,
                callChg: item.CE?.changeinOpenInterest || 0,
                putChg: item.PE?.changeinOpenInterest || 0,
            }));
    }, [data, centerStrike, strikeOffset]);

    if (loading) return <div className="p-10 text-white font-mono text-center">SYNCING WITH NSE...</div>;

    return (
        <main className="min-h-screen bg-black p-6 text-white">
            {/* Control Panel */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-6">

                    {/* Center Strike Selector */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Center Strike</span>
                        <select
                            value={centerStrike}
                            onChange={(e) => setCenterStrike(Number(e.target.value))}
                            className="block w-40 rounded-lg border border-zinc-700 bg-black p-2 text-sm outline-none focus:ring-1 ring-blue-500"
                        >
                            {strikePrices.map((s: number) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Range Offset Selector */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Range (±)</span>
                        <select
                            value={strikeOffset}
                            onChange={(e) => setStrikeOffset(Number(e.target.value))}
                            className="block w-32 rounded-lg border border-zinc-700 bg-black p-2 text-sm outline-none focus:ring-1 ring-blue-500"
                        >
                            {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000].map((range) => (
                                <option key={range} value={range}>{range}</option>
                            ))}
                        </select>
                    </div>

                    {/* Displaying the calculated window */}
                    <div className="hidden md:block pb-2">
                        <p className="text-xs text-zinc-500 italic">
                            Viewing: <span className="text-blue-400">{centerStrike - strikeOffset}</span>
                            <span className="mx-2 text-zinc-700">—</span>
                            <span className="text-emerald-400">{centerStrike + strikeOffset}</span>
                        </p>
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
                <ResponsiveContainer width="100%" height="100%" key={data?.records?.timestamp || 'initial'}>
                    <BarChart
                        data={filteredChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        /* 1. This creates the gap between the different strike price groups */
                        barCategoryGap="20%"
                        /* 2. This creates a tiny sliver of space between the Call and Put bars themselves */
                        barGap={2}
                    >
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
                            cursor={{ fill: '#ffffff', opacity: 0.05 }}
                            contentStyle={{
                                backgroundColor: '#09090b',
                                border: '1px solid #27272a',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            height={50}
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '10px', paddingRight: '20px' }}
                        />

                        {/* CALL OI Bar */}
                        <Bar
                            dataKey="callOI"
                            name="CALL OI"
                            fill="#f43f5e"
                            // radius={[4, 4, 0, 0]}
                            // Removing hardcoded barSize allows barCategoryGap to work dynamically
                            animationDuration={800}
                        />

                        {/* PUT OI Bar */}
                        <Bar
                            dataKey="putOI"
                            name="PUT OI"
                            fill="#10b981"
                            // radius={[4, 4, 0, 0]}
                            animationDuration={800}
                        />

                        {nearestStrike && (
                            <ReferenceLine
                                x={nearestStrike} // Changed from spotPrice to nearestStrike
                                stroke="#60a5fa"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                label={{
                                    value: `SPOT: ${spotPrice}`, // We still show the actual spot price in the label
                                    position: "top",
                                    fill: "#60a5fa",
                                    fontSize: 12,
                                    fontWeight: "bold",
                                    dy: -15
                                }}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </main>
    );
}