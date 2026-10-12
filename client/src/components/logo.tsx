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
        className="h-8 w-8 shrink-0"
        role="img"
        aria-label="Tochi'sTaller"
      >
        {/* Tuerca exterior */}
        <path
          d="M20 2 L35.6 11 L35.6 29 L20 38 L4.4 29 L4.4 11 Z"
          fill="#F59E0B"
        />
        {/* Hueco interior */}
        <path
          d="M20 8 L30.4 14 L30.4 26 L20 32 L9.6 26 L9.6 14 Z"
          fill="#0B0D10"
        />
        {/* T tipográfica */}
        <path d="M13 14 H27 V18 H22.2 V27 H17.8 V18 H13 Z" fill="#F5F7FA" />
      </svg>
      {!compacto && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-foreground">
            TOCHI&rsquo;S
          </span>
          <span className="text-[10px] font-semibold tracking-[0.28em] text-primary">TALLER</span>
        </span>
      )}
    </div>
  );
}
