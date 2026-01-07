import { useMemo } from 'react';
import { getAvatarById, Avatar } from '@/lib/avatarLibrary';

interface UseAvatarResult {
  avatar: Avatar | null;
  svg: string;
  hasAvatar: boolean;
}

/**
 * Hook para obter o avatar SVG baseado no ID
 * Retorna o SVG do avatar ou gera iniciais como fallback
 */
export function useAvatar(avatarId: string | null | undefined, displayName?: string): UseAvatarResult {
  return useMemo(() => {
    const avatar = getAvatarById(avatarId);
    
    if (avatar) {
      return {
        avatar,
        svg: avatar.svg,
        hasAvatar: true,
      };
    }

    // Fallback: gera SVG com iniciais
    const initials = getInitials(displayName);
    const fallbackSvg = generateInitialsSvg(initials);

    return {
      avatar: null,
      svg: fallbackSvg,
      hasAvatar: false,
    };
  }, [avatarId, displayName]);
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function generateInitialsSvg(initials: string): string {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="50" cy="50" r="48" fill="hsl(var(--muted))"/>' +
    '<text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="36" font-weight="600" fill="hsl(var(--muted-foreground))">' + initials + '</text>' +
    '</svg>';
}

/**
 * Componente helper para renderizar SVG inline
 */
export function renderAvatarSvg(svg: string, className?: string): React.ReactElement {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
