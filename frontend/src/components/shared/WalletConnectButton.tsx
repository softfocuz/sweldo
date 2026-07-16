import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { connectFreighter, isFreighterAvailable } from "@/lib/stellar";
import { truncateAddress } from "@/lib/format";

interface WalletConnectButtonProps {
  address: string | null;
  onConnected: (address: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline";
}

export function WalletConnectButton({
  address,
  onConnected,
  size = "md",
  variant = "primary"
}: WalletConnectButtonProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setConnecting(true);
    try {
      const available = await isFreighterAvailable();
      if (!available) {
        setError("Install the Freighter wallet extension to continue");
        return;
      }
      const publicKey = await connectFreighter();
      onConnected(publicKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect wallet");
    } finally {
      setConnecting(false);
    }
  }

  if (address) {
    return (
      <Button variant="outline" size={size} className="font-mono">
        {truncateAddress(address)}
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant={variant} size={size} onClick={handleConnect} disabled={connecting}>
        {connecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
