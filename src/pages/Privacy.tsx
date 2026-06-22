import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Link to="/auth">
            <Button aria-label="Voltar" variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Política de Privacidade</h1>
              <p className="text-sm text-muted-foreground">Última atualização: Janeiro 2026</p>
            </div>
          </div>
        </div>

        <Card className="animate-fade-in" style={{ animationDelay: "50ms" }}>
          <CardHeader>
            <CardTitle>1. Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              A privacidade dos nossos usuários é uma prioridade para o Instituto Trader. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle>2. Dados Coletados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Coletamos os seguintes tipos de dados:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, foto de perfil</li>
              <li><strong>Dados de uso:</strong> interações na plataforma, tutoriais assistidos, mensagens na comunidade</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo</li>
              <li><strong>Dados de afiliado:</strong> informações de pagamento (Pix, PayPal) quando aplicável</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle>3. Finalidade do Tratamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornecer acesso aos serviços da plataforma</li>
              <li>Personalizar sua experiência de usuário</li>
              <li>Processar pagamentos do programa de afiliados</li>
              <li>Enviar comunicações relevantes sobre a plataforma</li>
              <li>Melhorar nossos serviços e desenvolver novos recursos</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle>4. Base Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>O tratamento dos seus dados é realizado com base em:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Consentimento:</strong> quando você cria sua conta e aceita estes termos</li>
              <li><strong>Execução de contrato:</strong> para prestação dos serviços contratados</li>
              <li><strong>Legítimo interesse:</strong> para melhoria dos serviços e segurança da plataforma</li>
              <li><strong>Obrigação legal:</strong> quando exigido por lei</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "250ms" }}>
          <CardHeader>
            <CardTitle>5. Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Seus dados NÃO são vendidos a terceiros. Podemos compartilhar informações apenas com:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Prestadores de serviços essenciais (hospedagem, processamento de pagamentos)</li>
              <li>Autoridades quando exigido por lei</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle>6. Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "350ms" }}>
          <CardHeader>
            <CardTitle>7. Seus Direitos (LGPD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Você tem direito a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
              <li><strong>Eliminação:</strong> solicitar a exclusão dos seus dados</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
              <li><strong>Revogação:</strong> retirar seu consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> opor-se ao tratamento em determinadas situações</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle>8. Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma, incluindo autenticação e preferências de sessão. Não utilizamos cookies de rastreamento para publicidade.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "450ms" }}>
          <CardHeader>
            <CardTitle>9. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para cumprir obrigações legais. Após solicitar exclusão, seus dados serão removidos em até 30 dias, exceto quando houver obrigação legal de retenção.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-4" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle>10. Contato do DPO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados através dos canais oficiais disponíveis na plataforma.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: "550ms" }}>
          <Link to="/auth">
            <Button variant="outline">Voltar ao Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
