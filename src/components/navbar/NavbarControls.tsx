"use client";

import { useOptionChain } from "@/src/context/DataContext";

export default function NavbarControls() {
  const { symbol, setSymbol, expiry, setExpiry } = useOptionChain();

  const symbols = ["NIFTY", "BANKNIFTY", "SENSEX", "FINNIFTY"];

  // Helper to format Date object or string to DD-MMM-YYYY
  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper to get today's date in YYYY-MM-DD for the input's default value
  const getTodayForInput = () => new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-center gap-3">
      {/* Symbol Dropdown */}
      <select
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg focus:ring-2 focus:ring-blue-500/50 block p-2 px-3 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
      >
        {symbols.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Date Picker */}
      <div className="relative">
        <input
          type="date"
          defaultValue={getTodayForInput()}
          onChange={(e) => {
            const formatted = formatDateForAPI(e.target.value);
            setExpiry(formatted);
          }}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg focus:ring-2 focus:ring-blue-500/50 block p-2 px-3 outline-none cursor-pointer [color-scheme:dark] hover:bg-slate-800 transition-colors"
        />
      </div>

      {/* Optional: Visual feedback of the active format */}
      <div className="hidden lg:block text-[10px] text-slate-500 font-mono bg-slate-900/50 px-2 py-2 rounded border border-slate-800">
        API: <span className="text-blue-400">{expiry}</span>
      </div>
    </div>
  );
}