import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Cliente, PayloadCrearCliente } from '@/types';

const esquema = z.object({
  nombre: z.string().min(2, 'Ingresa el nombre.').max(80),
  apellidos: z.string().min(2, 'Ingresa los apellidos.').max(80),
  telefono: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  correo: z.string().email('Ingresa un correo válido.').or(z.literal('')).optional(),
  direccion: z.string().max(240).optional(),
  notas: z.string().max(2000).optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: PayloadCrearCliente) => void;
  cargando: boolean;
  /** Si se pasa, el modal entra en modo edición. */
  cliente?: Cliente | null;
}

export function ClienteFormModal({ abierto, onCerrar, onGuardar, cargando, cliente }: Propiedades) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: {
      nombre: cliente?.nombre ?? '',
      apellidos: cliente?.apellidos ?? '',
      telefono: cliente?.telefono ?? '',
      whatsapp: cliente?.whatsapp ?? '',
      correo: cliente?.correo ?? '',
      direccion: cliente?.direccion ?? '',
      notas: cliente?.notas ?? '',
    },
  });

  const alEnviar = handleSubmit((datos) => {
    onGuardar({
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      telefono: datos.telefono || undefined,
      whatsapp: datos.whatsapp || undefined,
      correo: datos.correo || undefined,
      direccion: datos.direccion || undefined,
      notas: datos.notas || undefined,
    });
  });

  const alCerrar = () => {
    reset();
    onCerrar();
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={alCerrar}
      titulo={cliente ? 'Editar cliente' : 'Nuevo cliente'}
      descripcion={
        cliente
          ? 'Actualiza los datos de contacto y domicilio.'
          : 'Registra a un cliente para asociarle vehículos y órdenes.'
      }
      ancho="lg"
    >
      <form onSubmit={alEnviar} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="c-nombre">Nombre</Label>
            <Input id="c-nombre" error={errors.nombre?.message} {...register('nombre')} />
          </div>
          <div>
            <Label htmlFor="c-apellidos">Apellidos</Label>
            <Input id="c-apellidos" error={errors.apellidos?.message} {...register('apellidos')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="c-telefono">Teléfono</Label>
            <Input
              id="c-telefono"
              type="tel"
              placeholder="55 1234 5678"
              error={errors.telefono?.message}
              {...register('telefono')}
            />
          </div>
          <div>
            <Label htmlFor="c-whatsapp">WhatsApp</Label>
            <Input id="c-whatsapp" type="tel" {...register('whatsapp')} />
          </div>
        </div>

        <div>
          <Label htmlFor="c-correo">Correo electrónico</Label>
          <Input
            id="c-correo"
            type="email"
            placeholder="correo@ejemplo.com"
            error={errors.correo?.message}
            {...register('correo')}
          />
        </div>

        <div>
          <Label htmlFor="c-direccion">Dirección</Label>
          <Input id="c-direccion" {...register('direccion')} />
        </div>

        <div>
          <Label htmlFor="c-notas">Notas</Label>
          <Textarea
            id="c-notas"
            placeholder="Referencias, preferencias u observaciones..."
            error={errors.notas?.message}
            {...register('notas')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>
            Cancelar
          </Button>
          <Button type="submit" cargando={cargando}>
            {cliente ? 'Guardar cambios' : 'Registrar cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
