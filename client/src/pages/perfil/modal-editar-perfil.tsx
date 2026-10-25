import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Share2,
  Smile,
  Sparkles,
  Upload,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useI18nStore } from '@/store/i18nStore';

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
  const { t } = useI18nStore();
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
      toast.error(t('perfil.toastSoloImagenes'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, fotoUrl: result }));
      toast.success(
        file.type.includes('gif') ? t('perfil.toastGifPerfil') : t('perfil.toastFotoPerfil'),
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubirPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('perfil.toastSoloImagenes'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, portadaUrl: result }));
      toast.success(
        file.type.includes('gif') ? t('perfil.toastGifPortada') : t('perfil.toastPortadaActualizada'),
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error(t('perfil.toastNombreObligatorio'));
      return;
    }
    onGuardar(form);
    toast.success(t('perfil.toastGuardado'));
    onCerrar();
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={t('editor.titulo')}
      descripcion={t('editor.descripcion')}
      tamano="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Contenido scrollable del modal */}
        <div className="max-h-[calc(100vh_-_20rem)] overflow-y-auto space-y-4 pr-2">
          {/* Navegación por pestañas del modal */}
          <div className="flex border-b border-white/[0.08] pb-1 sticky top-0 bg-card/95 backdrop-blur z-10">
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
            {t('editor.info')}
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
            {t('editor.imagenes')}
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
            {t('editor.redes')}
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
            {t('editor.estado')}
          </button>
        </div>

        {/* PESTAÑA 1: Identidad y Bio */}
        {pestana === 'info' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="nombre">{t('editor.nombre')}</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Antonio"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="apellidos">{t('editor.apellidos')}</Label>
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
                <Label htmlFor="handle">{t('editor.handle')}</Label>
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
                <Label htmlFor="puesto">{t('editor.puesto')}</Label>
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
                <Label htmlFor="biografia">{t('editor.biografia')}</Label>
                <span className="text-[11px] text-muted">{form.biografia.length}/280</span>
              </div>
              <Textarea
                id="biografia"
                value={form.biografia}
                onChange={(e) => setForm({ ...form, biografia: e.target.value.slice(0, 280) })}
                rows={3}
                placeholder={t('editor.biografiaPlaceholder')}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="telefono">{t('editor.telefono')}</Label>
                <Input
                  id="telefono"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="55 1234 5678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ciudad">{t('editor.ciudad')}</Label>
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
            <div className="rounded-2xl border border-white/[0.08] bg-card p-4">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('editor.fotoTitulo')}
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                {t('editor.fotoAyuda')}
              </p>

              <div className="mt-3 flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/50 bg-surface shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  {form.fotoUrl ? (
                    <img
                      src={form.fotoUrl}
                      alt={t('editor.fotoTitulo')}
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
                    {t('editor.subirFoto')}
                  </Button>
                  {form.fotoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fotoUrl: '' })}
                      className="block text-[11px] text-rose-400 hover:underline"
                    >
                      {t('editor.removerFoto')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Portada / Banner */}
            <div className="rounded-2xl border border-white/[0.08] bg-card p-4">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-sky-400" />
                {t('editor.portadaTitulo')}
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                {t('editor.portadaAyuda')}
              </p>

              <div className="mt-3 h-28 w-full overflow-hidden rounded-xl border border-white/[0.08] relative">
                {form.portadaUrl ? (
                  <img
                    src={form.portadaUrl}
                    alt={t('editor.portadaTitulo')}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-purple-500/20 flex items-center justify-center text-xs text-muted">
                    {t('editor.sinPortada')}
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
                    <Upload className="h-3 w-3" /> {t('editor.subirPortada')} (GIF/JPG)
                  </Button>
                </div>
              </div>

              {/* Presets de Portada */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-muted mb-1.5">{t('editor.elegirFondo')}</p>
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
              <Label htmlFor="whatsapp">{t('editor.whatsapp')}</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+52 33 1234 5678"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="instagram">{t('editor.instagram')}</Label>
              <Input
                id="instagram"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@tochis_taller"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="facebook">{t('editor.facebook')}</Label>
              <Input
                id="facebook"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                placeholder="facebook.com/tochistaller"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tiktok">{t('editor.tiktok')}</Label>
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
              <Label>{t('editor.mood')}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMOJIS_ESTADO.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, estadoEmoji: emoji })}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                      form.estadoEmoji === emoji
                        ? 'border-2 border-primary bg-primary/20 scale-110 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        : 'border border-white/[0.08] bg-card hover:border-white/20'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="estadoAnimo">{t('editor.fraseEstado')}</Label>
              <Input
                id="estadoAnimo"
                value={form.estadoAnimo}
                onChange={(e) => setForm({ ...form, estadoAnimo: e.target.value })}
                placeholder="e.g. 🔧 Tuning V8 engines today | Available for express diagnostics"
                className="mt-1"
              />
              <p className="mt-1 text-[11px] text-muted">
                {t('editor.fraseAyuda')}
              </p>
            </div>
          </div>
        )}

        </div>
        {/* Cierre del contenedor scrollable */}

        {/* Botones de acción fijos en la parte inferior */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-white/[0.1] pt-3 pb-4 z-10">
          <div className="flex items-center justify-end gap-2.5 border-t border-white/[0.06] pt-3">
            <Button type="button" variant="ghost" onClick={onCerrar}>
              {t('editor.cancelar')}
            </Button>
            <Button type="submit" variant="primary">
              {t('editor.guardar')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
