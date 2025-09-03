export function computeProfit(solOut: number, principal: number, fees: number): { profitLamports: number } {
  const profit = solOut - principal - fees;
  return { profitLamports: profit > 0 ? profit : 0 };
}
