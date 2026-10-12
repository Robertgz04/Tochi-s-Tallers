import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatNumber } from '@/lib/utils';
import { ETIQUETAS_MOVIMIENTO, TIPOS_MOVIMIENTO, type ItemInventario, type TipoMovimiento } from '@/types';

const esquema = z.object({
  tipo: z.enum(TIPOS_MOVIMIENTO),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser mayor a cero.'),
  motivo: z.string().max(200).optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: { itemId: string; tipo: TipoMovimiento; cantidad: number; motivo?: string }) => void;
  cargando: boolean;
  item: ItemInventario | null;
}

export function MovimientoModal({ abierto, onCerrar, onGuardar, cargando, item }: Propiedades) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: { tipo: 'ENTRADA', cantidad: 1, motivo: '' },
  });

  const alEnviar = handleSubmit((datos) => {
    if (!item) return;
    onGuardar({ itemId: item.id, tipo: datos.tipo, cantidad: datos.cantidad, motivo: datos.motivo || undefined });
  });

  const alCerrar = () => { reset(); onCerrar(); };

  return (
    <Modal abierto={abierto} onCerrar={alCerrar} titulo="Registrar movimiento" descripcion={item ? `${item.nombre} · Stock actual: ${formatNumber(item.stock)} ${item.unidad}` : ''} ancho="sm">
      <form onSubmit={alEnviar} className="space-y-4">
        <div>
          <Label htmlFor="mov-tipo">Tipo de movimiento</Label>
          <Select id="mov-tipo" {...register('tipo')}>
            {TIPOS_MOVIMIENTO.map((tipo) => <option key={tipo} value={tipo}>{ETIQUETAS_MOVIMIENTO[tipo]}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="mov-cantidad">Cantidad</Label>
          <Input id="mov-cantidad" type="number" min={1} error={errors.cantidad?.message} {...register('cantidad', { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="mov-motivo">Motivo (opcional)</Label>
          <Textarea id="mov-motivo" placeholder="Compra, consumo en orden, corrección..." {...register('motivo')} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>Cancelar</Button>
          <Button type="submit" cargando={cargando}>Registrar</Button>
        </div>
      </form>
    </Modal>
  );
}
