import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, Wrench } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { mensajeError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSesionTransicion } from '@/hooks/useSesionTransicion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Logo } from '@/components/logo';

const esquemaLogin = z.object({
  correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

type DatosLogin = z.infer<typeof esquemaLogin>;

const esquemaRecuperar = z.object({
  correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
});

type DatosRecuperar = z.infer<typeof esquemaRecuperar>;

export default function LoginPage() {
  const token = useAuthStore((estado) => estado.token);
  const establecerSesion = useAuthStore((estado) => estado.establecerSesion);
  const { bienvenida } = useSesionTransicion();
  const location = useLocation();
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recuperarAbierto, setRecuperarAbierto] = useState(false);

  const destino = (location.state as { desde?: string } | null)?.desde ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosLogin>({ resolver: zodResolver(esquemaLogin) });

  const {
    register: registerRecuperar,
    handleSubmit: handleSubmitRecuperar,
    formState: { errors: erroresRecuperar, isSubmitting: enviandoRecuperacion },
    reset: resetRecuperar,
  } = useForm<DatosRecuperar>({ resolver: zodResolver(esquemaRecuperar) });

  if (token) return <Navigate to="/dashboard" replace />;

  const alIniciarSesion = handleSubmit(async (datos) => {
    try {
      setError(null);
      const sesion = await authService.login(datos.correo, datos.password);
      // La sesión se activa al terminar la pantalla de bienvenida (3 s).
      bienvenida(sesion.usuario, {
        destino,
        alIniciar: () => establecerSesion(sesion.token, sesion.usuario),
      });
    } catch (err) {
      setError(mensajeError(err, 'No pudimos iniciar sesión. Intenta de nuevo.'));
    }
  });

  const alRecuperar = handleSubmitRecuperar(async (datos) => {
    try {
      const resultado = await authService.solicitarRecuperacion(datos.correo);
      toast.success(resultado.mensaje);
      resetRecuperar();
      setRecuperarAbierto(false);
    } catch (err) {
      toast.error(mensajeError(err, 'No pudimos procesar la solicitud.'));
    }
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Panel de marca (escritorio) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.08] bg-surface p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-32 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[100px]"
          aria-hidden="true"
        />
        <Logo />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-[0_0_12px_rgba(245,158,11,0.15)] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Software Automotriz Profesional
          </div>
          <h2 className="max-w-md text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            Tu taller, bajo control.
            <span className="text-primary block mt-1">Sin libretas, sin pérdidas.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Administra clientes, vehículos, órdenes de trabajo, cotizaciones con enlace público y cobros
            desde una sola aplicación rápida y moderna.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-card px-3.5 py-2 font-semibold text-foreground shadow-sm">
              <Wrench className="h-4 w-4 text-primary" aria-hidden="true" /> Hecho para talleres
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-card px-3.5 py-2 font-semibold text-foreground shadow-sm">
              <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" /> Datos 100% seguros
            </span>
          </div>
        </div>
        <p className="relative z-10 text-xs text-muted">
          &copy; {new Date().getFullYear()} Tochi&rsquo;sTaller · Todos los derechos reservados
        </p>
      </div>

      {/* Formulario */}
      <div className="flex w-full items-center justify-center px-5 py-10 sm:px-10">
        <div className="relative w-full max-w-md animate-fade-in overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-card to-surface p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent">
          <div className="mb-8">
            <Logo />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Inicia sesión</h1>
          <p className="mt-1.5 text-sm text-muted">
            Accede al panel de administración de tu taller.
          </p>

          <form onSubmit={alIniciarSesion} className="mt-8 space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
              >
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                error={errors.correo?.message}
                {...register('correo')}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label htmlFor="password" className="mb-0">
                  Contraseña
                </Label>
                <button
                  type="button"
                  onClick={() => setVerPassword((valor) => !valor)}
                  className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
                >
                  {verPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {verPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              <Input
                id="password"
                type={verPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" cargando={isSubmitting}>
              Entrar a mi taller
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setRecuperarAbierto(true)}
                className="text-sm font-medium text-muted transition-colors hover:text-primary"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-primary hover:text-primary-hover">
              Crea tu taller gratis
            </Link>
          </p>
        </div>
      </div>

      <Modal
        abierto={recuperarAbierto}
        onCerrar={() => setRecuperarAbierto(false)}
        titulo="Recuperar contraseña"
        descripcion="Te enviaremos las instrucciones a tu correo electrónico."
        ancho="sm"
      >
        <form onSubmit={alRecuperar} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="correo-recuperar">Correo electrónico</Label>
            <Input
              id="correo-recuperar"
              type="email"
              placeholder="tucorreo@ejemplo.com"
              error={erroresRecuperar.correo?.message}
              {...registerRecuperar('correo')}
            />
          </div>
          <Button type="submit" className="w-full" cargando={enviandoRecuperacion}>
            Enviar instrucciones
          </Button>
        </form>
      </Modal>
    </div>
  );
}
