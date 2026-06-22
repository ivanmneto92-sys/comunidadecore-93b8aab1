import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateMT5Account } from "@/hooks/useMT5Accounts";
import { toast } from "sonner";
import { Copy, Check, AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMT5AccountModal({ open, onOpenChange }: Props) {
  const create = useCreateMT5Account();
  const [login, setLogin] = useState("");
  const [server, setServer] = useState("");
  const [broker, setBroker] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [leverage, setLeverage] = useState("");
  const [generated, setGenerated] = useState<{ token: string; login: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setLogin(""); setServer(""); setBroker(""); setCurrency("USD"); setLeverage("");
    setGenerated(null); setCopied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await create.mutateAsync({
        account_login: Number(login),
        server: server.trim(),
        broker: broker.trim() || undefined,
        currency: currency.trim() || "USD",
        leverage: leverage ? Number(leverage) : undefined,
      });
      setGenerated({ token: res.token, login: res.account.account_login });
      toast.success("Conta MT5 cadastrada");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao cadastrar conta");
    }
  };

  const copy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-md">
        {!generated ? (
          <>
            <DialogHeader>
              <DialogTitle>Adicionar conta MT5</DialogTitle>
              <DialogDescription>
                Informe os dados públicos da sua conta. Não pedimos senha nem investor password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="login">Login da conta</Label>
                <Input id="login" type="number" required value={login} onChange={(e) => setLogin(e.target.value)} placeholder="123456" />
              </div>
              <div>
                <Label htmlFor="server">Servidor</Label>
                <Input id="server" required value={server} onChange={(e) => setServer(e.target.value)} placeholder="BrokerName-Live" />
              </div>
              <div>
                <Label htmlFor="broker">Broker (opcional)</Label>
                <Input id="broker" value={broker} onChange={(e) => setBroker(e.target.value)} placeholder="Nome do broker" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={4} />
                </div>
                <div>
                  <Label htmlFor="leverage">Alavancagem</Label>
                  <Input id="leverage" type="number" value={leverage} onChange={(e) => setLeverage(e.target.value)} placeholder="100" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? "Criando..." : "Criar conta"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Conta criada</DialogTitle>
              <DialogDescription>
                Copie o token abaixo e cole no Expert Advisor MT5. Este token só será exibido <strong>uma vez</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="rounded-lg border border-status-warning/40 bg-status-warning/10 p-3 flex gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                <span>Guarde em local seguro. Se perder, gere um novo token (o anterior será invalidado).</span>
              </div>
              <div>
                <Label>Login</Label>
                <Input readOnly value={generated.login} />
              </div>
              <div>
                <Label>API Token</Label>
                <div className="flex gap-2">
                  <Input readOnly value={generated.token} className="font-mono text-xs" />
                  <Button aria-label="Confirmar" type="button" variant="outline" size="icon" onClick={copy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={() => { onOpenChange(false); reset(); }} className="w-full">
                Concluir
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
