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
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#12161e] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent">
      <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground">Trabajos recientes</h3>
          <p className="text-xs text-muted">Órdenes operativas registradas en el taller</p>
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
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {trabajo.folio}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-foreground">{trabajo.vehiculo}</p>
                      <div className="mt-0.5">
                        <span className="plate-badge">{trabajo.placa}</span>
                      </div>
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
                    <TableCell className="text-right font-extrabold tabular-nums text-foreground">
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
                className="rounded-xl border border-white/[0.08] bg-[#10141d]/80 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {trabajo.vehiculo}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="plate-badge">{trabajo.placa}</span>
                      <span className="truncate text-xs text-muted">{trabajo.cliente}</span>
                    </div>
                  </div>
                  <StatusBadge estado={trabajo.estado} />
                </div>
                <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-xs">
                  <span className="font-mono font-medium text-muted">{trabajo.folio}</span>
                  <span className="text-sm font-extrabold tabular-nums text-foreground">
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
