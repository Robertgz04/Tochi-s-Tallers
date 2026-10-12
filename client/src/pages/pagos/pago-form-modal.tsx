import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ETIQUETAS_METODO_PAGO, METODOS_PAGO, type OrdenResumen, type PayloadCrearPago } from '@/types';
import { formatMoney } from '@/lib/utils';

const esquema = z.object({
  ordenId: z.string().min(1, 'Selecciona la orden.'),
  monto: z.coerce.number().positive('El monto debe ser mayor a cero.'),
  metodoPago: z.enum(METODOS_PAGO),
  referencia: z.string().max(80).optional(),
  fechaPago: z.string().optional(),
  observaciones: z.string().max(2000).optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: PayloadCrearPago) => void;
  cargando: boolean;
  ordenes: OrdenResumen[];
}

export function PagoFormModal({ abierto, onCerrar, onGuardar, cargando, ordenes }: Propiedades) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: { ordenId: '', monto: 0, metodoPago: 'EFECTIVO', referencia: '', fechaPago: '', observaciones: '' },
  });
  const ordenesConSaldo = ordenes.filter((orden) => orden.total > 0 && !['CANCELADO'].includes(orden.estado));
  const alCerrar = () => { reset(); onCerrar(); };
  const alEnviar = handleSubmit((datos) => onGuardar({
    ordenId: datos.ordenId,
    monto: datos.monto,
    metodoPago: datos.metodoPago,
    referencia: datos.referencia || undefined,
    fechaPago: datos.fechaPago || undefined,
    observaciones: datos.observaciones || undefined,
  }));

  return (
    <Modal abierto={abierto} onCerrar={alCerrar} titulo="Registrar pago" descripcion="Asocia un abono a una orden de trabajo." ancho="md">
      <form onSubmit={alEnviar} className="space-y-4">
        <div>
          <Label htmlFor="pago-orden">Orden</Label>
          <Select id="pago-orden" error={errors.ordenId?.message} {...register('ordenId')}>
            <option value="">Selecciona orden</option>
            {ordenesConSaldo.map((orden) => (
              <option key={orden.id} value={orden.id}>{orden.folio} · {orden.cliente} · {formatMoney(orden.total)}</option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="pago-monto">Monto</Label><Input id="pago-monto" type="number" step="0.01" error={errors.monto?.message} {...register('monto', { valueAsNumber: true })} /></div>
          <div><Label htmlFor="pago-metodo">Método</Label><Select id="pago-metodo" {...register('metodoPago')}>{METODOS_PAGO.map((metodo) => <option key={metodo} value={metodo}>{ETIQUETAS_METODO_PAGO[metodo]}</option>)}</Select></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="pago-fecha">Fecha</Label><Input id="pago-fecha" type="date" {...register('fechaPago')} /></div>
          <div><Label htmlFor="pago-ref">Referencia</Label><Input id="pago-ref" placeholder="Folio SPEI, autorización..." {...register('referencia')} /></div>
        </div>
        <div><Label htmlFor="pago-obs">Observaciones</Label><Textarea id="pago-obs" {...register('observaciones')} /></div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>Cancelar</Button>
          <Button type="submit" cargando={cargando}>Registrar pago</Button>
        </div>
      </form>
    </Modal>
  );
}