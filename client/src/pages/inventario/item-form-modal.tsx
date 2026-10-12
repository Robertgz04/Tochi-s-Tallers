import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import type { ItemInventario, PayloadCrearItem } from '@/types';

const esquema = z.object({
  sku: z.string().min(1, 'Ingresa el SKU.').max(40),
  nombre: z.string().min(2, 'Ingresa el nombre.').max(120),
  descripcion: z.string().max(2000).optional(),
  categoria: z.string().max(60).optional(),
  unidad: z.string().max(20).optional(),
  costo: z.coerce.number().min(0).optional(),
  precio: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  stockMinimo: z.coerce.number().int().min(0).optional(),
  ubicacion: z.string().max(80).optional(),
});

type Datos = z.infer<typeof esquema>;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (payload: PayloadCrearItem) => void;
  cargando: boolean;
  item?: ItemInventario | null;
}

export function ItemFormModal({ abierto, onCerrar, onGuardar, cargando, item }: Propiedades) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Datos>({
    resolver: zodResolver(esquema),
    values: {
      sku: item?.sku ?? '',
      nombre: item?.nombre ?? '',
      descripcion: item?.descripcion ?? '',
      categoria: item?.categoria ?? '',
      unidad: item?.unidad ?? 'PZA',
      costo: item?.costo ?? 0,
      precio: item?.precio ?? 0,
      stock: item?.stock ?? 0,
      stockMinimo: item?.stockMinimo ?? 0,
      ubicacion: item?.ubicacion ?? '',
    },
  });

  const alEnviar = handleSubmit((datos) => onGuardar({
    sku: datos.sku,
    nombre: datos.nombre,
    descripcion: datos.descripcion || undefined,
    categoria: datos.categoria || undefined,
    unidad: datos.unidad || undefined,
    costo: datos.costo ?? 0,
    precio: datos.precio ?? 0,
    stock: datos.stock ?? 0,
    stockMinimo: datos.stockMinimo ?? 0,
    ubicacion: datos.ubicacion || undefined,
  }));

  const alCerrar = () => { reset(); onCerrar(); };

  return (
    <Modal abierto={abierto} onCerrar={alCerrar} titulo={item ? 'Editar producto' : 'Nuevo producto'} descripcion="Datos del producto, costos y niveles de stock." ancho="lg">
      <form onSubmit={alEnviar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="item-sku">SKU</Label>
            <Input id="item-sku" className="uppercase" error={errors.sku?.message} {...register('sku')} />
          </div>
          <div>
            <Label htmlFor="item-nombre">Nombre</Label>
            <Input id="item-nombre" error={errors.nombre?.message} {...register('nombre')} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label htmlFor="item-categoria">Categoría</Label><Input id="item-categoria" placeholder="Frenos, aceites..." {...register('categoria')} /></div>
          <div><Label htmlFor="item-unidad">Unidad</Label><Input id="item-unidad" placeholder="PZA, L, KG" {...register('unidad')} /></div>
          <div><Label htmlFor="item-ubicacion">Ubicación</Label><Input id="item-ubicacion" placeholder="Estante A1" {...register('ubicacion')} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div><Label htmlFor="item-costo">Costo</Label><Input id="item-costo" type="number" step="0.01" {...register('costo', { valueAsNumber: true })} /></div>
          <div><Label htmlFor="item-precio">Precio</Label><Input id="item-precio" type="number" step="0.01" {...register('precio', { valueAsNumber: true })} /></div>
          <div><Label htmlFor="item-stock">Stock</Label><Input id="item-stock" type="number" error={errors.stock?.message} {...register('stock', { valueAsNumber: true })} /></div>
          <div><Label htmlFor="item-min">Stock mínimo</Label><Input id="item-min" type="number" {...register('stockMinimo', { valueAsNumber: true })} /></div>
        </div>
        <div>
          <Label htmlFor="item-desc">Descripción</Label>
          <Textarea id="item-desc" {...register('descripcion')} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={alCerrar}>Cancelar</Button>
          <Button type="submit" cargando={cargando}>{item ? 'Guardar cambios' : 'Registrar producto'}</Button>
        </div>
      </form>
    </Modal>
  );
}
