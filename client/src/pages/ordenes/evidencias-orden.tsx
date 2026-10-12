import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  useEliminarEvidenciaMutation,
  useEvidenciasQuery,
} from '@/hooks/useQueries';
import { cn, formatBytes } from '@/lib/utils';
import {
  ETAPAS_EVIDENCIA,
  ETIQUETAS_ETAPAS_EVIDENCIA,
  type EtapaEvidencia,
  type Evidencia,
} from '@/types';
import { EvidenciaSubidaModal } from '@/pages/ordenes/evidencia-subida-modal';

interface Propiedades {
  ordenId: string;
  folio: string;
}

const FILTRO_TODAS = '';

export function EvidenciasOrden({ ordenId, folio }: Propiedades) {
  const [filtroEtapa, setFiltroEtapa] = useState<string>(FILTRO_TODAS);
  const [fotoAmpliada, setFotoAmpliada] = useState<Evidencia | null>(null);
  const [modalSubida, setModalSubida] = useState(false);
  const [porEliminar, setPorEliminar] = useState<Evidencia | null>(null);

  const { data: evidencias = [], isPending, isError, error, refetch } = useEvidenciasQuery(ordenId);
  const eliminar = useEliminarEvidenciaMutation(ordenId);

  const filtradas = useMemo(
    () => (filtroEtapa ? evidencias.filter((e) => e.etapa === filtroEtapa) : evidencias),
    [evidencias, filtroEtapa],
  );

  const conteos = useMemo(() => {
    const mapa = new Map<EtapaEvidencia, number>();
    for (const e of evidencias) mapa.set(e.etapa, (mapa.get(e.etapa) ?? 0) + 1);
    return mapa;
  }, [evidencias]);

  const confirmarEliminacion = () => {
    if (!porEliminar) return;
    eliminar.mutate(porEliminar.id, {
      onSuccess: () => {
        setPorEliminar(null);
        if (fotoAmpliada?.id === porEliminar.id) setFotoAmpliada(null);
      },
    });
  };
  return (
    <section aria-label={`Evidencias de la orden ${folio}`} className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Camera className="h-4 w-4 text-primary" aria-hidden="true" />
            Evidencias fotográficas
            {evidencias.length > 0 && <Badge variant="primary">{evidencias.length}</Badge>}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Documenta el antes, diagnóstico, durante y después del servicio.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalSubida(true)}>
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Agregar foto
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <FiltroEtapa
          activo={filtroEtapa === FILTRO_TODAS}
          etiqueta={`Todas (${evidencias.length})`}
          onClick={() => setFiltroEtapa(FILTRO_TODAS)}
        />
        {ETAPAS_EVIDENCIA.map((etapa) => (
          <FiltroEtapa
            key={etapa}
            activo={filtroEtapa === etapa}
            etiqueta={`${ETIQUETAS_ETAPAS_EVIDENCIA[etapa]} (${conteos.get(etapa) ?? 0})`}
            onClick={() => setFiltroEtapa(etapa)}
          />
        ))}
      </div>

      {isPending ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-10 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando evidencias...
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">No pudimos cargar las fotos.</p>
          <p className="mt-1 text-muted">{(error as Error).message}</p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
          <Camera className="mx-auto h-8 w-8 text-muted" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-foreground">
            {evidencias.length === 0 ? 'Aún no hay fotos en esta orden' : 'Sin fotos en esta etapa'}
          </p>
          <p className="mt-1 text-xs text-muted">
            Sube la primera foto para dejar constancia del trabajo realizado.
          </p>
          <Button size="sm" className="mt-4" onClick={() => setModalSubida(true)}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Subir foto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtradas.map((evidencia) => (
            <TarjetaEvidencia
              key={evidencia.id}
              evidencia={evidencia}
              onAmpliar={() => setFotoAmpliada(evidencia)}
              onEliminar={() => setPorEliminar(evidencia)}
            />
          ))}
        </div>
      )}
      <EvidenciaSubidaModal
        abierto={modalSubida}
        onCerrar={() => setModalSubida(false)}
        ordenId={ordenId}
        etapaInicial={(filtroEtapa as EtapaEvidencia) || 'ANTES'}
      />

      <Modal
        abierto={Boolean(fotoAmpliada)}
        onCerrar={() => setFotoAmpliada(null)}
        titulo={fotoAmpliada ? `Evidencia · ${ETIQUETAS_ETAPAS_EVIDENCIA[fotoAmpliada.etapa]}` : ''}
        descripcion={fotoAmpliada?.descripcion || undefined}
        ancho="lg"
      >
        {fotoAmpliada && (
          <div>
            <img
              src={fotoAmpliada.url}
              alt={fotoAmpliada.descripcion || 'Evidencia ampliada'}
              className="max-h-[60vh] w-full rounded-xl bg-surface object-contain"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>
                {format(parseISO(fotoAmpliada.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                {fotoAmpliada.creadoPorNombre ? ` · ${fotoAmpliada.creadoPorNombre}` : ''}
                {fotoAmpliada.tamanoBytes > 0 ? ` · ${formatBytes(fotoAmpliada.tamanoBytes)}` : ''}
              </span>
              <Button size="sm" variant="danger" onClick={() => setPorEliminar(fotoAmpliada)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        abierto={Boolean(porEliminar)}
        onCerrar={() => setPorEliminar(null)}
        titulo="Eliminar evidencia"
        descripcion="Esta acción borra la foto del servidor y no se puede deshacer."
        ancho="sm"
        pie={
          <>
            <Button variant="secondary" onClick={() => setPorEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarEliminacion} disabled={eliminar.isPending}>
              {eliminar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              )}
              Eliminar foto
            </Button>
          </>
        }
      >
        {porEliminar && (
          <img
            src={porEliminar.url}
            alt="Vista previa de la evidencia a eliminar"
            className="max-h-48 w-full rounded-xl object-cover"
          />
        )}
      </Modal>
    </section>
  );
}
function FiltroEtapa({
  activo,
  etiqueta,
  onClick,
}: {
  activo: boolean;
  etiqueta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        activo
          ? 'border-primary bg-primary text-white'
          : 'border-border bg-card text-muted hover:border-primary/50 hover:text-foreground',
      )}
    >
      {etiqueta}
    </button>
  );
}

function TarjetaEvidencia({
  evidencia,
  onAmpliar,
  onEliminar,
}: {
  evidencia: Evidencia;
  onAmpliar: () => void;
  onEliminar: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={onAmpliar}
        className="relative block aspect-square w-full overflow-hidden bg-surface"
        aria-label={`Ampliar foto de ${ETIQUETAS_ETAPAS_EVIDENCIA[evidencia.etapa]}`}
      >
        <img
          src={evidencia.url}
          alt={evidencia.descripcion || `Evidencia ${ETIQUETAS_ETAPAS_EVIDENCIA[evidencia.etapa]}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2">
          <Badge variant="primary">{ETIQUETAS_ETAPAS_EVIDENCIA[evidencia.etapa]}</Badge>
        </span>
      </button>
      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-foreground" title={evidencia.descripcion ?? undefined}>
          {evidencia.descripcion || 'Sin descripción'}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-[11px] text-muted">
            {format(parseISO(evidencia.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
          </span>
          <button
            type="button"
            onClick={onEliminar}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Eliminar evidencia"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

