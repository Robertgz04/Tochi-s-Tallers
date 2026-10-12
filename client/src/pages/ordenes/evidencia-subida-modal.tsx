import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { useSubirEvidenciaMutation } from '@/hooks/useQueries';
import { ETAPAS_EVIDENCIA, ETIQUETAS_ETAPAS_EVIDENCIA, type EtapaEvidencia } from '@/types';

const LIMITE_BYTES = 10 * 1024 * 1024;

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  ordenId: string;
  etapaInicial: EtapaEvidencia;
}
export function EvidenciaSubidaModal({ abierto, onCerrar, ordenId, etapaInicial }: Propiedades) {
  const [etapa, setEtapa] = useState<EtapaEvidencia>(etapaInicial);
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const subir = useSubirEvidenciaMutation(ordenId);

  const seleccionar = (file: File | undefined) => {
    setErrorArchivo(null);
    if (!file) return;
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      setErrorArchivo('El archivo debe ser una imagen (JPG, PNG, WEBP, GIF o HEIC).');
      return;
    }
    if (file.size > LIMITE_BYTES) {
      setErrorArchivo('La imagen no puede superar 10 MB.');
      return;
    }
    setArchivo(file);
    setVistaPrevia((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const limpiar = () => {
    setArchivo(null);
    setDescripcion('');
    setEtapa(etapaInicial);
    setErrorArchivo(null);
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    setVistaPrevia(null);
  };

  const cerrar = () => {
    if (subir.isPending) return;
    limpiar();
    onCerrar();
  };

  const guardar = () => {
    if (!archivo) {
      setErrorArchivo('Selecciona una foto para subir.');
      return;
    }
    subir.mutate(
      { archivo, etapa, descripcion: descripcion.trim() || undefined },
      { onSuccess: cerrar },
    );
  };
  return (
    <Modal
      abierto={abierto}
      onCerrar={cerrar}
      titulo="Agregar evidencia"
      descripcion="Sube una foto del vehículo en esta orden (máx. 10 MB)."
      pie={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={subir.isPending}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={subir.isPending || !archivo}>
            {subir.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            )}
            Subir foto
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="etapa-evidencia" className="mb-1.5 block text-sm font-medium text-foreground">
            Etapa
          </label>
          <Select
            id="etapa-evidencia"
            value={etapa}
            onChange={(e) => setEtapa(e.target.value as EtapaEvidencia)}
          >
            {ETAPAS_EVIDENCIA.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETAS_ETAPAS_EVIDENCIA[opcion]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">Foto</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            capture="environment"
            className="hidden"
            onChange={(e) => seleccionar(e.target.files?.[0])}
          />
          {vistaPrevia ? (
            <div className="relative">
              <img
                src={vistaPrevia}
                alt="Vista previa de la foto a subir"
                className="max-h-64 w-full rounded-xl bg-surface object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setArchivo(null);
                  if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
                  setVistaPrevia(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                aria-label="Quitar foto seleccionada"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface/50 px-4 py-8 text-sm text-muted transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <ImagePlus className="h-8 w-8" aria-hidden="true" />
              Toca para seleccionar o tomar una foto
            </button>
          )}
          {errorArchivo && <p className="mt-1.5 text-xs text-destructive">{errorArchivo}</p>}
        </div>
        <div>
          <label htmlFor="descripcion-evidencia" className="mb-1.5 block text-sm font-medium text-foreground">
            Descripción <span className="font-normal text-muted">(opcional)</span>
          </label>
          <textarea
            id="descripcion-evidencia"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Ej. Golpe en fascia delantera, lado copiloto"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}

