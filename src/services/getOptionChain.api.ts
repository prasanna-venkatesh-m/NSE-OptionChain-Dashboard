export const getOptionChainData = async () => {
  // Check if we are on the server or the browser
  const baseUrl = typeof window !== 'undefined' 
    ? '' // Browser knows what to do
    : 'http://localhost:3000'; // Server needs the full path

//   const res = await fetch(`${baseUrl}/api/nse`);
  const res = await fetch(`${baseUrl}/api/nse?t=${new Date().getTime()}`);
  return res.json();
};
