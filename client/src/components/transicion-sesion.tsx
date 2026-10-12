import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { cn, iniciales, saludoPorHora } from '@/lib/utils';
import { useSesionTransicionStore } from '@/store/sesionTransicionStore';
import type { Taller } from '@/types';

/** Radio del anillo de cuenta regresiva (coincide con el viewBox 0 0 120 120). */
const RADIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;
/** Duración de la animación de salida antes de ejecutar la redirección. */
const DURACION_SALIDA_MS = 240;
/** Intervalo del reloj de la cuenta regresiva. */
const TICK_MS = 100;

/**
 * Pantalla a pantalla completa que se muestra al iniciar y al cerrar sesión:
 * saludo/despedida, cuenta regresiva de 3 segundos y redirección automática.
 */
export function TransicionSesion() {
  const transicion = useSesionTransicionStore((estado) => estado.transicion);
  const completar = useSesionTransicionStore((estado) => estado.completar);
  const queryClient = useQueryClient();

  const [restante, setRestante] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);
  const temporizadorSalida = useRef<number | null>(null);

  // Nombre del taller si ya está en caché (no dispara peticiones extra).
  const nombreTaller = useMemo(
    () => (transicion ? queryClient.getQueryData<Taller>(['taller'])?.nombre : undefined),
    [queryClient, transicion],
  );

  /** Ejecuta la salida animada y luego la redirección pendiente. */
  const terminar = useCallback(() => {
    setSaliendo(true);
    if (temporizadorSalida.current !== null) window.clearTimeout(temporizadorSalida.current);
    temporizadorSalida.current = window.setTimeout(() => completar(), DURACION_SALIDA_MS);
  }, [completar]);

  // Cuenta regresiva.
  useEffect(() => {
    if (!transicion) return;

    const total = transicion.segundos;
    const inicio = Date.now();
    setRestante(total);
    setSaliendo(false);
    botonRef.current?.focus();

    const intervalo = window.setInterval(() => {
      const elapsed = (Date.now() - inicio) / 1000;
      const restanteActual = Math.max(0, total - elapsed);
      setRestante(Math.ceil(restanteActual));
      if (restanteActual <= 0) {
        window.clearInterval(intervalo);
        terminar();
      }
    }, TICK_MS);

    return () => window.clearInterval(intervalo);
  }, [transicion, terminar]);

  // Bloquea el scroll del documento mientras la pantalla está activa.
  useEffect(() => {
    if (!transicion) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [transicion]);

  // Limpia temporizadores si el componente se desmonta con la transición activa.
  useEffect(
    () => () => {
      if (temporizadorSalida.current !== null) window.clearTimeout(temporizadorSalida.current);
    },
    [],
  );

  if (!transicion) return null;

  const esBienvenida = transicion.tipo === 'BIENVENIDA';
  const total = Math.max(1, transicion.segundos);
  const avatar = iniciales(transicion.nombre, transicion.apellidos);
  const progreso = Math.max(0, Math.min(1, restante / total));
  const Icono = esBienvenida ? ShieldCheck : LogOut;
  const acento = esBienvenida ? 'bg-primary' : 'bg-destructive';
  const anillo = esBienvenida ? 'stroke-primary' : 'stroke-destructive';
  const textoAcento = esBienvenida ? 'text-primary' : 'text-destructive';

  const titulo = esBienvenida
    ? `${saludoPorHora()}, ${transicion.nombre}`
    : `Hasta luego, ${transicion.nombre}`;

  const descripcion = esBienvenida
    ? nombreTaller
      ? `Sesión iniciada. Redirigiendo a ${nombreTaller}…`
      : 'Sesión iniciada. Redirigiendo a tu taller…'
    : 'Cerrando tu sesión de forma segura. Regresando al inicio de sesión…';

  const accion = esBienvenida ? 'Entrar ahora' : 'Ir al inicio de sesión';
  const pie = esBienvenida ? 'Redirigiendo a tu panel' : 'Regresando al inicio de sesión';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={esBienvenida ? 'Sesión iniciada' : 'Cerrando sesión'}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-5 py-10',
        saliendo ? 'animate-fade-out' : 'animate-fade-in',
      )}
    >
      {/* Fondo: velo oscuro, rejilla del taller y halo ámbar */}
      <div className="absolute inset-0 bg-background/97 backdrop-blur-2xl" aria-hidden="true" />
      <div className="rejilla-taller pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(245,158,11,0.16), transparent 62%)',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md animate-rise select-none">
        <div className="rounded-3xl border border-border bg-card/95 p-8 text-center shadow-[0_28px_80px_-28px_rgba(0,0,0,0.95)] sm:p-10">
          <div className="flex justify-center">
            <Logo />
          </div>

          {/* Avatar con insignia animada */}
          <div className="relative mx-auto mt-8 h-24 w-24">
            <span className="absolute inset-0 rounded-full bg-primary/25 animate-halo" aria-hidden="true" />
            <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-2xl font-bold text-primary">
              {avatar}
            </span>
            <span
              className={cn(
                'absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full border-2 border-card animate-pop-in',
                acento,
                esBienvenida ? 'text-primary-foreground' : 'text-white',
              )}
              style={{ animationDelay: '220ms' }}
              aria-hidden="true"
            >
              <Icono className="h-5 w-5" />
            </span>
          </div>

          <h2
            className="mt-7 text-2xl font-bold tracking-tight text-foreground animate-rise"
            style={{ animationDelay: '120ms' }}
          >
            {titulo}
          </h2>
          <p className="mt-2 text-sm text-muted animate-rise" style={{ animationDelay: '200ms' }}>
            {descripcion}
          </p>

          {/* Anillo de cuenta regresiva */}
          <div
            className="relative mx-auto mt-8 h-32 w-32 animate-pop-in"
            style={{ animationDelay: '260ms' }}
          >
            <span className="absolute inset-4 rounded-full bg-primary/10 blur-lg" aria-hidden="true" />
            <svg viewBox="0 0 120 120" className="relative h-full w-full -rotate-90" aria-hidden="true">
              <circle
                cx="60"
                cy="60"
                r={RADIO}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUNFERENCIA}
                strokeDashoffset={0}
                className="stroke-border"
              />
              <circle
                cx="60"
                cy="60"
                r={RADIO}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUNFERENCIA}
                strokeDashoffset={CIRCUNFERENCIA * (1 - progreso)}
                className={anillo}
                style={{ transition: `stroke-dashoffset ${TICK_MS}ms linear` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-4xl font-bold tabular-nums', textoAcento)}>{restante}</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                seg
              </span>
            </div>
          </div>

          {/* Barra de progreso lineal */}
          <div
            className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-surface"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={restante}
            aria-label="Tiempo restante para continuar"
          >
            <div
              className={cn('h-full rounded-full', acento)}
              style={{ width: `${progreso * 100}%`, transition: `width ${TICK_MS}ms linear` }}
            />
          </div>

          <p className="mt-4 text-xs text-muted" aria-live="polite">
            {restante > 0
              ? `Continuaremos automáticamente en ${restante} segundo${restante === 1 ? '' : 's'}.`
              : 'Continuando…'}
          </p>

          <Button
            ref={botonRef}
            type="button"
            variant={esBienvenida ? 'primary' : 'secondary'}
            size="lg"
            className="mt-6 w-full"
            onClick={terminar}
            disabled={saliendo}
          >
            {accion}
          </Button>
        </div>

        <p className="mt-5 text-center text-xs text-muted">{pie}</p>
      </div>
    </div>,
    document.body,
  );
}