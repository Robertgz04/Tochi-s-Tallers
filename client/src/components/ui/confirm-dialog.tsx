import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface PropiedadesConfirmDialog {
  abierto: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligro?: boolean;
  cargando?: boolean;
}

export function ConfirmDialog({
  abierto,
  onCancelar,
  onConfirmar,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligro = false,
  cargando = false,
}: PropiedadesConfirmDialog) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCancelar}
      titulo={titulo}
      ancho="sm"
      pie={
        <>
          <Button variant="ghost" onClick={onCancelar} disabled={cargando}>
            {textoCancelar}
          </Button>
          <Button
            variant={peligro ? 'danger' : 'primary'}
            onClick={onConfirmar}
            cargando={cargando}
          >
            {textoConfirmar}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            peligro
              ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive'
              : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary'
          }
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-muted">{descripcion}</p>
      </div>
    </Modal>
  );
}
