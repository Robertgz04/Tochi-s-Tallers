import { Link } from 'react-router-dom';
import { Building2, ChevronRight, CreditCard, Hash, Percent, Settings, UsersRound } from 'lucide-react';
import { useMiTallerQuery } from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';

export default function ConfiguracionPage() {
  const { data: taller, isPending, isError, error, refetch } = useMiTallerQuery();

  if (isPending) {
    return (
      <div className="space-y-4">
        <PageHeader titulo="Configuración" descripcion="Ajustes generales de tu taller." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !taller) {
    return (
      <ErrorState
        titulo="No pudimos cargar la configuración"
        descripcion={error instanceof Error ? error.message : 'Inténtalo nuevamente.'}
        onReintentar={() => refetch()}
      />
    );
  }

  const enlaces = [
    { to: '/mi-taller', icono: Building2, titulo: 'Datos del taller', descripcion: 'Nombre, razón social, contacto, RFC y dirección.' },
    { to: '/equipo', icono: UsersRound, titulo: 'Equipo y accesos', descripcion: 'Usuarios, roles y altas/bajas del personal.' },
  ];


  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader titulo="Configuración" descripcion="Resumen y accesos a los ajustes de tu taller." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
            <CreditCard className="h-4 w-4" /> Plan
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">{taller.plan}</p>
          <Badge variant={taller.estadoSuscripcion === 'ACTIVA' ? 'success' : 'warning'} conPunto>{taller.estadoSuscripcion}</Badge>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
            <Hash className="h-4 w-4" /> Prefijo de folio
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">{taller.prefijoFolio}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
            <Percent className="h-4 w-4" /> IVA
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">{taller.iva}%</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
            <Settings className="h-4 w-4" /> Moneda
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">{taller.moneda}</p>
        </Card>
      </div>

      <div>
        <h3 className="mb-3.5 text-sm font-bold tracking-tight text-foreground">Ajustes del sistema</h3>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {enlaces.map(({ to, icono: Icono, titulo, descripcion }) => (
            <Link key={to} to={to} className="group block">
              <Card className="flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] transition-transform duration-200 group-hover:scale-105">
                  <Icono className="h-5.5 w-5.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{titulo}</p>
                  <p className="truncate text-xs text-muted mt-0.5">{descripcion}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" aria-hidden="true" />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {taller.fechaVencimiento && (
        <Card className="p-5">
          <p className="text-sm text-muted">
            Tu suscripción vence el <span className="font-medium text-foreground">{taller.fechaVencimiento}</span>.
          </p>
        </Card>
      )}
    </div>
  );
}
