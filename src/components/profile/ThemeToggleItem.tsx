import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function ThemeToggleItem() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = mounted && theme === 'light';
  const Icon = isLight ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Tema {isLight ? 'Claro' : 'Escuro'}</p>
        <p className="text-xs text-muted-foreground">
          {isLight ? 'Fundo claro com texto escuro' : 'Fundo navy com texto claro'}
        </p>
      </div>
      <Switch checked={isLight} onCheckedChange={(v) => setTheme(v ? 'light' : 'dark')} />
    </button>
  );
}
