interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'mark' | 'horizontal' | 'vertical';
  /** Override gold color (defaults to currentColor where applicable) */
  goldClassName?: string;
}

/**
 * Instituto Trader — Monogram IT atravessado por uma seta ascendente.
 * Vertical: ícone acima do nome. Horizontal: ícone à esquerda do nome.
 */
export function InstitutoTraderLogo({
  size = 48,
  className = '',
  variant = 'mark',
  goldClassName = 'text-primary',
}: LogoProps) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={goldClassName}
      aria-hidden="true"
    >
      {/* Letter I */}
      <rect x="10" y="12" width="6" height="40" rx="1" fill="currentColor" />
      {/* Letter T */}
      <rect x="22" y="12" width="32" height="6" rx="1" fill="currentColor" />
      <rect x="35" y="12" width="6" height="40" rx="1" fill="currentColor" />
      {/* Ascending arrow crossing IT */}
      <path
        d="M6 50 L58 18"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M48 14 L58 18 L54 28"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={className}>{mark}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {mark}
        <div className="flex flex-col leading-none">
          <span className="font-serif-display text-lg font-semibold tracking-tight text-foreground">
            Instituto Trader
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/55 mt-1">
            Educação · Tecnologia · Comunidade
          </span>
        </div>
      </div>
    );
  }

  // vertical
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {mark}
      <div className="flex flex-col items-center leading-none">
        <span className="font-serif-display text-xl font-semibold tracking-tight text-foreground">
          Instituto Trader
        </span>
        <span className="text-[10px] uppercase tracking-[0.28em] text-foreground/55 mt-1.5">
          Forex · Comunidade
        </span>
      </div>
    </div>
  );
}
