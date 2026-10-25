import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useI18nStore } from '@/store/i18nStore';

export interface PublicacionTrabajo {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  esGif: boolean;
  categoria: string;
  fecha: string;
  likes: number;
}

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onPublicar: (nuevaPublicacion: PublicacionTrabajo) => void;
}

const CATEGORIAS_TAGS = [
  'Motor V8 & Turbo',
  'Frenos & Calipers',
  'Transmisión',
  'Diagnóstico Scanner OBD2',
  'Suspensión Deportiva',
  'Afinación Mayor',
  'Tuning & Estética',
];

const CATEGORIAS_TAGS_EN: Record<string, string> = {
  'Motor V8 & Turbo': 'V8 Engine & Turbo',
  'Frenos & Calipers': 'Brakes & Calipers',
  Transmisión: 'Transmission',
  'Diagnóstico Scanner OBD2': 'OBD2 Scanner Diagnostics',
  'Suspensión Deportiva': 'Performance Suspension',
  'Afinación Mayor': 'Major Tune-up',
  'Tuning & Estética': 'Tuning & Styling',
};

export function ModalNuevaPublicacion({ abierto, onCerrar, onPublicar }: Propiedades) {
  const { t, idioma } = useI18nStore();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS_TAGS[0]);
  const [imagenUrl, setImagenUrl] = useState('');
  const [esGif, setEsGif] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('perfil.toastSoloImagenesPublicacion'));
      return;
    }

    setEsGif(file.type.includes('gif'));

    const reader = new FileReader();
    reader.onload = () => {
      setImagenUrl(reader.result as string);
      toast.success(
        file.type.includes('gif') ? t('perfil.toastGifAdjunto') : t('perfil.toastFotoAdjunta'),
      );
    };
    reader.readAsDataURL(file);
  };

  const handlePublicar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error(t('perfil.toastTituloTrabajo'));
      return;
    }

    const nueva: PublicacionTrabajo = {
      id: `post-${Date.now()}`,
      titulo,
      descripcion,
      imagenUrl:
        imagenUrl ||
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      esGif,
      categoria,
      fecha: t('perfil.fechaAhora'),
      likes: 1,
    };

    onPublicar(nueva);
    toast.success(t('perfil.toastPublicado'));
    // Limpiar
    setTitulo('');
    setDescripcion('');
    setImagenUrl('');
    onCerrar();
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={t('perfil.modalPublicar')}
      descripcion={t('perfil.modalPublicarDesc')}
      tamano="md"
    >
      <form onSubmit={handlePublicar} className="space-y-4">
        <div>
          <Label htmlFor="tituloPost">{t('perfil.tituloTrabajo')}</Label>
          <input
            id="tituloPost"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={idioma === 'en'
              ? 'e.g. Replace brake pads and resurface rotors'
              : 'Ej. Cambio de balatas cerámicas y rectificado de discos'}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <Label htmlFor="categoriaPost">{t('perfil.categoriaTrabajo')}</Label>
          <select
            id="categoriaPost"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            {CATEGORIAS_TAGS.map((cat) => (
              <option key={cat} value={cat}>
                {idioma === 'en' ? CATEGORIAS_TAGS_EN[cat] : cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="descPost">{t('perfil.descripcionTrabajo')}</Label>
          <Textarea
            id="descPost"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder={t('perfil.detalleTrabajoPlaceholder')}
            className="mt-1"
          />
        </div>

        {/* Zona de imagen o GIF */}
        <div>
          <Label>{t('perfil.imagenEvidencia')}</Label>
          <div className="mt-1.5">
            {imagenUrl ? (
              <div className="relative h-44 w-full overflow-hidden rounded-xl border border-white/[0.1] bg-black/40">
                <img
                  src={imagenUrl}
                  alt={t('perfil.imagenEvidencia')}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImagenUrl('')}
                  className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-white hover:bg-black"
                >
                  <X className="h-4 w-4" />
                </button>
                {esGif && (
                  <span className="absolute bottom-2 left-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-black text-black">
                    {t('perfil.gifAnimado')}
                  </span>
                )}
              </div>
            ) : (
              <div
                onClick={() => inputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.15] bg-card p-6 text-center transition-colors hover:border-primary/50"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleSubirArchivo}
                />
                <Upload className="h-6 w-6 text-primary mb-1.5" />
                <p className="text-xs font-bold text-foreground">
                  {t('perfil.subirEvidencia')}
                </p>
                <p className="text-[11px] text-muted">{t('perfil.formatosEvidencia')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
          <Button type="button" variant="ghost" onClick={onCerrar}>
            {t('editor.cancelar')}
          </Button>
          <Button type="submit" variant="primary">
            {t('perfil.publicarMuro')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
