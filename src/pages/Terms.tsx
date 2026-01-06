import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Link to="/auth">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Termos de Uso</h1>
              <p className="text-sm text-muted-foreground">Última atualização: Janeiro 2026</p>
            </div>
          </div>
        </div>

        <Card className="animate-fade-in" style={{ animationDelay: "50ms" }}>
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Ao acessar e utilizar a plataforma CORE HUB, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle>2. Descrição do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              O CORE HUB é uma plataforma de comunidade e educação financeira que oferece:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acesso a conteúdo educacional sobre mercado financeiro</li>
              <li>Comunidade para discussão e networking</li>
              <li>Relatórios de performance agregados</li>
              <li>Programa de afiliados</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle>3. Disclaimer de Investimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-medium text-destructive mb-2">⚠️ AVISO IMPORTANTE</p>
              <p>
                Todo o conteúdo disponibilizado na plataforma CORE HUB é exclusivamente para fins educacionais e informativos. <strong>NÃO constitui recomendação de investimento, consultoria financeira ou qualquer tipo de aconselhamento.</strong>
              </p>
            </div>
            <p>
              Os resultados apresentados são referentes a operações passadas e não garantem resultados futuros. Investir em mercados financeiros envolve riscos significativos e você pode perder parte ou todo o seu capital investido.
            </p>
            <p>
              Antes de tomar qualquer decisão de investimento, consulte um profissional financeiro devidamente qualificado e credenciado.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle>4. Cadastro e Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Para utilizar certos recursos da plataforma, você deverá criar uma conta fornecendo informações precisas e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.
            </p>
            <p>
              Você concorda em notificar imediatamente a equipe CORE HUB sobre qualquer uso não autorizado de sua conta.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "250ms" }}>
          <CardHeader>
            <CardTitle>5. Conduta do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Ao utilizar nossa plataforma, você concorda em NÃO:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violar qualquer lei ou regulamentação aplicável</li>
              <li>Publicar conteúdo ofensivo, difamatório ou ilegal</li>
              <li>Fazer spam ou promover esquemas fraudulentos</li>
              <li>Tentar acessar contas de outros usuários</li>
              <li>Interferir no funcionamento da plataforma</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle>6. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, vídeos e software, é propriedade do CORE HUB ou de seus licenciadores e está protegido por leis de propriedade intelectual.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "350ms" }}>
          <CardHeader>
            <CardTitle>7. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              O CORE HUB não se responsabiliza por quaisquer perdas financeiras decorrentes de decisões de investimento tomadas com base no conteúdo da plataforma. O uso da plataforma é por sua conta e risco.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle>8. Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Para dúvidas sobre estes Termos de Uso, entre em contato através dos canais oficiais disponíveis na plataforma.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: "450ms" }}>
          <Link to="/auth">
            <Button variant="outline">Voltar ao Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
