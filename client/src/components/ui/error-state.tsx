import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropiedadesErrorState {
  titulo?: string;
  descripcion?: string;
  onReintentar?: () => void;
}

export function ErrorState({
  titulo = 'Algo salió mal.',
  descripcion = 'No pudimos cargar la información. Inténtalo nuevamente.',
  onReintentar,
}: PropiedadesErrorState) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/[0.06] px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{titulo}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{descripcion}</p>
      {onReintentar && (
        <Button variant="secondary" className="mt-5" onClick={onReintentar}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
