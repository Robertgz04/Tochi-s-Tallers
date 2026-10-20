import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownUp, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useCrearItemMutation,
  useActualizarItemMutation,
  useEliminarItemMutation,
  useInventarioQuery,
  useMovimientoMutation,
} from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { formatMoney, formatNumber } from '@/lib/utils';
import type { ItemInventario, PayloadCrearItem, TipoMovimiento } from '@/types';
import { ItemFormModal } from '@/pages/inventario/item-form-modal';
import { MovimientoModal } from '@/pages/inventario/movimiento-modal';

export default function InventarioPage() {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [stockBajo, setStockBajo] = useState(false);
  const [formAbierto, setFormAbierto] = useState(false);
  const [movAbierto, setMovAbierto] = useState(false);
  const [editando, setEditando] = useState<ItemInventario | null>(null);
  const [itemMov, setItemMov] = useState<ItemInventario | null>(null);
  const [porEliminar, setPorEliminar] = useState<ItemInventario | null>(null);

  const filtros = useMemo(
    () => ({ pagina, q: busqueda.trim() || undefined, categoria: categoria || undefined, stockBajo }),
    [busqueda, categoria, pagina, stockBajo],
  );
  const { data, isPending, isError, error, refetch } = useInventarioQuery(filtros);
  const crear = useCrearItemMutation();
  const actualizar = useActualizarItemMutation();
  const eliminar = useEliminarItemMutation();
  const movimiento = useMovimientoMutation();

  const guardar = (payload: PayloadCrearItem) => {
    if (editando) actualizar.mutate({ id: editando.id, payload }, { onSuccess: () => { setFormAbierto(false); setEditando(null); } });
    else crear.mutate(payload, { onSuccess: () => setFormAbierto(false) });
  };

  const registrarMovimiento = (payload: { itemId: string; tipo: TipoMovimiento; cantidad: number; motivo?: string }) =>
    movimiento.mutate(payload, { onSuccess: () => { setMovAbierto(false); setItemMov(null); } });

  const columnas: Columna<ItemInventario>[] = [
    {
      clave: 'producto',
      encabezado: 'Producto',
      render: (item) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Package className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{item.nombre}</p>
            <p className="truncate text-xs text-muted">
              <span className="font-mono font-bold text-foreground/80">{item.sku}</span>
              {item.categoria ? ` · ${item.categoria}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      clave: 'stock',
      encabezado: 'Stock',
      clase: 'text-center',
      render: (item) =>
        item.stockBajo ? (
          <Badge variant="danger" conPunto>{formatNumber(item.stock)} {item.unidad}</Badge>
        ) : (
          <span className="font-bold tabular-nums text-foreground">{formatNumber(item.stock)} {item.unidad}</span>
        ),
    },
    {
      clave: 'costo',
      encabezado: 'Costo',
      clase: 'text-right',
      ocultoEnMovil: true,
      render: (item) => <span className="text-muted tabular-nums">{formatMoney(item.costo)}</span>,
    },
    {
      clave: 'precio',
      encabezado: 'Precio',
      clase: 'text-right',
      render: (item) => <span className="font-extrabold tabular-nums text-foreground">{formatMoney(item.precio)}</span>,
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      clase: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="sm" aria-label={`Movimiento ${item.nombre}`} onClick={() => { setItemMov(item); setMovAbierto(true); }}>
            <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" aria-label={`Editar ${item.nombre}`} onClick={() => { setEditando(item); setFormAbierto(true); }}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" aria-label={`Eliminar ${item.nombre}`} className="text-destructive hover:bg-destructive/15 hover:text-destructive" onClick={() => setPorEliminar(item)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  const cargandoGuardado = crear.isPending || actualizar.isPending;

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Inventario"
        descripcion="Refacciones y productos con control de stock y alertas."
        acciones={
          <Button onClick={() => { setEditando(null); setFormAbierto(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo producto
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard titulo="Productos" valor={formatNumber(data?.total ?? 0)} icono={Package} detalle="Registrados en almacén" />
        <StatCard titulo="Stock bajo" valor={formatNumber(data?.stockBajoTotal ?? 0)} icono={AlertTriangle} detalle="Requieren reorden urgente" destacado={(data?.stockBajoTotal ?? 0) > 0} />
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/[0.08] bg-card/70 p-3 sm:p-4 shadow-sm backdrop-blur-md lg:grid-cols-[1fr_200px_auto]">
        <SearchInput
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          onLimpiar={() => { setBusqueda(''); setPagina(1); }}
          placeholder="Buscar por nombre, SKU o categoría..."
        />
        <Select value={categoria} onChange={(e) => { setCategoria(e.target.value); setPagina(1); }}>
          <option value="">Todas las categorías</option>
          {(data?.categorias ?? []).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
        <Button
          variant={stockBajo ? 'primary' : 'ghost'}
          onClick={() => { setStockBajo((v) => !v); setPagina(1); }}
          aria-pressed={stockBajo}
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Solo stock bajo
        </Button>
      </div>

      <DataTable<ItemInventario>
        columnas={columnas}
        datos={data?.items ?? []}
        claveFila={(item) => item.id}
        cargando={isPending}
        error={isError ? (error as Error).message : null}
        onReintentar={() => refetch()}
        vacioTitulo={busqueda || stockBajo ? 'Sin productos con esos filtros' : 'Aún no hay productos'}
        vacioDescripcion={busqueda || stockBajo ? 'Ajusta la búsqueda o el filtro.' : 'Registra tu primer producto para controlar el inventario.'}
        vacioAccion={busqueda || stockBajo ? undefined : <Button onClick={() => { setEditando(null); setFormAbierto(true); }}><Plus className="h-4 w-4" aria-hidden="true" /> Registrar producto</Button>}
        pagina={data?.pagina}
        totalPaginas={data?.totalPaginas}
        onCambioPagina={setPagina}
      />

      <ItemFormModal
        abierto={formAbierto}
        onCerrar={() => { setFormAbierto(false); setEditando(null); }}
        onGuardar={guardar}
        cargando={cargandoGuardado}
        item={editando}
      />

      <MovimientoModal
        abierto={movAbierto}
        onCerrar={() => { setMovAbierto(false); setItemMov(null); }}
        onGuardar={registrarMovimiento}
        cargando={movimiento.isPending}
        item={itemMov}
      />

      <ConfirmDialog
        abierto={porEliminar !== null}
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => { if (!porEliminar) return; eliminar.mutate(porEliminar.id, { onSuccess: () => setPorEliminar(null) }); }}
        titulo="Eliminar producto"
        descripcion={`${porEliminar ? porEliminar.nombre : ''} será eliminado permanentemente del inventario.`}
        textoConfirmar="Eliminar"
        peligro
        cargando={eliminar.isPending}
      />
    </div>
  );
}
