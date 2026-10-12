import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { COMBUSTIBLES, ETIQUETAS_COMBUSTIBLE, TRANSMISIONES, ETIQUETAS_TRANSMISION } from '@/types';
import type { Cliente, PayloadCrearVehiculo, Vehiculo } from '@/types';

const esquema = z.object({
  clienteId: z.string().min(1, 'Selecciona el cliente dueño del vehículo.'),
  placa: z.string().min(3, 'La placa debe tener al menos 3 caracteres.').max(15),
  vin: z.string().max(20).optional(),
  marca: z.string().min(2, 'Ingresa la marca.').max(60),
  modelo: z.string().min(1, 'Ingresa el modelo.').max(60),
  anio: z.coerce.number().int('Año inválido.').min(1900).max(2100).optional().nullable(),
  color: z.string().max(40).optional(),
  motor: z.string().max(60).optional(),
  kilometraje: z.coerce.number().min(0, 'No puede ser negativo.').optional(),
  combustible: z.enum(COMBUSTIBLES).optional(),
  transmision: z.enum(TRANSMISIONES).or(z.literal('')).optional(),
  notas: z.string().max(2000).optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: PayloadCrearVehiculo) => void;
  cargando: boolean;
  clientes: Cliente[];
  /** Si se pasa, el modal entra en modo edición. */
  vehiculo?: Vehiculo | null;
}

export function VehiculoFormModal({
  abierto,
  onCerrar,
  onGuardar,
  cargando,
  clientes,
  vehiculo,
}: Propiedades) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: {
      clienteId: vehiculo?.clienteId ?? '',
      placa: vehiculo?.placa ?? '',
      vin: vehiculo?.vin ?? '',
      marca: vehiculo?.marca ?? '',
      modelo: vehiculo?.modelo ?? '',
      anio: vehiculo?.anio ?? undefined,
      color: vehiculo?.color ?? '',
      motor: vehiculo?.motor ?? '',
      kilometraje: vehiculo?.kilometraje ?? 0,
      combustible: vehiculo?.combustible ?? 'GASOLINA',
      transmision: vehiculo?.transmision ?? '',
      notas: vehiculo?.notas ?? '',
    },
  });

  const alEnviar = handleSubmit((datos) => {
    onGuardar({
      clienteId: datos.clienteId,
      placa: datos.placa,
      vin: datos.vin || undefined,
      marca: datos.marca,
      modelo: datos.modelo,
      anio: datos.anio ?? undefined,
      color: datos.color || undefined,
      motor: datos.motor || undefined,
      kilometraje: datos.kilometraje ?? 0,
      combustible: datos.combustible ?? 'GASOLINA',
      transmision: datos.transmision || undefined,
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
      titulo={vehiculo ? 'Editar vehículo' : 'Nuevo vehículo'}
      descripcion={
        vehiculo
          ? 'Actualiza los datos técnicos del vehículo.'
          : 'Registra un vehículo y asígnalo a su propietario.'
      }
      ancho="lg"
    >
      <form onSubmit={alEnviar} className="space-y-4" noValidate>
        {!vehiculo && (
          <div>
            <Label htmlFor="v-cliente">Propietario</Label>
            <Select id="v-cliente" error={errors.clienteId?.message} {...register('clienteId')}>
              <option value="">Selecciona un cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellidos}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="v-placa">Placa</Label>
            <Input
              id="v-placa"
              placeholder="ABC-123-A"
              className="uppercase"
              error={errors.placa?.message}
              {...register('placa')}
            />
          </div>
          <div>
            <Label htmlFor="v-marca">Marca</Label>
            <Input id="v-marca" placeholder="Nissan" error={errors.marca?.message} {...register('marca')} />
          </div>
          <div>
            <Label htmlFor="v-modelo">Modelo</Label>
            <Input id="v-modelo" placeholder="Versa" error={errors.modelo?.message} {...register('modelo')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="v-anio">Año</Label>
            <Input
              id="v-anio"
              type="number"
              placeholder="2021"
              error={errors.anio?.message}
              {...register('anio', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="v-color">Color</Label>
            <Input id="v-color" placeholder="Blanco" {...register('color')} />
          </div>
          <div>
            <Label htmlFor="v-km">Kilometraje</Label>
            <Input
              id="v-km"
              type="number"
              placeholder="0"
              error={errors.kilometraje?.message}
              {...register('kilometraje', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="v-combustible">Combustible</Label>
            <Select id="v-combustible" {...register('combustible')}>
              {COMBUSTIBLES.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETAS_COMBUSTIBLE[tipo]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="v-transmision">Transmisión</Label>
            <Select id="v-transmision" error={errors.transmision?.message} {...register('transmision')}>
              <option value="">Sin especificar</option>
              {TRANSMISIONES.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETAS_TRANSMISION[tipo]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="v-vin">VIN (opcional)</Label>
            <Input id="v-vin" placeholder="17 caracteres" error={errors.vin?.message} {...register('vin')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="v-motor">Motor (opcional)</Label>
            <Input id="v-motor" placeholder="1.6L" {...register('motor')} />
          </div>
          <div>
            <Label htmlFor="v-notas">Notas</Label>
            <Textarea
              id="v-notas"
              placeholder="Detalles adicionales sobre el vehículo..."
              error={errors.notas?.message}
              {...register('notas')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>
            Cancelar
          </Button>
          <Button type="submit" cargando={cargando}>
            {vehiculo ? 'Guardar cambios' : 'Registrar vehículo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

