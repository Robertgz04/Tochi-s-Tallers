import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Tag, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export function ModalNuevaPublicacion({ abierto, onCerrar, onPublicar }: Propiedades) {
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
      toast.error('Solo se admiten imágenes o animaciones GIF.');
      return;
    }

    setEsGif(file.type.includes('gif'));

    const reader = new FileReader();
    reader.onload = () => {
      setImagenUrl(reader.result as string);
      toast.success(
        file.type.includes('gif') ? '¡GIF de trabajo adjuntado!' : '¡Foto de trabajo adjuntada!',
      );
    };
    reader.readAsDataURL(file);
  };

  const handlePublicar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error('Por favor escribe un título para el trabajo.');
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
      fecha: 'Hace un momento',
      likes: 1,
    };

    onPublicar(nueva);
    toast.success('¡Trabajo publicado en tu muro de perfil!');
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
      titulo="Publicar Trabajo / Evidencia al Perfil"
      descripcion="Comparte una reparación, afinación o modificación automotriz con fotos o GIFs en tu muro estilo red social."
      tamano="md"
    >
      <form onSubmit={handlePublicar} className="space-y-4">
        <div>
          <Label htmlFor="tituloPost">Título del trabajo / reparación *</Label>
          <input
            id="tituloPost"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Cambio de balatas cerámicas y rectificado de discos"
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#11151e] px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <Label htmlFor="categoriaPost">Especialidad / Etiqueta</Label>
          <select
            id="categoriaPost"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#11151e] px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            {CATEGORIAS_TAGS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="descPost">Descripción o detalles de la intervención</Label>
          <Textarea
            id="descPost"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Detalla qué refacciones se colocaron, torque aplicado, pruebas realizadas o sensaciones de manejo..."
            className="mt-1"
          />
        </div>

        {/* Zona de imagen o GIF */}
        <div>
          <Label>Foto o GIF de la evidencia (JPEG, PNG, GIF, WEBP)</Label>
          <div className="mt-1.5">
            {imagenUrl ? (
              <div className="relative h-44 w-full overflow-hidden rounded-xl border border-white/[0.1] bg-black/40">
                <img
                  src={imagenUrl}
                  alt="Preview"
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
                    GIF ANIMADO
                  </span>
                )}
              </div>
            ) : (
              <div
                onClick={() => inputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.15] bg-[#11151e] p-6 text-center transition-colors hover:border-primary/50"
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
                  Sube foto o animación GIF del vehículo o motor
                </p>
                <p className="text-[11px] text-muted">Soporta .gif, .png, .jpeg hasta 15MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
          <Button type="button" variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Publicar en el Muro
          </Button>
        </div>
      </form>
    </Modal>
  );
}

