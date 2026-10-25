import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropiedadesModal {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  pie?: ReactNode;
  ancho?: 'sm' | 'md' | 'lg';
  /** Alias de `ancho` (compatibilidad con páginas que envían `tamano`). */
  tamano?: 'sm' | 'md' | 'lg';
}

export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  pie,
  ancho = 'md',
  tamano,
}: PropiedadesModal) {
  const medida = tamano ?? ancho;
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPresionar);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = original;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 z-[50] bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={cn(
          'relative z-[60] w-full max-w-full overflow-y-auto rounded-[1.5rem] border border-white/[0.1] bg-card p-4 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] shadow-primary/10 animate-slide-up max-h-[calc(100vh_-_2rem)]',
          medida === 'sm' && 'max-w-sm',
          medida === 'md' && 'max-w-lg',
          medida === 'lg' && 'max-w-3xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">{titulo}</h2>
            {descripcion && <p className="mt-1 text-sm text-muted leading-relaxed">{descripcion}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-xl border border-white/[0.08] bg-surface p-1.5 text-muted transition-all duration-200 hover:border-white/20 hover:text-foreground cursor-pointer focus-ring"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {pie && <div className="mt-6 flex justify-end gap-3 border-t border-white/[0.06] pt-4">{pie}</div>}
      </div>
    </div>,
    document.body,
  );
}
