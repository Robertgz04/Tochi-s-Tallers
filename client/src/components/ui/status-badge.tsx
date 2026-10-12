import { Badge } from '@/components/ui/badge';
import { ETIQUETAS_ESTADOS, type EstadoOrden } from '@/types';
import type { VariantProps } from 'class-variance-authority';

type VarianteBadge = NonNullable<VariantProps<typeof Badge>['variant']>;

const COLOR_ESTADOS: Record<EstadoOrden, VarianteBadge> = {
  RECIBIDO: 'default',
  DIAGNOSTICO: 'info',
  ESPERANDO_AUTORIZACION: 'warning',
  AUTORIZADO: 'sky',
  EN_REPARACION: 'primary',
  PRUEBAS: 'violet',
  LISTO: 'success',
  ENTREGADO: 'teal',
  CANCELADO: 'danger',
};

interface PropiedadesStatusBadge {
  estado: string;
  className?: string;
}

export function StatusBadge({ estado, className }: PropiedadesStatusBadge) {
  const clave = estado as EstadoOrden;
  const etiqueta = ETIQUETAS_ESTADOS[clave] ?? estado;
  const variante = COLOR_ESTADOS[clave] ?? 'default';

  return (
    <Badge variant={variante} conPunto className={className}>
      {etiqueta}
    </Badge>
  );
}
