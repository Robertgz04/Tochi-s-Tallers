import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, type Columna } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { PagoFormModal } from '@/pages/pagos/pago-form-modal';
import { useCrearPagoMutation, useEliminarPagoMutation, useOrdenesQuery, usePagosQuery } from '@/hooks/useQueries';
import { formatMoney } from '@/lib/utils';
import { ETIQUETAS_METODO_PAGO, type PagoResumen, type PayloadCrearPago } from '@/types';

export default function PagosPage() {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [porEliminar, setPorEliminar] = useState<PagoResumen | null>(null);
  const filtros = useMemo(() => ({ pagina, q: busqueda.trim() || undefined }), [busqueda, pagina]);
  const { data, isPending, isError, error, refetch } = usePagosQuery(filtros);
  const { data: ordenesData } = useOrdenesQuery({ pagina: 1 });
  const crear = useCrearPagoMutation();
  const eliminar = useEliminarPagoMutation();
  const guardar = (payload: PayloadCrearPago) => crear.mutate(payload, { onSuccess: () => setModalAbierto(false) });
  const columnas: Columna<PagoResumen>[] = [
    { clave: 'pago', encabezado: 'Pago', render: (pago) => <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success"><Wallet className="h-4 w-4" /></span><div><p className="font-semibold">{formatMoney(pago.monto)}</p><p className="text-xs text-muted">{format(parseISO(pago.fechaPago), 'dd MMM yyyy', { locale: es })}</p></div></div> },
    { clave: 'orden', encabezado: 'Orden / cliente', render: (pago) => <div><p className="font-medium">{pago.ordenFolio} · {pago.cliente}</p><p className="text-xs text-muted">{pago.placa} · {pago.vehiculo}</p></div> },
    { clave: 'metodo', encabezado: 'Método', render: (pago) => <Badge variant="default">{ETIQUETAS_METODO_PAGO[pago.metodoPago]}</Badge> },
    { clave: 'referencia', encabezado: 'Referencia', ocultoEnMovil: true, render: (pago) => <span className="text-muted">{pago.referencia ?? '—'}</span> },
    { clave: 'saldo', encabezado: 'Saldo orden', clase: 'text-right', render: (pago) => <span className="font-semibold">{formatMoney(pago.saldo)}</span> },
    { clave: 'acciones', encabezado: 'Acciones', clase: 'text-right', render: (pago) => <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setPorEliminar(pago)}><Trash2 className="h-4 w-4" /></Button> },
  ];
  return <div className="animate-fade-in"><PageHeader titulo="Pagos" descripcion="Abonos registrados y saldos pendientes por orden." acciones={<Button onClick={() => setModalAbierto(true)}><Plus className="h-4 w-4" />Registrar pago</Button>} />
    <div className="mb-4"><SearchInput value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }} onLimpiar={() => { setBusqueda(''); setPagina(1); }} placeholder="Buscar por orden, cliente, placa o referencia..." /></div>
    <DataTable columnas={columnas} datos={data?.items ?? []} claveFila={(pago) => pago.id} cargando={isPending} error={isError ? (error as Error).message : null} onReintentar={() => refetch()} vacioTitulo="Sin pagos" vacioDescripcion="Registra pagos para controlar los saldos de cada orden." pagina={data?.pagina} totalPaginas={data?.totalPaginas} onCambioPagina={setPagina} />
    <PagoFormModal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} onGuardar={guardar} cargando={crear.isPending} ordenes={ordenesData?.items ?? []} />
    <ConfirmDialog abierto={porEliminar !== null} onCancelar={() => setPorEliminar(null)} onConfirmar={() => { if (!porEliminar) return; eliminar.mutate(porEliminar.id, { onSuccess: () => setPorEliminar(null) }); }} titulo="Eliminar pago" descripcion={`Se eliminará el pago de ${porEliminar ? formatMoney(porEliminar.monto) : ''}.`} textoConfirmar="Eliminar" peligro cargando={eliminar.isPending} />
  </div>;
}