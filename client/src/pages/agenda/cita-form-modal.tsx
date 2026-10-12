import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { nombreCompleto } from '@/lib/utils';
import { ESTADOS_CITA, ETIQUETAS_CITA, type Cita, type Cliente, type PayloadCrearCita, type Usuario } from '@/types';

const esquema = z.object({
  titulo: z.string().min(3, 'Ingresa el título.').max(160),
  descripcion: z.string().max(2000).optional(),
  clienteId: z.string().optional(),
  responsableId: z.string().optional(),
  fechaInicio: z.string().min(1, 'Indica la fecha y hora de inicio.'),
  fechaFin: z.string().min(1, 'Indica la fecha y hora de fin.'),
  estado: z.enum(ESTADOS_CITA).optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: PayloadCrearCita) => void;
  cargando: boolean;
  clientes: Cliente[];
  usuarios: Usuario[];
  cita?: Cita | null;
}

function paraInput(valor: string | undefined): string {
  if (!valor) return '';
  const d = new Date(valor);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function CitaFormModal({ abierto, onCerrar, onGuardar, cargando, clientes, usuarios, cita }: Propiedades) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: {
      titulo: cita?.titulo ?? '',
      descripcion: cita?.descripcion ?? '',
      clienteId: cita?.clienteId ?? '',
      responsableId: cita?.responsableId ?? '',
      fechaInicio: cita ? paraInput(cita.fechaInicio) : '',
      fechaFin: cita ? paraInput(cita.fechaFin) : '',
      estado: cita?.estado ?? 'PROGRAMADA',
    },
  });

  const responsables = useMemo(() => usuarios.filter((u) => u.activo), [usuarios]);

  const alEnviar = handleSubmit((datos) => onGuardar({
    titulo: datos.titulo,
    descripcion: datos.descripcion || undefined,
    clienteId: datos.clienteId || undefined,
    responsableId: datos.responsableId || undefined,
    fechaInicio: new Date(datos.fechaInicio).toISOString(),
    fechaFin: new Date(datos.fechaFin).toISOString(),
    estado: datos.estado,
  }));

  const alCerrar = () => { reset(); onCerrar(); };

  return (
    <Modal abierto={abierto} onCerrar={alCerrar} titulo={cita ? 'Editar cita' : 'Nueva cita'} descripcion="Programa una cita o entrega en la agenda del taller." ancho="lg">
      <form onSubmit={alEnviar} className="space-y-4">
        <div>
          <Label htmlFor="cita-titulo">Título</Label>
          <Input id="cita-titulo" placeholder="Cambio de aceite, entrega de unidad..." error={errors.titulo?.message} {...register('titulo')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cita-inicio">Inicio</Label>
            <Input id="cita-inicio" type="datetime-local" error={errors.fechaInicio?.message} {...register('fechaInicio')} />
          </div>
          <div>
            <Label htmlFor="cita-fin">Fin</Label>
            <Input id="cita-fin" type="datetime-local" error={errors.fechaFin?.message} {...register('fechaFin')} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cita-cliente">Cliente</Label>
            <Select id="cita-cliente" {...register('clienteId')}>
              <option value="">Sin cliente</option>
              {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{nombreCompleto(cliente.nombre, cliente.apellidos)}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="cita-responsable">Responsable</Label>
            <Select id="cita-responsable" {...register('responsableId')}>
              <option value="">Sin asignar</option>
              {responsables.map((usuario) => <option key={usuario.id} value={usuario.id}>{nombreCompleto(usuario.nombre, usuario.apellidos)}</option>)}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="cita-estado">Estado</Label>
          <Select id="cita-estado" {...register('estado')}>
            {ESTADOS_CITA.map((op) => <option key={op} value={op}>{ETIQUETAS_CITA[op]}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="cita-desc">Descripción</Label>
          <Textarea id="cita-desc" {...register('descripcion')} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>Cancelar</Button>
          <Button type="submit" cargando={cargando}>{cita ? 'Guardar cambios' : 'Crear cita'}</Button>
        </div>
      </form>
    </Modal>
  );
}
