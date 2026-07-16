export function formatAmount(value: string | number, assetCode = "USDC") {
  const numeric = typeof value === "string" ? Number(value) : value;
  const formatted = numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${formatted} ${assetCode}`;
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function truncateAddress(address: string, size = 4) {
  if (address.length <= size * 2 + 3) return address;
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}
