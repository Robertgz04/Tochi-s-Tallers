import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropiedadesPagination {
  pagina: number;
  totalPaginas: number;
  onCambio: (pagina: number) => void;
  cargando?: boolean;
}

export function Pagination({
  pagina,
  totalPaginas,
  onCambio,
  cargando = false,
}: PropiedadesPagination) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted">
        Página <span className="font-semibold text-foreground">{pagina}</span> de{' '}
        <span className="font-semibold text-foreground">{totalPaginas}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={pagina <= 1 || cargando}
          onClick={() => onCambio(pagina - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={pagina >= totalPaginas || cargando}
          onClick={() => onCambio(pagina + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
