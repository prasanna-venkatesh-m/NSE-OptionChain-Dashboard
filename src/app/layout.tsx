import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { OptionChainProvider } from "../context/DataContext";
import NavbarControls from "../components/navbar/NavbarControls";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NSE REAL-TIME | Option Chain",
  description: "Advanced NSE Data Visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#020617] text-slate-200">
        <OptionChainProvider>
        {/* --- Premium Topbar --- */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            
            {/* Logo/Title Section */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full group-hover:scale-y-110 transition-transform" />
                <h1 className="text-2xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500">
                  NSE REAL-TIME
                </h1>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link 
                  href="/" 
                  className="px-4 py-2 text-sm font-medium transition-all hover:text-white hover:bg-slate-800/50 rounded-lg text-slate-400"
                >
                  Table
                </Link>
                <Link 
                  href="/chart" 
                  className="px-4 py-2 text-sm font-medium transition-all hover:text-white hover:bg-slate-800/50 rounded-lg text-slate-400"
                >
                  Chart
                </Link>
              </nav>

              <NavbarControls />
            </div>

            {/* Right Side Status (Optional Detail) */}
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Market Live</span>
               </div>
            </div>

          </div>
        </header>

        {/* --- Main Content Area --- */}
        <main className="flex-1 relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/10 blur-[120px] pointer-events-none -z-10" />
          
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
        </OptionChainProvider>
      </body>
    </html>
  );
}