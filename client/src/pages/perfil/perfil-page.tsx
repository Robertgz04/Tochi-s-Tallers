import { useState, useEffect } from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Flame,
  Globe,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { Button } from '@/components/ui/button';
import { ModalEditarPerfil, type PerfilData } from './modal-editar-perfil';
import { ModalCompartirPerfil } from './modal-compartir-perfil';
import { ModalNuevaPublicacion, type PublicacionTrabajo } from './modal-nueva-publicacion';

const PUBLICACIONES_INICIALES: PublicacionTrabajo[] = [
  {
    id: 'post-1',
    titulo: 'Reconstrucción completa de motor V8 5.0L Ford Coyote',
    descripcion:
      'Se completó rectificado de cabezas, cambio de pistones forjados, metales de biela y bancada nuevos, con calibración de sincronización variable.',
    imagenUrl:
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80',
    esGif: false,
    categoria: 'Motor V8 & Turbo',
    fecha: 'Ayer a las 18:30',
    likes: 14,
  },
  {
    id: 'post-2',
    titulo: 'Diagnóstico y reprogramación de caja DSG 7 velocidades',
    descripcion:
      'Cliente reportaba tirones en 2da y 3ra marcha. Se ajustaron paquetes de embrague y prueba de presión hidráulica al 100%.',
    imagenUrl:
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
    esGif: true,
    categoria: 'Transmisión',
    fecha: 'Hace 3 días',
    likes: 29,
  },
  {
    id: 'post-3',
    titulo: 'Upgrade a calipers Brembo 6 pistones y discos hiperventilados',
    descripcion:
      'Instalación de kit de frenos de alto desempeño con purgado de líquido DOT 5.1 y prueba de frenado a 120 km/h en pista.',
    imagenUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    esGif: false,
    categoria: 'Frenos & Calipers',
    fecha: 'Hace 5 días',
    likes: 42,
  },
];

export default function PerfilPage() {
  const { usuario, establecerUsuario } = useAuthStore();
  const { t } = useI18nStore();

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalCompartirAbierto, setModalCompartirAbierto] = useState(false);
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<'muro' | 'sobre_mi' | 'estadisticas'>('muro');
  const [publicaciones, setPublicaciones] = useState<PublicacionTrabajo[]>(() => {
    const guardadas = localStorage.getItem('tochis_posts_trabajos');
    return guardadas ? JSON.parse(guardadas) : PUBLICACIONES_INICIALES;
  });

  const [perfil, setPerfil] = useState<PerfilData>(() => {
    const guardado = localStorage.getItem('tochis_perfil_social');
    if (guardado) {
      try {
        return JSON.parse(guardado);
      } catch {
        // fallback
      }
    }
    return {
      nombre: usuario?.nombre || 'Antonio',
      apellidos: usuario?.apellidos || "Tochi's",
      handle: '@tochi_master',
      puesto: 'Maestro Mecánico & Diagnóstico Electrónico',
      biografia:
        'Apasionado por la mecánica de precisión y motores deportivos. Más de 12 años diagnosticando transmisiones, reprogramación de ECU y restauración automotriz.',
      telefono: usuario?.telefono || '33 1234 5678',
      whatsapp: '+52 33 1234 5678',
      instagram: '@tochis_mecanica',
      facebook: 'facebook.com/tochis.taller',
      tiktok: '@tochis_tuning',
      linkedin: 'linkedin.com/in/antoniotochi',
      ciudad: 'Guadalajara, Jalisco',
      estadoAnimo: 'En el taller • Trabajando en transmisiones y motores de alta gama',
      estadoEmoji: '🔧',
      fotoUrl: usuario?.fotoUrl || '',
      portadaUrl:
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1400&q=80',
    };
  });

  // Guardar publicaciones al cambiar
  useEffect(() => {
    localStorage.setItem('tochis_posts_trabajos', JSON.stringify(publicaciones));
  }, [publicaciones]);

  const handleGuardarPerfil = (nuevosDatos: PerfilData) => {
    setPerfil(nuevosDatos);
    localStorage.setItem('tochis_perfil_social', JSON.stringify(nuevosDatos));

    if (usuario) {
      establecerUsuario({
        ...usuario,
        nombre: nuevosDatos.nombre,
        apellidos: nuevosDatos.apellidos,
        telefono: nuevosDatos.telefono || null,
        fotoUrl: nuevosDatos.fotoUrl || null,
      });
    }
  };

  const handleDarLike = (id: string) => {
    setPublicaciones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
    );
  };

  const handleNuevaPublicacion = (nueva: PublicacionTrabajo) => {
    setPublicaciones([nueva, ...publicaciones]);
  };

  return (
    <div className="animate-fade-in space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ========================================================= */}
      {/* PORTADA Y ENCABEZADO SOCIAL ESTILO FACEBOOK / SNAPCHAT    */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-gradient-to-b from-card to-card-elevated shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-white/20 transition-all duration-300">
        {/* Banner de Portada (Soporta GIF animados e imágenes) */}
        <div className="relative h-48 w-full sm:h-64 lg:h-72 overflow-hidden bg-gradient-to-r from-amber-600/30 via-sky-600/20 to-purple-600/30">
          {perfil.portadaUrl ? (
            <img
              src={perfil.portadaUrl}
              alt="Portada"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted">
              {t('perfil.sinPortada')}
            </div>
          )}

          {/* Gradiente oscuro inferior para contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />

          {/* Botón flotante para editar portada */}
          <button
            type="button"
            onClick={() => setModalEditarAbierto(true)}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-black/90 hover:scale-105 cursor-pointer"
          >
            <Camera className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">{t('perfil.cambiarPortada')}</span>
          </button>
        </div>

        {/* Zona inferior del encabezado: Avatar, Identidad y Botones de Acción */}
        <div className="relative px-5 pb-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* Avatar y Datos Principales */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20">
              {/* Avatar circular con borde de estado y soporte GIF */}
              <div className="relative group">
                <div className="relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-full border-4 border-card bg-card-hover shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-2 ring-primary">
                  {perfil.fotoUrl ? (
                    <img
                      src={perfil.fotoUrl}
                      alt={perfil.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-3xl font-black text-primary">
                      {perfil.nombre.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Badge en línea */}
                <span
                  title={t('perfil.enLineaTaller')}
                  className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-card bg-emerald-400 shadow-[0_0_10px_#10B981]"
                />

                {/* Botón rápido de cámara sobre el avatar */}
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(true)}
                  title={t('perfil.subirFoto')}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-primary" />
                </button>
              </div>

              {/* Textos del Usuario */}
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">
                    {perfil.nombre} {perfil.apellidos}
                  </h2>
                  <span className="flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-0.5 text-xs font-bold text-sky-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t('perfil.verificado')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="font-extrabold text-primary">{perfil.handle}</span>
                  <span className="text-muted">•</span>
                  <span className="font-semibold text-muted">{perfil.puesto}</span>
                  <span className="text-muted">•</span>
                  <span className="flex items-center gap-1 text-muted">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {perfil.ciudad}
                  </span>
                </div>

                {/* Frase / Estado de ánimo estilo Snapchat */}
                <div className="mt-1.5 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-background/80 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm">
                  <span className="text-base">{perfil.estadoEmoji}</span>
                  <span className="font-medium text-slate-300">{perfil.estadoAnimo}</span>
                </div>
              </div>
            </div>

            {/* Botones de Acción (Editar Perfil, Compartir, Publicar) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 pt-2 sm:pt-0">
              <Button
                variant="secondary"
                onClick={() => setModalCompartirAbierto(true)}
                className="flex items-center gap-1.5 border-white/10 text-xs"
              >
                <QrCode className="h-4 w-4 text-sky-400" />
                <span>{t('perfil.snapcode')}</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => setModalEditarAbierto(true)}
                className="flex items-center gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/10"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t('perfil.editarPerfil')}</span>
              </Button>

              <Button
                variant="primary"
                onClick={() => setModalPublicarAbierto(true)}
                className="flex items-center gap-1.5 text-xs shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              >
                <Plus className="h-4 w-4" />
                <span>{t('perfil.publicarTrabajo')}</span>
              </Button>
            </div>
          </div>

          {/* Insignias estilo Snapchat / Gamificación */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
            <span className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
              <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" /> {t('perfil.rachaActiva')}
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-bold text-violet-400">
              <Award className="h-3.5 w-3.5" /> {t('perfil.insigniaMaster')}
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t('perfil.ordenesEntregadas')}
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400">
              <Star className="h-3.5 w-3.5 fill-sky-400" /> {t('perfil.calificacionClientes')}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑAS DE NAVEGACIÓN DEL PERFIL SOCIAL                  */}
      {/* ========================================================= */}
      <div className="flex border-b border-white/[0.08] gap-4">
        <button
          type="button"
          onClick={() => setPestanaActiva('muro')}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-all cursor-pointer ${
            pestanaActiva === 'muro'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          {t('perfil.muro')} ({publicaciones.length})
        </button>
        <button
          type="button"
          onClick={() => setPestanaActiva('sobre_mi')}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-all cursor-pointer ${
            pestanaActiva === 'sobre_mi'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          {t('perfil.sobreMi')}
        </button>
        <button
          type="button"
          onClick={() => setPestanaActiva('estadisticas')}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-all cursor-pointer ${
            pestanaActiva === 'estadisticas'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Wrench className="h-4 w-4" />
          {t('perfil.metricas')}
        </button>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: MURO DE PUBLICACIONES (ESTILO FACEBOOK/INSTA)   */}
      {/* ========================================================= */}
      {pestanaActiva === 'muro' && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Feed de Publicaciones */}
          <div className="space-y-5 lg:col-span-8">
            {/* Barra rápida "Crear publicación" */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-card p-4 shadow-sm">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-primary/40 bg-surface">
                {perfil.fotoUrl ? (
                  <img src={perfil.fotoUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                    {perfil.nombre.charAt(0)}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setModalPublicarAbierto(true)}
                className="w-full rounded-xl border border-white/[0.08] bg-card-hover px-4 py-2.5 text-left text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground cursor-pointer"
              >
                {t('perfil.crearPublicacion')}
              </button>
              <Button
                variant="secondary"
                onClick={() => setModalPublicarAbierto(true)}
                className="shrink-0 text-xs flex items-center gap-1.5"
              >
                <Camera className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">{t('perfil.fotoGif')}</span>
              </Button>
            </div>

            {/* Listado de Posts */}
            {publicaciones.map((post) => (
              <article
                key={post.id}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-card to-surface p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:border-white/20"
              >
                {/* Cabecera del post */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-primary/50 bg-card-hover">
                      {perfil.fotoUrl ? (
                        <img
                          src={perfil.fotoUrl}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                          {perfil.nombre.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {perfil.nombre} {perfil.apellidos}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {perfil.handle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted">
                        <Clock className="h-3 w-3" />
                        <span>{post.fecha}</span>
                        <span>•</span>
                        <span className="text-sky-400 font-medium">                        {t('perfil.nombreTaller')}</span>
                      </div>
                    </div>
                  </div>

                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-muted">
                    #{post.categoria}
                  </span>
                </div>

                {/* Contenido textual */}
                <div className="mt-3.5 space-y-1.5">
                  <h4 className="text-base font-extrabold text-foreground">{post.titulo}</h4>
                  <p className="text-xs leading-relaxed text-slate-300">{post.descripcion}</p>
                </div>

                {/* Imagen o GIF del trabajo */}
                {post.imagenUrl && (
                  <div className="mt-3.5 relative overflow-hidden rounded-xl border border-white/[0.08] max-h-96 bg-black">
                    <img
                      src={post.imagenUrl}
                      alt={post.titulo}
                      className="w-full object-cover max-h-96"
                    />
                    {post.esGif && (
                      <span className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2 py-1 text-[11px] font-black tracking-wider text-primary backdrop-blur-md">
                        {t('perfil.gifAnimado')}
                      </span>
                    )}
                  </div>
                )}

                {/* Barra de interacción social estilo FB / Instagram */}
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-muted">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleDarLike(post.id)}
                      className="flex items-center gap-1.5 font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                      <span>{post.likes} {t('perfil.meGusta')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.info(t('perfil.toastComentarios'))}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{t('perfil.comentar')}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success(t('perfil.toastCompartir'));
                    }}
                    className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{t('perfil.compartir')}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Barra Lateral: Resumen de Biografía y Redes */}
          <div className="space-y-4 lg:col-span-4">
            {/* Tarjeta Sobre Mí Compacta */}
            <div className="rounded-2xl border border-white/[0.08] bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> {t('perfil.presentacion')}
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">{perfil.biografia}</p>
              <div className="border-t border-white/[0.06] pt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span className="text-foreground font-semibold">{perfil.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-foreground">{perfil.ciudad}</span>
                </div>
              </div>
            </div>

            {/* Redes Sociales Vinculadas */}
            <div className="rounded-2xl border border-white/[0.08] bg-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-sky-400" /> {t('perfil.conexiones')}
              </h3>
              <div className="space-y-2 text-xs">
                {perfil.whatsapp && (
                  <a
                    href={`https://wa.me/${perfil.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <span className="font-bold flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </span>
                    <span className="text-[11px] font-mono">{perfil.whatsapp}</span>
                  </a>
                )}
                {perfil.instagram && (
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-card-hover p-2.5 text-pink-400">
                    <span className="font-bold">Instagram</span>
                    <span className="text-muted font-mono">{perfil.instagram}</span>
                  </div>
                )}
                {perfil.facebook && (
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-card-hover p-2.5 text-sky-400">
                    <span className="font-bold">Facebook</span>
                    <span className="text-muted font-mono">{perfil.facebook}</span>
                  </div>
                )}
                {perfil.tiktok && (
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-card-hover p-2.5 text-purple-400">
                    <span className="font-bold">TikTok / Snap</span>
                    <span className="text-muted font-mono">{perfil.tiktok}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: SOBRE MÍ EXTENDIDO                             */}
      {/* ========================================================= */}
      {pestanaActiva === 'sobre_mi' && (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-card p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> {t('perfil.informacionProfesional')}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-muted font-semibold uppercase tracking-wider text-[11px]">
                  {t('perfil.especialidadPrincipal')}
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">{perfil.puesto}</p>
              </div>
              <div>
                <p className="text-muted font-semibold uppercase tracking-wider text-[11px]">
                  {t('perfil.biografiaTrayectoria')}
                </p>
                <p className="mt-1 leading-relaxed text-slate-300">{perfil.biografia}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-muted text-[11px]">{t('perfil.tallerAfiliado')}</p>
                  <p className="font-bold text-foreground">{t('perfil.tallerNombre')}</p>
                </div>
                <div>
                  <p className="text-muted text-[11px]">{t('perfil.horarioAtencion')}</p>
                  <p className="font-bold text-foreground">{t('perfil.tallerHorario')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-card p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" /> {t('perfil.certificacionesCursos')}
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-white/[0.06] bg-card-hover p-3">
                <p className="font-bold text-foreground">{t('perfil.certificacionMaster')}</p>
                <p className="text-[11px] text-muted">Bosch Automotive Training • 2024</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-card-hover p-3">
                <p className="font-bold text-foreground">{t('perfil.diagnosticoAvanzado')}</p>
                <p className="text-[11px] text-muted">Snap-on Diagnostics Academy • 2025</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-card-hover p-3">
                <p className="font-bold text-foreground">{t('perfil.especializacionTransmisiones')}</p>
                <p className="text-[11px] text-muted">ZF Services Motorsport • 2025</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 3: ESTADÍSTICAS & RENDIMIENTO                      */}
      {/* ========================================================= */}
      {pestanaActiva === 'estadisticas' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.08] bg-card p-4 text-center">
              <p className="text-xs font-semibold text-muted uppercase">{t('perfil.ordenesAtendidas')}</p>
              <p className="mt-1 text-2xl font-black text-primary">128</p>
              <p className="text-[11px] text-emerald-400 mt-1">{t('perfil.aTiempo')}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-card p-4 text-center">
              <p className="text-xs font-semibold text-muted uppercase">{t('perfil.calificacionPromedio')}</p>
              <p className="mt-1 text-2xl font-black text-amber-400">4.9 / 5</p>
              <p className="text-[11px] text-muted mt-1">{t('perfil.resenas')}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-card p-4 text-center">
              <p className="text-xs font-semibold text-muted uppercase">{t('perfil.facturacionGenerada')}</p>
              <p className="mt-1 text-2xl font-black text-sky-400">$384,500</p>
              <p className="text-[11px] text-muted mt-1">{t('perfil.mxnAcumulado')}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-card p-4 text-center">
              <p className="text-xs font-semibold text-muted uppercase">{t('perfil.tiempoPromedio')}</p>
              <p className="mt-1 text-2xl font-black text-emerald-400">1.8 días</p>
              <p className="text-[11px] text-muted mt-1">{t('perfil.porVehiculo')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <ModalEditarPerfil
        abierto={modalEditarAbierto}
        onCerrar={() => setModalEditarAbierto(false)}
        datosActuales={perfil}
        onGuardar={handleGuardarPerfil}
      />

      <ModalCompartirPerfil
        abierto={modalCompartirAbierto}
        onCerrar={() => setModalCompartirAbierto(false)}
        perfil={perfil}
      />

      <ModalNuevaPublicacion
        abierto={modalPublicarAbierto}
        onCerrar={() => setModalPublicarAbierto(false)}
        onPublicar={handleNuevaPublicacion}
      />
    </div>
  );
}
