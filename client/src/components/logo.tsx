import { cn } from '@/lib/utils';

interface PropiedadesLogo {
  /** Tamaño compacto para sidebar colapsado o móviles. */
  compacto?: boolean;
  className?: string;
}

/**
 * Logo tipográfico temporal de Tochi'sTaller.
 * Trazado vectorial original (hexágono de tuerca + T), sin imágenes de terceros.
 */
export function Logo({ compacto = false, className }: PropiedadesLogo) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-8.5 w-8.5 shrink-0 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]"
        role="img"
        aria-label="Tochi'sTaller"
      >
        <defs>
          <linearGradient id="tochiLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Tuerca exterior */}
        <path
          d="M20 2 L35.6 11 L35.6 29 L20 38 L4.4 29 L4.4 11 Z"
          fill="url(#tochiLogoGrad)"
        />
        {/* Hueco interior */}
        <path
          d="M20 8 L30.4 14 L30.4 26 L20 32 L9.6 26 L9.6 14 Z"
          fill="#090B0E"
        />
        {/* T tipográfica */}
        <path d="M13 14 H27 V18 H22.2 V27 H17.8 V18 H13 Z" fill="#F8FAFC" />
      </svg>
      {!compacto && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-foreground">
            TOCHI&rsquo;S
          </span>
          <span className="text-[9.5px] font-bold tracking-[0.3em] text-primary">TALLER</span>
        </span>
      )}
    </div>
  );
}
