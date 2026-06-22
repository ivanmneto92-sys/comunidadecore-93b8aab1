import { useMemo } from 'react';
import { getAvatarById, Avatar } from '@/lib/avatarLibrary';

interface UseAvatarResult {
  avatar: Avatar | null;
  svg: string;
  imageUrl: string | null;
  hasAvatar: boolean;
}

/**
 * Hook para obter o avatar do usuário.
 * Prioridade: avatar_url (imagem custom) > avatar_id (biblioteca SVG) > iniciais
 */
export function useAvatar(
  avatarId: string | null | undefined,
  displayName?: string,
  avatarUrl?: string | null,
): UseAvatarResult {
  return useMemo(() => {
    if (avatarUrl) {
      return { avatar: null, svg: '', imageUrl: avatarUrl, hasAvatar: true };
    }

    const avatar = getAvatarById(avatarId);
    if (avatar) {
      return { avatar, svg: avatar.svg, imageUrl: null, hasAvatar: true };
    }

    const initials = getInitials(displayName);
    return {
      avatar: null,
      svg: generateInitialsSvg(initials),
      imageUrl: null,
      hasAvatar: false,
    };
  }, [avatarId, displayName, avatarUrl]);
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
 * Renderiza um avatar (imagem custom ou SVG da biblioteca) dentro de um wrapper.
 */
export function renderAvatar(
  result: Pick<UseAvatarResult, 'svg' | 'imageUrl'>,
  className?: string,
  alt = 'Avatar',
): React.ReactElement {
  if (result.imageUrl) {
    return <img src={result.imageUrl} alt={alt} className={className} loading="lazy" />;
  }
  return <div className={className} dangerouslySetInnerHTML={{ __html: result.svg }} />;
}

/**
 * Componente helper para renderizar SVG inline (mantido para compatibilidade).
 */
export function renderAvatarSvg(svg: string, className?: string): React.ReactElement {
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
