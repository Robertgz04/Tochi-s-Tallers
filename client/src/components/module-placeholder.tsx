import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

interface PropiedadesModulePlaceholder {
  titulo: string;
  fase: string;
  descripcion?: string;
}

/**
 * Vista provisional de módulos que se construirán en fases posteriores.
 * Mantiene la navegación funcional sin fingir datos inexistentes.
 */
export function ModulePlaceholder({ titulo, fase, descripcion }: PropiedadesModulePlaceholder) {
  return (
    <div className="animate-fade-in">
      <PageHeader titulo={titulo} descripcion="Módulo en preparación" />
      <EmptyState
        icono={<Wrench className="h-7 w-7" aria-hidden="true" />}
        titulo={`Este módulo se habilita en la ${fase}`}
        descripcion={
          descripcion ??
          'La base del sistema (estructura, base de datos, autenticación y dashboard) ya está lista. Este módulo se conectará en la fase indicada.'
        }
        accion={
          <Link to="/dashboard">
            <Button variant="secondary">Volver al dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}
