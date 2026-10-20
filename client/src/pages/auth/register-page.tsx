import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { mensajeError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSesionTransicion } from '@/hooks/useSesionTransicion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

const esquema = z.object({
  nombreTaller: z.string().min(2, 'Ingresa el nombre de tu taller.').max(120),
  nombre: z.string().min(2, 'Ingresa tu nombre.').max(80),
  apellidos: z.string().min(2, 'Ingresa tus apellidos.').max(80),
  correo: z.string().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(72, 'Máximo 72 caracteres.'),
  telefono: z.string().max(30).optional(),
});

type Datos = z.infer<typeof esquema>;

export default function RegisterPage() {
  const token = useAuthStore((estado) => estado.token);
  const establecerSesion = useAuthStore((estado) => estado.establecerSesion);
  const { bienvenida } = useSesionTransicion();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Datos>({ resolver: zodResolver(esquema) });

  if (token) return <Navigate to="/dashboard" replace />;

  const alRegistrar = handleSubmit(async (datos) => {
    try {
      const resultado = await authService.registro({
        taller: { nombre: datos.nombreTaller },
        usuario: {
          nombre: datos.nombre,
          apellidos: datos.apellidos,
          correo: datos.correo,
          password: datos.password,
          telefono: datos.telefono || undefined,
        },
      });
      // La sesión se activa al terminar la pantalla de bienvenida (3 s).
      bienvenida(resultado.usuario, {
        destino: '/dashboard',
        alIniciar: () => establecerSesion(resultado.token, resultado.usuario),
      });
    } catch (err) {
      setError('root', { message: mensajeError(err, 'No pudimos crear tu cuenta.') });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-lg animate-fade-in">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a iniciar sesión
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-card to-surface p-6 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-transparent before:via-primary/50 before:to-transparent">
          <Logo />
          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Crea tu taller
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Empieza con 14 días gratis. Sin tarjeta de crédito requerida.
          </p>

          <form onSubmit={alRegistrar} className="mt-7 space-y-4" noValidate>
            {errors.root && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {errors.root.message}
              </div>
            )}

            <div>
              <Label htmlFor="nombreTaller">Nombre del taller</Label>
              <Input
                id="nombreTaller"
                placeholder="Ej: Taller García"
                error={errors.nombreTaller?.message}
                {...register('nombreTaller')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nombre">Tu nombre</Label>
                <Input
                  id="nombre"
                  autoComplete="given-name"
                  error={errors.nombre?.message}
                  {...register('nombre')}
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Tus apellidos</Label>
                <Input
                  id="apellidos"
                  autoComplete="family-name"
                  error={errors.apellidos?.message}
                  {...register('apellidos')}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  error={errors.correo?.message}
                  {...register('correo')}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input id="telefono" type="tel" {...register('telefono')} />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" cargando={isSubmitting}>
              Crear mi taller
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
