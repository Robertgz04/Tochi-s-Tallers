import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ROLES, type PayloadCrearUsuario, type Rol } from '@/types';

const esquema = z.object({
  nombre: z.string().min(2, 'Ingresa el nombre.').max(80),
  apellidos: z.string().min(2, 'Ingresa los apellidos.').max(80),
  correo: z.string().min(1, 'Ingresa el correo.').email('Ingresa un correo válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  telefono: z.string().max(30).optional(),
  rol: z.enum(ROLES, { errorMap: () => ({ message: 'Selecciona un rol.' }) }),
});

type Datos = z.infer<typeof esquema>;

const ROLES_DISPONIBLES = ROLES.filter((rol) => rol !== 'SUPER_ADMIN') as readonly Rol[];

const ETIQUETAS: Record<string, string> = {
  PROPIETARIO: 'Propietario',
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  MECANICO: 'Mecánico',
};

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onCrear: (payload: PayloadCrearUsuario) => void;
  cargando: boolean;
}

export function UsuarioFormModal({ abierto, onCerrar, onCrear, cargando }: Propiedades) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    defaultValues: { rol: 'MECANICO' },
  });

  const alEnviar = handleSubmit((datos) => {
    onCrear({
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      correo: datos.correo,
      password: datos.password,
      telefono: datos.telefono || undefined,
      rol: datos.rol,
    });
    reset();
  });

  const alCerrar = () => {
    reset();
    onCerrar();
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={alCerrar}
      titulo="Nuevo miembro del equipo"
      descripcion="La persona recibirá un correo y contraseña para acceder."
    >
      <form onSubmit={alEnviar} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="u-nombre">Nombre</Label>
            <Input id="u-nombre" error={errors.nombre?.message} {...register('nombre')} />
          </div>
          <div>
            <Label htmlFor="u-apellidos">Apellidos</Label>
            <Input id="u-apellidos" error={errors.apellidos?.message} {...register('apellidos')} />
          </div>
        </div>

        <div>
          <Label htmlFor="u-correo">Correo electrónico</Label>
          <Input
            id="u-correo"
            type="email"
            placeholder="correo@ejemplo.com"
            error={errors.correo?.message}
            {...register('correo')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="u-password">Contraseña temporal</Label>
            <Input
              id="u-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          <div>
            <Label htmlFor="u-telefono">Teléfono</Label>
            <Input id="u-telefono" type="tel" {...register('telefono')} />
          </div>
        </div>

        <div>
          <Label htmlFor="u-rol">Rol</Label>
          <Select id="u-rol" error={errors.rol?.message} {...register('rol')}>
            {ROLES_DISPONIBLES.map((rol) => (
              <option key={rol} value={rol}>
                {ETIQUETAS[rol]}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>
            Cancelar
          </Button>
          <Button type="submit" cargando={cargando}>
            Agregar al equipo
          </Button>
        </div>
      </form>
    </Modal>
  );
}
