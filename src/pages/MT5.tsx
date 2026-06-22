import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ServerCrash } from "lucide-react";
import { useMT5Accounts } from "@/hooks/useMT5Accounts";
import { MT5AccountCard } from "@/components/mt5/MT5AccountCard";
import { MT5Dashboard } from "@/components/mt5/MT5Dashboard";
import { AddMT5AccountModal } from "@/components/mt5/AddMT5AccountModal";
import { PlanGate } from "@/components/plans/PlanGate";

export default function MT5Page() {
  const { data: accounts, isLoading } = useMT5Accounts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!selectedId && accounts && accounts.length > 0) {
      setSelectedId(accounts[0].id);
    }
  }, [accounts, selectedId]);

  const selected = accounts?.find((a) => a.id === selectedId) ?? null;

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Copy / Contas MT5</h1>
            <p className="text-sm text-muted-foreground">Monitore suas contas reais em tempo real</p>
          </div>
        </header>

        <PlanGate required="plus" featureName="Copy">
          <div className="flex justify-end">
            <Button onClick={() => setAddOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>

          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : !accounts || accounts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ServerCrash className="w-12 h-12 mx-auto text-muted-foreground/60" />
              <div>
                <div className="font-semibold">Nenhuma conta cadastrada</div>
                <p className="text-sm text-muted-foreground">Conecte sua conta MT5 via Expert Advisor para começar.</p>
              </div>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar conta MT5
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {accounts.map((a) => (
                  <div key={a.id} className="min-w-[220px]">
                    <MT5AccountCard
                      account={a}
                      selected={a.id === selectedId}
                      onClick={() => setSelectedId(a.id)}
                    />
                  </div>
                ))}
              </div>
              {selected && <MT5Dashboard account={selected} />}
            </>
          )}
        </PlanGate>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Conteúdo educacional e informativo. Não é recomendação de investimento.
        </p>
      </div>
      <AddMT5AccountModal open={addOpen} onOpenChange={setAddOpen} />
    </AppLayout>
  );
}
