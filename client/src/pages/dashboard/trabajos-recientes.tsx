import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClipboardList } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/lib/utils';
import type { TrabajoReciente } from '@/types';

interface Propiedades {
  trabajos: TrabajoReciente[];
}

export function TrabajosRecientes({ trabajos }: Propiedades) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Trabajos recientes</h3>
          <p className="text-xs text-muted">Últimas órdenes registradas</p>
        </div>
        <Link to="/ordenes">
          <Button variant="ghost" size="sm">
            Ver todas
          </Button>
        </Link>
      </div>

      {trabajos.length === 0 ? (
        <EmptyState
          className="mb-5 border-0 bg-transparent"
          icono={<ClipboardList className="h-7 w-7" aria-hidden="true" />}
          titulo="No tienes órdenes activas"
          descripcion="Registra tu primera orden de trabajo para empezar a dar seguimiento."
          accion={
            <Link to="/ordenes">
              <Button>
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Crear primera orden
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Escritorio */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Folio</TableHead>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden lg:table-cell">Mecánico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trabajos.map((trabajo) => (
                  <TableRow key={trabajo.id}>
                    <TableCell className="font-semibold text-foreground">
                      {trabajo.folio}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{trabajo.vehiculo}</p>
                      <p className="text-xs text-muted">{trabajo.placa}</p>
                    </TableCell>
                    <TableCell className="text-muted">{trabajo.cliente}</TableCell>
                    <TableCell className="hidden text-muted lg:table-cell">
                      {trabajo.mecanico ?? '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge estado={trabajo.estado} />
                    </TableCell>
                    <TableCell className="hidden text-muted sm:table-cell">
                      {format(parseISO(trabajo.fechaIngreso), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-foreground">
                      {formatMoney(trabajo.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Móvil */}
          <div className="space-y-3 p-4 md:hidden">
            {trabajos.map((trabajo) => (
              <article
                key={trabajo.id}
                className="rounded-xl border border-border bg-surface/60 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {trabajo.vehiculo}
                    </p>
                    <p className="text-xs text-muted">
                      {trabajo.placa} · {trabajo.cliente}
                    </p>
                  </div>
                  <StatusBadge estado={trabajo.estado} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted">{trabajo.folio}</span>
                  <span className="font-bold tabular-nums text-foreground">
                    {formatMoney(trabajo.total)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
