import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Extract the URL from the request
  const { searchParams } = new URL(request.url);
  
  const symbol = searchParams.get('symbol') || 'NIFTY';
  const expiry = searchParams.get('expiry') || '05-May-2026';

  try {
    const res = await fetch(
      `https://www.nseindia.com/api/option-chain-v3?type=Indices&symbol=${symbol}&expiry=${expiry}`, 
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        // It's good practice to add a cache: 'no-store' for live trading data
        cache: 'no-store' 
      }
    );

    if (!res.ok) throw new Error('NSE Response Not OK');

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}