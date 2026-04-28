// src/components/OptionChainTable.tsx

export default function OptionChainTable({ data }: { data: any[] }) {
  return (
    <div className="w-full overflow-x-auto shadow-xl rounded-lg border border-gray-700 bg-gray-900 text-gray-100">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-800 text-gray-400 border-b border-gray-700">
          <tr>
            <th colSpan={4} className="px-4 py-3 text-center border-r border-gray-700 text-green-400">CALLS (CE)</th>
            <th className="px-4 py-3 text-center bg-gray-700 text-white">INFO</th>
            <th colSpan={4} className="px-4 py-3 text-center border-l border-gray-700 text-red-400">PUTS (PE)</th>
          </tr>
          <tr className="bg-gray-800/50 text-[10px]">
            <th className="px-2 py-2">OI</th>
            <th className="px-2 py-2">Vol</th>
            <th className="px-2 py-2">Chng</th>
            <th className="px-2 py-2 border-r border-gray-700">LTP</th>
            <th className="px-4 py-2 text-center">STRIKE</th>
            <th className="px-2 py-2 border-l border-gray-700">LTP</th>
            <th className="px-2 py-2">Chng</th>
            <th className="px-2 py-2">Vol</th>
            <th className="px-2 py-2">OI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 font-mono">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-800/50 transition-colors">
              {/* CE Data */}
              <td className="px-2 py-3 text-blue-400">{row.CE?.openInterest?.toLocaleString() || 0}</td>
              <td className="px-2 py-3 text-gray-400">{row.CE?.totalTradedVolume?.toLocaleString() || 0}</td>
              <td className={`px-2 py-3 ${row.CE?.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {row.CE?.change?.toFixed(1) || 0}
              </td>
              <td className="px-2 py-3 border-r border-gray-700 font-bold text-white">{row.CE?.lastPrice || 0}</td>

              {/* Strike Price */}
              <td className="px-4 py-3 text-center bg-gray-800 font-extrabold text-yellow-500">
                {row.strikePrice}
              </td>

              {/* PE Data */}
              <td className="px-2 py-3 border-l border-gray-700 font-bold text-white">{row.PE?.lastPrice || 0}</td>
              <td className={`px-2 py-3 ${row.PE?.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {row.PE?.change?.toFixed(1) || 0}
              </td>
              <td className="px-2 py-3 text-gray-400">{row.PE?.totalTradedVolume?.toLocaleString() || 0}</td>
              <td className="px-2 py-3 text-blue-400">{row.PE?.openInterest?.toLocaleString() || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}