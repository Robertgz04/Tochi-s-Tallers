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
import {
  ETIQUETAS_NIVEL_COMBUSTIBLE,
  NIVELES_COMBUSTIBLE,
  type Cliente,
  type NivelCombustible,
  type OrdenDetalle,
  type PayloadActualizarOrden,
  type PayloadCrearOrden,
  type Usuario,
  type Vehiculo,
} from '@/types';
import { nombreCompleto } from '@/lib/utils';
import { EvidenciasOrden } from '@/pages/ordenes/evidencias-orden';

const esquema = z.object({
  clienteId: z.string().min(1, 'Selecciona el cliente.'),
  vehiculoId: z.string().min(1, 'Selecciona el vehículo.'),
  mecanicoId: z.string().optional(),
  fechaEstimada: z.string().optional(),
  kilometrajeEntrada: z.coerce.number().min(0, 'No puede ser negativo.').optional(),
  nivelCombustible: z.enum(NIVELES_COMBUSTIBLE).optional(),
  descripcionCliente: z.string().trim().min(3, 'Describe el motivo de la visita.').max(2000),
  diagnostico: z.string().trim().max(4000).optional(),
  observaciones: z.string().trim().max(4000).optional(),
  subtotal: z.coerce.number().min(0, 'No puede ser negativo.').optional(),
  impuestos: z.coerce.number().min(0, 'No puede ser negativo.').optional(),
  descuento: z.coerce.number().min(0, 'No puede ser negativo.').optional(),
  total: z.coerce.number().min(0, 'No puede ser negativo.').optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: PayloadCrearOrden | PayloadActualizarOrden) => void;
  cargando: boolean;
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  usuarios: Usuario[];
  orden?: OrdenDetalle | null;
}

function fechaParaInput(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor.slice(0, 10);
}

export function OrdenFormModal({
  abierto,
  onCerrar,
  onGuardar,
  cargando,
  clientes,
  vehiculos,
  usuarios,
  orden,
}: Propiedades) {
  const editando = Boolean(orden);
  const mecanicos = useMemo(
    () => usuarios.filter((usuario) => usuario.activo && ['MECANICO', 'ADMINISTRADOR', 'PROPIETARIO'].includes(usuario.rol)),
    [usuarios],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: {
      clienteId: orden?.clienteId ?? '',
      vehiculoId: orden?.vehiculoId ?? '',
      mecanicoId: orden?.mecanicoId ?? '',
      fechaEstimada: fechaParaInput(orden?.fechaEstimada),
      kilometrajeEntrada: orden?.kilometrajeEntrada ?? 0,
      nivelCombustible: orden?.nivelCombustible ?? 'MITAD',
      descripcionCliente: orden?.descripcionCliente ?? '',
      diagnostico: orden?.diagnostico ?? '',
      observaciones: orden?.observaciones ?? '',
      subtotal: orden?.subtotal ?? 0,
      impuestos: orden?.impuestos ?? 0,
      descuento: orden?.descuento ?? 0,
      total: orden?.total ?? 0,
    },
  });

  const clienteSeleccionado = watch('clienteId');
  const vehiculosFiltrados = useMemo(() => {
    if (editando || !clienteSeleccionado) return vehiculos;
    return vehiculos.filter((vehiculo) => vehiculo.clienteId === clienteSeleccionado);
  }, [clienteSeleccionado, editando, vehiculos]);

  const alEnviar = handleSubmit((datos) => {
    if (editando) {
      onGuardar({
        mecanicoId: datos.mecanicoId || undefined,
        fechaEstimada: datos.fechaEstimada || undefined,
        nivelCombustible: datos.nivelCombustible,
        descripcionCliente: datos.descripcionCliente,
        diagnostico: datos.diagnostico || undefined,
        observaciones: datos.observaciones || undefined,
        subtotal: datos.subtotal ?? 0,
        impuestos: datos.impuestos ?? 0,
        descuento: datos.descuento ?? 0,
        total: datos.total ?? 0,
      });
      return;
    }

    onGuardar({
      clienteId: datos.clienteId,
      vehiculoId: datos.vehiculoId,
      mecanicoId: datos.mecanicoId || undefined,
      fechaEstimada: datos.fechaEstimada || undefined,
      kilometrajeEntrada: datos.kilometrajeEntrada ?? 0,
      nivelCombustible: datos.nivelCombustible ?? 'MITAD',
      descripcionCliente: datos.descripcionCliente,
      diagnostico: datos.diagnostico || undefined,
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
      titulo={orden ? `Editar orden ${orden.folio}` : 'Nueva orden de trabajo'}
      descripcion="Registra el ingreso del vehículo, asigna responsable, documenta el motivo y gestiona sus fotos."
      ancho="lg"
    >
      <form onSubmit={alEnviar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="orden-cliente">Cliente</Label>
            <Select id="orden-cliente" disabled={editando} error={errors.clienteId?.message} {...register('clienteId')}>
              <option value="">Selecciona cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {nombreCompleto(cliente.nombre, cliente.apellidos)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="orden-vehiculo">Vehículo</Label>
            <Select id="orden-vehiculo" disabled={editando} error={errors.vehiculoId?.message} {...register('vehiculoId')}>
              <option value="">Selecciona vehículo</option>
              {vehiculosFiltrados.map((vehiculo) => (
                <option key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.placa} · {vehiculo.marca} {vehiculo.modelo}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="orden-mecanico">Responsable</Label>
            <Select id="orden-mecanico" error={errors.mecanicoId?.message} {...register('mecanicoId')}>
              <option value="">Sin asignar</option>
              {mecanicos.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {nombreCompleto(usuario.nombre, usuario.apellidos)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="orden-fecha">Fecha estimada</Label>
            <Input id="orden-fecha" type="date" error={errors.fechaEstimada?.message} {...register('fechaEstimada')} />
          </div>
          <div>
            <Label htmlFor="orden-km">Kilometraje entrada</Label>
            <Input
              id="orden-km"
              type="number"
              disabled={editando}
              error={errors.kilometrajeEntrada?.message}
              {...register('kilometrajeEntrada', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="orden-combustible">Nivel de combustible</Label>
          <Select id="orden-combustible" {...register('nivelCombustible')}>
            {NIVELES_COMBUSTIBLE.map((nivel: NivelCombustible) => (
              <option key={nivel} value={nivel}>
                {ETIQUETAS_NIVEL_COMBUSTIBLE[nivel]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="orden-descripcion">Motivo de visita</Label>
          <Textarea
            id="orden-descripcion"
            placeholder="Describe la falla, solicitud del cliente o servicio requerido..."
            error={errors.descripcionCliente?.message}
            {...register('descripcionCliente')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="orden-diagnostico">Diagnóstico</Label>
            <Textarea id="orden-diagnostico" error={errors.diagnostico?.message} {...register('diagnostico')} />
          </div>
          {editando && (
            <div>
              <Label htmlFor="orden-observaciones">Observaciones</Label>
              <Textarea id="orden-observaciones" error={errors.observaciones?.message} {...register('observaciones')} />
            </div>
          )}
        </div>

        {editando && (
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="orden-subtotal">Subtotal</Label>
              <Input id="orden-subtotal" type="number" step="0.01" {...register('subtotal', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="orden-impuestos">Impuestos</Label>
              <Input id="orden-impuestos" type="number" step="0.01" {...register('impuestos', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="orden-descuento">Descuento</Label>
              <Input id="orden-descuento" type="number" step="0.01" {...register('descuento', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="orden-total">Total</Label>
              <Input id="orden-total" type="number" step="0.01" {...register('total', { valueAsNumber: true })} />
            </div>
          </div>
        )}

        {editando && orden && (
          <EvidenciasOrden ordenId={orden.id} folio={orden.folio} />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>
            Cancelar
          </Button>
          <Button type="submit" cargando={cargando}>
            {orden ? 'Guardar cambios' : 'Crear orden'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}