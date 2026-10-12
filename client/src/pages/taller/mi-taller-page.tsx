import { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BadgeCheck, Building2, CreditCard, Save } from 'lucide-react';
import { useActualizarTallerMutation, useMiTallerQuery } from '@/hooks/useQueries';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const esquema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(120),
  razonSocial: z.string().max(160).optional(),
  logoUrl: z.string().max(500).optional(),
  telefono: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  correo: z.string().email('Ingresa un correo válido.').or(z.literal('')).optional(),
  direccion: z.string().max(240).optional(),
  ciudad: z.string().max(80).optional(),
  estado: z.string().max(80).optional(),
  codigoPostal: z
    .string()
    .regex(/^\d{4,6}$/, 'Código postal inválido (4 a 6 dígitos).')
    .or(z.literal(''))
    .optional(),
  rfc: z.string().max(20).optional(),
  moneda: z.string().min(3).max(10).optional(),
  zonaHoraria: z.string().min(3).max(64).optional(),
  iva: z.coerce.number().min(0, 'IVA inválido.').max(100, 'Máximo 100%.').optional(),
  prefijoFolio: z
    .string()
    .min(1, 'El prefijo es obligatorio.')
    .max(10)
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números o guion.'),
});

type Datos = z.infer<typeof esquema>;

export default function MiTallerPage() {
  const { data, isPending, isError, error, refetch } = useMiTallerQuery();
  const actualizar = useActualizarTallerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Datos>({ resolver: zodResolver(esquema) });

  useEffect(() => {
    if (data) {
      reset({
        nombre: data.nombre,
        razonSocial: data.razonSocial ?? '',
        logoUrl: data.logoUrl ?? '',
        telefono: data.telefono ?? '',
        whatsapp: data.whatsapp ?? '',
        correo: data.correo ?? '',
        direccion: data.direccion ?? '',
        ciudad: data.ciudad ?? '',
        estado: data.estado ?? '',
        codigoPostal: data.codigoPostal ?? '',
        rfc: data.rfc ?? '',
        moneda: data.moneda,
        zonaHoraria: data.zonaHoraria,
        iva: data.iva,
        prefijoFolio: data.prefijoFolio,
      });
    }
  }, [data, reset]);

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        titulo="No pudimos cargar los datos de tu taller"
        descripcion={error instanceof Error ? error.message : 'Inténtalo nuevamente.'}
        onReintentar={() => refetch()}
      />
    );
  }

  const alGuardar = handleSubmit((datos) => {
    actualizar.mutate(datos);
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        titulo="Mi taller"
        descripcion="Datos fiscales, de contacto y configuración de folios."
        acciones={
          <Button onClick={alGuardar} cargando={actualizar.isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Guardar cambios
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <form onSubmit={alGuardar} className="space-y-4 lg:col-span-2" noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Identidad del taller
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="t-nombre">Nombre comercial</Label>
                <Input id="t-nombre" error={errors.nombre?.message} {...register('nombre')} />
              </div>
              <div>
                <Label htmlFor="t-razon">Razón social</Label>
                <Input id="t-razon" {...register('razonSocial')} />
              </div>
              <div>
                <Label htmlFor="t-rfc">RFC</Label>
                <Input id="t-rfc" placeholder="XAXX010101000" {...register('rfc')} />
              </div>
              <div>
                <Label htmlFor="t-logo">URL del logo</Label>
                <Input id="t-logo" placeholder="https://..." {...register('logoUrl')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="t-tel">Teléfono</Label>
                <Input id="t-tel" type="tel" {...register('telefono')} />
              </div>
              <div>
                <Label htmlFor="t-wa">WhatsApp</Label>
                <Input id="t-wa" type="tel" {...register('whatsapp')} />
              </div>
              <div>
                <Label htmlFor="t-correo">Correo</Label>
                <Input
                  id="t-correo"
                  type="email"
                  error={errors.correo?.message}
                  {...register('correo')}
                />
              </div>
              <div>
                <Label htmlFor="t-direccion">Dirección</Label>
                <Input id="t-direccion" {...register('direccion')} />
              </div>
              <div>
                <Label htmlFor="t-ciudad">Ciudad</Label>
                <Input id="t-ciudad" {...register('ciudad')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="t-estado">Estado</Label>
                  <Input id="t-estado" {...register('estado')} />
                </div>
                <div>
                  <Label htmlFor="t-cp">C.P.</Label>
                  <Input
                    id="t-cp"
                    inputMode="numeric"
                    error={errors.codigoPostal?.message}
                    {...register('codigoPostal')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración comercial</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="t-iva">IVA (%)</Label>
                <Input
                  id="t-iva"
                  type="number"
                  step="0.5"
                  error={errors.iva?.message}
                  {...register('iva', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="t-moneda">Moneda</Label>
                <Input id="t-moneda" {...register('moneda')} />
              </div>
              <div>
                <Label htmlFor="t-prefijo">Prefijo de folio</Label>
                <Input
                  id="t-prefijo"
                  placeholder="TCH"
                  error={errors.prefijoFolio?.message}
                  {...register('prefijoFolio')}
                />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="t-zona">Zona horaria</Label>
                <Input id="t-zona" {...register('zonaHoraria')} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end lg:hidden">
            <Button type="submit" cargando={actualizar.isPending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Guardar cambios
            </Button>
          </div>
        </form>

        {/* Resumen de suscripción */}
        <aside className="h-fit space-y-4">
          <Card className="border-primary/25 bg-gradient-to-b from-primary/[0.07] to-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
                Suscripción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Plan actual</span>
                <Badge variant="primary">{data.plan}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Estado</span>
                <Badge variant={data.estadoSuscripcion === 'ACTIVA' ? 'success' : 'danger'}>
                  {data.estadoSuscripcion}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Vigencia</span>
                <span className="font-medium text-foreground">
                  {data.fechaVencimiento
                    ? format(parseISO(data.fechaVencimiento), "d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">IVA configurado</span>
                <span className="font-medium text-foreground">{data.iva}%</span>
              </div>
              <p className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted">
                <BadgeCheck className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                Folios: {data.prefijoFolio}-000001
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
