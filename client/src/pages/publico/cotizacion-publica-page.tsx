import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, MessageCircle, Phone, XCircle } from 'lucide-react';
import { cotizacionPublicoService } from '@/services/cotizacionPublico.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/utils';
import { ETIQUETAS_COTIZACION, type CotizacionPublica } from '@/types';

type Vista = 'cargando' | 'lista' | 'respondida' | 'error';

export default function CotizacionPublicaPage() {
  const { token = '' } = useParams();
  const [vista, setVista] = useState<Vista>('cargando');
  const [datos, setDatos] = useState<CotizacionPublica | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vigente = true;
    cotizacionPublicoService
      .obtener(token)
      .then((cot) => {
        if (!vigente) return;
        setDatos(cot);
        setVista(cot.puedeResponder ? 'lista' : 'respondida');
      })
      .catch((error) => {
        if (!vigente) return;
        setMensaje(error?.response?.data?.message ?? 'No pudimos abrir esta cotización.');
        setVista('error');
      });
    return () => {
      vigente = false;
    };
  }, [token]);

  const responder = async (aprobada: boolean) => {
    setEnviando(true);
    try {
      const cot = await cotizacionPublicoService.responder(token, aprobada);
      setDatos(cot);
      setVista('respondida');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMensaje(msg ?? 'No pudimos registrar tu respuesta. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (vista === 'cargando') {
    return (
      <Pantalla>
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Cargando cotización...
        </div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </Pantalla>
    );
  }

  if (vista === 'error') {
    return (
      <Pantalla>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <XCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
          <h1 className="text-lg font-bold text-foreground">Enlace no válido</h1>
          <p className="max-w-sm text-sm text-muted">{mensaje}</p>
        </div>
      </Pantalla>
    );
  }

  if (!datos) return null;
  const moneda = datos.taller.moneda;

  return (
    <Pantalla>
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-lg font-extrabold tracking-tight text-foreground">{datos.taller.nombre}</p>
          <p className="text-xs text-muted">Cotización {datos.folio}</p>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          {ETIQUETAS_COTIZACION[datos.estado] ?? datos.estado}
        </span>
      </div>

      {vista === 'respondida' ? (
        <RespuestaEstado estado={datos.estado} />
      ) : (
        <p className="rounded-xl border border-border bg-surface p-3 text-sm text-muted">
          Revisa los detalles y responde para autorizar o rechazar este trabajo.
        </p>
      )}

      <Seccion titulo="Vehículo">
        <Fila etiqueta="Descripción" valor={datos.vehiculo.descripcion} />
        <Fila etiqueta="Placa" valor={datos.vehiculo.placa} />
        {datos.vehiculo.kilometraje != null && (
          <Fila etiqueta="Kilometraje" valor={new Intl.NumberFormat('es-MX').format(datos.vehiculo.kilometraje) + ' km'} />
        )}
      </Seccion>

      <Seccion titulo="Importes">
        <Fila etiqueta="Subtotal" valor={formatMoney(datos.subtotal, moneda)} />
        <Fila etiqueta="Impuestos" valor={formatMoney(datos.impuestos, moneda)} />
        {datos.descuento > 0 && <Fila etiqueta="Descuento" valor={'-' + formatMoney(datos.descuento, moneda)} />}
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold tabular-nums text-primary">{formatMoney(datos.total, moneda)}</span>
        </div>
      </Seccion>

      {datos.observaciones && (
        <Seccion titulo="Observaciones">
          <p className="text-sm text-muted">{datos.observaciones}</p>
        </Seccion>
      )}

      {vista === 'lista' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="success" size="lg" cargando={enviando} onClick={() => responder(true)}>
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Aprobar
            </Button>
            <Button variant="danger" size="lg" cargando={enviando} onClick={() => responder(false)}>
              <XCircle className="h-5 w-5" aria-hidden="true" /> Rechazar
            </Button>
          </div>
          {mensaje && <p className="text-center text-sm text-destructive">{mensaje}</p>}
        </>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border pt-4 text-xs text-muted">
        {datos.taller.telefono && (
          <a className="flex items-center gap-1.5 hover:text-foreground" href={`tel:${datos.taller.telefono}`}>
            <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {datos.taller.telefono}
          </a>
        )}
        {datos.taller.whatsapp && (
          <a className="flex items-center gap-1.5 hover:text-foreground" href={`https://wa.me/${datos.taller.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
          </a>
        )}
        {datos.taller.correo && (
          <a className="flex items-center gap-1.5 hover:text-foreground" href={`mailto:${datos.taller.correo}`}>
            {datos.taller.correo}
          </a>
        )}
      </div>
    </Pantalla>
  );
}

function Pantalla({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-background p-4 sm:items-center">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.35)] animate-fade-in">
        {children}
      </div>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{titulo}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{etiqueta}</span>
      <span className="text-right font-medium text-foreground">{valor}</span>
    </div>
  );
}

function RespuestaEstado({ estado }: { estado: string }) {
  if (estado === 'APROBADA') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-success" aria-hidden="true" />
        <div>
          <p className="font-semibold text-success">¡Gracias! Cotización aprobada</p>
          <p className="text-sm text-muted">El taller ha sido notificado y comenzará el trabajo.</p>
        </div>
      </div>
    );
  }
  if (estado === 'RECHAZADA') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
        <XCircle className="h-6 w-6 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-semibold text-destructive">Cotización rechazada</p>
          <p className="text-sm text-muted">Se informó al taller tu decisión. Puedes contactarlos si lo deseas.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <p className="font-semibold text-foreground">Esta cotización ya fue respondida</p>
        <p className="text-sm text-muted">Estado actual: {ETIQUETAS_COTIZACION[estado as keyof typeof ETIQUETAS_COTIZACION] ?? estado}.</p>
      </div>
    </div>
  );
}
