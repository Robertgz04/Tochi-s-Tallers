import type { ReactNode } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface Columna<T> {
  clave: string;
  encabezado: string;
  render: (fila: T) => ReactNode;
  clase?: string;
  /** Oculta la columna en pantallas pequeñas. */
  ocultoEnMovil?: boolean;
}

interface PropiedadesDataTable<T> {
  columnas: Columna<T>[];
  datos: T[];
  claveFila: (fila: T) => string;
  cargando?: boolean;
  error?: string | null;
  onReintentar?: () => void;
  vacioTitulo?: string;
  vacioDescripcion?: string;
  vacioAccion?: ReactNode;
  /** Paginación server-side (opcional). */
  pagina?: number;
  totalPaginas?: number;
  onCambioPagina?: (pagina: number) => void;
  className?: string;
}

export function DataTable<T>({
  columnas,
  datos,
  claveFila,
  cargando = false,
  error = null,
  onReintentar,
  vacioTitulo = 'Sin resultados',
  vacioDescripcion = 'Todavía no hay información para mostrar.',
  vacioAccion,
  pagina,
  totalPaginas,
  onCambioPagina,
  className,
}: PropiedadesDataTable<T>) {
  if (error) {
    return <ErrorState titulo="No pudimos cargar la información" descripcion={error} onReintentar={onReintentar} />;
  }

  if (cargando) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, indice) => (
          <Skeleton key={indice} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <EmptyState
        className="border-border-0 bg-transparent"
        titulo={vacioTitulo}
        descripcion={vacioDescripcion}
        accion={vacioAccion}
      />
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columnas.map((columna) => (
              <TableHead
                key={columna.clave}
                className={cn(columna.clase, columna.ocultoEnMovil && 'hidden md:table-cell')}
              >
                {columna.encabezado}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {datos.map((fila) => (
            <TableRow key={claveFila(fila)}>
              {columnas.map((columna) => (
                <td
                  key={columna.clave}
                  className={cn(
                    'px-4 py-3 align-middle text-sm',
                    columna.clase,
                    columna.ocultoEnMovil && 'hidden md:table-cell',
                  )}
                >
                  {columna.render(fila)}
                </td>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pagina !== undefined && totalPaginas !== undefined && onCambioPagina && (
        <Pagination pagina={pagina} totalPaginas={totalPaginas} onCambio={onCambioPagina} cargando={cargando} />
      )}
    </div>
  );
}
