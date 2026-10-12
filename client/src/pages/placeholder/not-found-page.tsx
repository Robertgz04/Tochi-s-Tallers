import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-foreground">Página no encontrada</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Volver al dashboard</Button>
      </Link>
    </div>
  );
}
