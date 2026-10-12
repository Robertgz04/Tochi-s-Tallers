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
import {
  ESTADOS_COTIZACION,
  ETIQUETAS_COTIZACION,
  type Cliente,
  type CotizacionResumen,
  type OrdenResumen,
  type PayloadActualizarCotizacion,
  type PayloadCrearCotizacion,
  type Vehiculo,
} from '@/types';

const esquema = z.object({
  clienteId: z.string().min(1, 'Selecciona el cliente.'),
  vehiculoId: z.string().min(1, 'Selecciona el vehículo.'),
  ordenId: z.string().optional(),
  estado: z.enum(ESTADOS_COTIZACION).optional(),
  subtotal: z.coerce.number().min(0).optional(),
  impuestos: z.coerce.number().min(0).optional(),
  descuento: z.coerce.number().min(0).optional(),
  total: z.coerce.number().min(0).optional(),
  observaciones: z.string().max(4000).optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: PayloadCrearCotizacion | PayloadActualizarCotizacion) => void;
  cargando: boolean;
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  ordenes: OrdenResumen[];
  cotizacion?: CotizacionResumen | null;
}

export function CotizacionFormModal({
  abierto,
  onCerrar,
  onGuardar,
  cargando,
  clientes,
  vehiculos,
  ordenes,
  cotizacion,
}: Propiedades) {
  const editando = Boolean(cotizacion);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: {
      clienteId: cotizacion?.clienteId ?? '',
      vehiculoId: cotizacion?.vehiculoId ?? '',
      ordenId: cotizacion?.ordenId ?? '',
      estado: cotizacion?.estado ?? 'BORRADOR',
      subtotal: cotizacion?.subtotal ?? 0,
      impuestos: cotizacion?.impuestos ?? 0,
      descuento: cotizacion?.descuento ?? 0,
      total: cotizacion?.total ?? 0,
      observaciones: cotizacion?.observaciones ?? '',
    },
  });

  const clienteSeleccionado = watch('clienteId');
  const vehiculoSeleccionado = watch('vehiculoId');
  const vehiculosFiltrados = useMemo(
    () => (!clienteSeleccionado || editando ? vehiculos : vehiculos.filter((vehiculo) => vehiculo.clienteId === clienteSeleccionado)),
    [clienteSeleccionado, editando, vehiculos],
  );
  const ordenesFiltradas = useMemo(
    () =>
      ordenes.filter(
        (orden) =>
          (!clienteSeleccionado || orden.cliente === clientes.find((cliente) => cliente.id === clienteSeleccionado)?.nombre + ' ' + clientes.find((cliente) => cliente.id === clienteSeleccionado)?.apellidos) &&
          (!vehiculoSeleccionado || orden.placa === vehiculos.find((vehiculo) => vehiculo.id === vehiculoSeleccionado)?.placa),
      ),
    [clienteSeleccionado, clientes, ordenes, vehiculoSeleccionado, vehiculos],
  );

  const alEnviar = handleSubmit((datos) => {
    const payload = {
      ordenId: datos.ordenId || undefined,
      estado: datos.estado,
      subtotal: datos.subtotal ?? 0,
      impuestos: datos.impuestos ?? 0,
      descuento: datos.descuento ?? 0,
      total: datos.total ?? 0,
      observaciones: datos.observaciones || undefined,
    };
    if (editando) {
      onGuardar(payload);
    } else {
      onGuardar({ ...payload, clienteId: datos.clienteId, vehiculoId: datos.vehiculoId });
    }
  });

  const alCerrar = () => {
    reset();
    onCerrar();
  };

  return (
    <Modal abierto={abierto} onCerrar={alCerrar} titulo={cotizacion ? `Editar ${cotizacion.folio}` : 'Nueva cotización'} ancho="lg">
      <form onSubmit={alEnviar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cot-cliente">Cliente</Label>
            <Select id="cot-cliente" disabled={editando} error={errors.clienteId?.message} {...register('clienteId')}>
              <option value="">Selecciona cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{nombreCompleto(cliente.nombre, cliente.apellidos)}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="cot-vehiculo">Vehículo</Label>
            <Select id="cot-vehiculo" disabled={editando} error={errors.vehiculoId?.message} {...register('vehiculoId')}>
              <option value="">Selecciona vehículo</option>
              {vehiculosFiltrados.map((vehiculo) => (
                <option key={vehiculo.id} value={vehiculo.id}>{vehiculo.placa} · {vehiculo.marca} {vehiculo.modelo}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cot-orden">Orden relacionada</Label>
            <Select id="cot-orden" {...register('ordenId')}>
              <option value="">Sin orden relacionada</option>
              {ordenesFiltradas.map((orden) => (
                <option key={orden.id} value={orden.id}>{orden.folio} · {orden.placa}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="cot-estado">Estado</Label>
            <Select id="cot-estado" {...register('estado')}>
              {ESTADOS_COTIZACION.map((estado) => <option key={estado} value={estado}>{ETIQUETAS_COTIZACION[estado]}</option>)}
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div><Label htmlFor="cot-subtotal">Subtotal</Label><Input id="cot-subtotal" type="number" step="0.01" {...register('subtotal', { valueAsNumber: true })} /></div>
          <div><Label htmlFor="cot-impuestos">Impuestos</Label><Input id="cot-impuestos" type="number" step="0.01" {...register('impuestos', { valueAsNumber: true })} /></div>
          <div><Label htmlFor="cot-descuento">Descuento</Label><Input id="cot-descuento" type="number" step="0.01" {...register('descuento', { valueAsNumber: true })} /></div>
          <div><Label htmlFor="cot-total">Total</Label><Input id="cot-total" type="number" step="0.01" {...register('total', { valueAsNumber: true })} /></div>
        </div>
        <div>
          <Label htmlFor="cot-observaciones">Observaciones</Label>
          <Textarea id="cot-observaciones" {...register('observaciones')} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>Cancelar</Button>
          <Button type="submit" cargando={cargando}>{cotizacion ? 'Guardar cambios' : 'Crear cotización'}</Button>
        </div>
      </form>
    </Modal>
  );
}