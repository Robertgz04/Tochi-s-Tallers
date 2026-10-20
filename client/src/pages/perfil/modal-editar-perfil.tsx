import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Check,
  Globe,
  Image as ImageIcon,
  MessageCircle,
  Share2,
  Smile,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface PerfilData {
  nombre: string;
  apellidos: string;
  handle: string;
  puesto: string;
  biografia: string;
  telefono: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  ciudad: string;
  estadoAnimo: string;
  estadoEmoji: string;
  fotoUrl: string;
  portadaUrl: string;
}

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  datosActuales: PerfilData;
  onGuardar: (nuevosDatos: PerfilData) => void;
}

const EMOJIS_ESTADO = ['🔧', '⚡', '🏎️', '🛠️', '🏁', '🔥', '⚙️', '☕', '🎯', '🏆'];

const FONDOS_PORTADA_PRESET = [
  {
    nombre: 'Carbon Neón',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
  },
  {
    nombre: 'Garaje Deportivo',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    nombre: 'Pista Nocturna',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    nombre: 'Taller Precisión',
    url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
  },
];

export function ModalEditarPerfil({
  abierto,
  onCerrar,
  datosActuales,
  onGuardar,
}: Propiedades) {
  const [form, setForm] = useState<PerfilData>(datosActuales);
  const [pestana, setPestana] = useState<'info' | 'imagenes' | 'redes' | 'estado'>('info');
  const inputAvatarRef = useRef<HTMLInputElement>(null);
  const inputPortadaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(datosActuales);
  }, [datosActuales]);

  const handleSubirAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo puedes subir imágenes o animaciones GIF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, fotoUrl: result }));
      toast.success(
        file.type.includes('gif') ? '¡GIF de perfil cargado!' : '¡Foto de perfil actualizada!',
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubirPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo puedes subir imágenes o animaciones GIF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, portadaUrl: result }));
      toast.success(
        file.type.includes('gif') ? '¡GIF de portada cargado!' : '¡Portada actualizada!',
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio.');
      return;
    }
    onGuardar(form);
    toast.success('¡Perfil actualizado con éxito!');
    onCerrar();
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Editar Perfil Social"
      descripcion="Personaliza tu foto, portada (GIF o imagen), biografía, frase del día y redes de contacto estilo Facebook y Snapchat."
      tamano="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navegación por pestañas del modal */}
        <div className="flex border-b border-white/[0.08] pb-1">
          <button
            type="button"
            onClick={() => setPestana('info')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all ${
              pestana === 'info'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Identidad & Bio
          </button>
          <button
            type="button"
            onClick={() => setPestana('imagenes')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all ${
              pestana === 'imagenes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Avatar & Portada (GIF)
          </button>
          <button
            type="button"
            onClick={() => setPestana('redes')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all ${
              pestana === 'redes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            Redes Sociales
          </button>
          <button
            type="button"
            onClick={() => setPestana('estado')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-all ${
              pestana === 'estado'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Smile className="h-3.5 w-3.5" />
            Estado & Mood
          </button>
        </div>

        {/* PESTAÑA 1: Identidad y Bio */}
        {pestana === 'info' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="nombre">Nombre(s) *</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Antonio"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={form.apellidos}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  placeholder="Ej. Tochi"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="handle">Usuario / Handle Social (@)</Label>
                <Input
                  id="handle"
                  value={form.handle}
                  onChange={(e) => {
                    const val = e.target.value.startsWith('@')
                      ? e.target.value
                      : `@${e.target.value}`;
                    setForm({ ...form, handle: val.toLowerCase().replace(/\s+/g, '_') });
                  }}
                  placeholder="@tochi_master"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="puesto">Puesto / Especialidad</Label>
                <Input
                  id="puesto"
                  value={form.puesto}
                  onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                  placeholder="Ej. Maestro Mecánico & Diagnóstico"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="biografia">Biografía / Presentación</Label>
                <span className="text-[11px] text-muted">{form.biografia.length}/280</span>
              </div>
              <Textarea
                id="biografia"
                value={form.biografia}
                onChange={(e) => setForm({ ...form, biografia: e.target.value.slice(0, 280) })}
                rows={3}
                placeholder="Cuéntale a tu equipo y clientes sobre tu pasión por los motores, experiencia o certificaciones..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="telefono">Teléfono Directo</Label>
                <Input
                  id="telefono"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="55 1234 5678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad / Taller</Label>
                <Input
                  id="ciudad"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  placeholder="Guadalajara, Jal."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: Fotos & GIF (Avatar y Portada) */}
        {pestana === 'imagenes' && (
          <div className="space-y-4">
            {/* Foto de Perfil */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#11151e] p-4">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Foto de Perfil / Avatar (Soporta GIF animados, JPG, PNG, WEBP)
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                Al subir un GIF animado, se reproducirá en tu perfil y barra de navegación.
              </p>

              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/50 bg-surface shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  {form.fotoUrl ? (
                    <img
                      src={form.fotoUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/20 text-lg font-bold text-primary">
                      {form.nombre.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    ref={inputAvatarRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="hidden"
                    onChange={handleSubirAvatar}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => inputAvatarRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary" />
                    Subir Foto o GIF
                  </Button>
                  {form.fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fotoUrl: '' })}
                      className="block text-[11px] text-rose-400 hover:underline"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Portada / Banner */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#11151e] p-4">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-sky-400" />
                Portada de Perfil (Banner)
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                Sube tu propio GIF animado o imagen personalizada de tu taller.
              </p>

              <div className="mt-3 h-28 w-full overflow-hidden rounded-xl border border-white/[0.08] relative">
                {form.portadaUrl ? (
                  <img
                    src={form.portadaUrl}
                    alt="Portada"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-purple-500/20 flex items-center justify-center text-xs text-muted">
                    Sin portada asignada
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <input
                    ref={inputPortadaRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="hidden"
                    onChange={handleSubirPortada}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => inputPortadaRef.current?.click()}
                    className="h-7 text-[11px] px-2.5 flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" /> Subir Portada (GIF/JPG)
                  </Button>
                </div>
              </div>

              {/* Presets de Portada */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-muted mb-1.5">O elige un fondo automotriz preset:</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FONDOS_PORTADA_PRESET.map((p) => (
                    <button
                      key={p.nombre}
                      type="button"
                      onClick={() => setForm({ ...form, portadaUrl: p.url })}
                      className="group relative h-12 overflow-hidden rounded-lg border border-white/[0.08] text-left transition-all hover:border-primary"
                    >
                      <img src={p.url} alt={p.nombre} className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-bold text-white group-hover:bg-black/20">
                        {p.nombre}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: Redes Sociales */}
        {pestana === 'redes' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="whatsapp">WhatsApp Directo</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+52 33 1234 5678"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram (@usuario)</Label>
              <Input
                id="instagram"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@tochis_taller"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook (Enlace o perfil)</Label>
              <Input
                id="facebook"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="facebook.com/tochistaller"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tiktok">TikTok / Snapchat</Label>
              <Input
                id="tiktok"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                placeholder="@tochi_tuning"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                placeholder="linkedin.com/in/tochistaller"
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* PESTAÑA 4: Estado & Mood */}
        {pestana === 'estado' && (
          <div className="space-y-3">
            <div>
              <Label>Emoji de Estado / Mood actual</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMOJIS_ESTADO.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, estadoEmoji: emoji })}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                      form.estadoEmoji === emoji
                        ? 'border-2 border-primary bg-primary/20 scale-110 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'border border-white/[0.08] bg-[#11151e] hover:border-white/20'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="estadoAnimo">Frase de Estado (Estilo Snapchat / WhatsApp)</Label>
              <Input
                id="estadoAnimo"
                value={form.estadoAnimo}
                onChange={(e) => setForm({ ...form, estadoAnimo: e.target.value })}
                placeholder="Ej. 🔧 Ajustando motores V8 hoy | Disponible para diagnósticos express"
                className="mt-1"
              />
              <p className="mt-1 text-[11px] text-muted">
                Esta frase aparecerá debajo de tu nombre en el encabezado de tu perfil social.
              </p>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2.5 border-t border-white/[0.06] pt-3">
          <Button type="button" variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Cambios de Perfil
          </Button>
        </div>
      </form>
    </Modal>
  );
}

