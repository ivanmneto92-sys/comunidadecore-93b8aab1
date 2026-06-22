import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  Share, 
  MoreVertical, 
  Plus, 
  Check, 
  Smartphone,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoCore from '@/assets/logo-instituto-trader.png';

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    
    // Check if installed via navigator
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        setIsInstalled(apps.length > 0);
      });
    }

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setInstalling(false);
  };

  // Already installed view
  if (isStandalone || isInstalled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Check className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">App Instalado!</h1>
            <p className="text-muted-foreground">
              O Comunidade INSTITUTO TRADER já está na sua tela inicial. Aproveite a experiência completa!
            </p>
          </div>
          <Button onClick={() => navigate('/')} className="w-full">
            Ir para o App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-center mb-8">
          <img src={logoCore} alt="INSTITUTO TRADER" width={280} height={64} className="h-16 w-auto" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Instale o App</h1>
          <p className="text-muted-foreground">
            Adicione o Comunidade INSTITUTO TRADER à sua tela inicial para acesso rápido e experiência nativa.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <Smartphone className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Acesso rápido</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <Download className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Offline</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 text-center">
              <ExternalLink className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Tela cheia</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Install Instructions */}
      <div className="px-6 pb-6">
        {/* Android with prompt available */}
        {platform === 'android' && deferredPrompt && (
          <div className="space-y-4">
            <Button 
              onClick={handleInstallClick} 
              className="w-full h-14 text-lg"
              disabled={installing}
            >
              <Download className="mr-2 h-5 w-5" />
              {installing ? 'Instalando...' : 'Instalar Agora'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Clique no botão acima para adicionar à tela inicial
            </p>
          </div>
        )}

        {/* Android manual instructions */}
        {platform === 'android' && !deferredPrompt && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 text-primary font-medium">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span>Toque no menu do navegador</span>
                <MoreVertical className="h-5 w-5 ml-auto" />
              </div>
              
              <div className="flex items-center gap-2 text-primary font-medium">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span>Selecione "Instalar app" ou "Adicionar à tela inicial"</span>
              </div>
              
              <div className="flex items-center gap-2 text-primary font-medium">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span>Confirme a instalação</span>
                <Check className="h-5 w-5 ml-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* iOS instructions */}
        {platform === 'ios' && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">Toque em Compartilhar</p>
                  <p className="text-sm text-muted-foreground">No Safari, toque no ícone de compartilhar</p>
                </div>
                <Share className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">Adicionar à Tela de Início</p>
                  <p className="text-sm text-muted-foreground">Role para baixo e toque na opção</p>
                </div>
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Confirme "Adicionar"</p>
                  <p className="text-sm text-muted-foreground">Toque em Adicionar no canto superior direito</p>
                </div>
                <Check className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* Safari warning */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Importante:</strong> Use o Safari para instalar. Outros navegadores no iOS não suportam esta funcionalidade.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop instructions */}
        {platform === 'desktop' && (
          <Card>
            <CardContent className="p-6 space-y-6">
              {deferredPrompt ? (
                <div className="space-y-4">
                  <Button 
                    onClick={handleInstallClick} 
                    className="w-full h-14 text-lg"
                    disabled={installing}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {installing ? 'Instalando...' : 'Instalar App'}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Clique para instalar como aplicativo desktop
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Clique no ícone de instalação</p>
                      <p className="text-sm text-muted-foreground">Na barra de endereços do navegador</p>
                    </div>
                    <Download className="h-6 w-6 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Confirme a instalação</p>
                      <p className="text-sm text-muted-foreground">Clique em "Instalar" no popup</p>
                    </div>
                    <Check className="h-6 w-6 text-muted-foreground" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Skip button */}
      <div className="px-6 pb-8">
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => navigate('/auth')}
        >
          Continuar no navegador
        </Button>
      </div>
    </div>
  );
};

export default Install;
