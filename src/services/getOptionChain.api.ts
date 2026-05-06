export const getOptionChainData = async (symbol: string = 'NIFTY', expiry: string = '12-May-2026') => {
  const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

  // Construct the URL with dynamic parameters
  const url = `${baseUrl}/api/nse?symbol=${symbol}&expiry=${expiry}&t=${new Date().getTime()}`;

  const res = await fetch(url, {
    cache: 'no-store', // Extra insurance for fresh data
  });

  if (!res.ok) throw new Error('Network response was not ok');

  return res.json();
};