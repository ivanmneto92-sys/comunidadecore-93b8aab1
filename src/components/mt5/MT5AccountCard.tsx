import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isOnline, formatCurrency } from "@/lib/mt5Metrics";
import type { MT5Account } from "@/hooks/useMT5Accounts";

interface Props {
  account: MT5Account;
  selected: boolean;
  onClick: () => void;
  balance?: number;
  equity?: number;
}

const statusColor: Record<string, string> = {
  online: "bg-status-success",
  idle: "bg-status-warning",
  offline: "bg-muted-foreground/40",
};
const statusLabel: Record<string, string> = {
  online: "Online",
  idle: "Ocioso",
  offline: "Offline",
};

export function MT5AccountCard({ account, selected, onClick, balance, equity }: Props) {
  const status = isOnline(account.last_seen_at);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left w-full transition-all",
        "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4",
        selected && "border-primary ring-1 ring-primary"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Login</div>
          <div className="text-lg font-bold">{account.account_login}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={cn("w-2 h-2 rounded-full", statusColor[status])} />
          <span className="text-muted-foreground">{statusLabel[status]}</span>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{account.server}</div>
      <div className="flex justify-between mt-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Saldo</div>
          <div className="font-semibold">
            {balance !== undefined ? formatCurrency(balance, account.currency) : "—"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Equity</div>
          <div className="font-semibold">
            {equity !== undefined ? formatCurrency(equity, account.currency) : "—"}
          </div>
        </div>
      </div>
    </button>
  );
}
