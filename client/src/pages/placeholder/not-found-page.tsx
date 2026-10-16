import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in p-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: '20s' }} aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">Página no encontrada (404)</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        La sección que estás buscando no existe en el sistema o fue reubicada.
      </p>
      <Link to="/dashboard" className="mt-7">
        <Button size="lg">Volver al panel principal</Button>
      </Link>
    </div>
  );
}
