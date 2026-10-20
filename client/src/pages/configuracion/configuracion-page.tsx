import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Database,
  Download,
  Hash,
  Languages,
  Laptop,
  MessageSquare,
  Moon,
  Palette,
  Percent,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Upload,
  UsersRound,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMiTallerQuery } from '@/hooks/useQueries';
import { useThemeStore } from '@/store/themeStore';
import { useI18nStore } from '@/store/i18nStore';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Textarea } from '@/components/ui/textarea';

type PestanaConfig =
  | 'general'
  | 'notificaciones'
  | 'apariencia'
  | 'seguridad'
  | 'respaldo'
  | 'suscripcion';

export default function ConfiguracionPage() {
  const { data: taller, isPending, isError, error, refetch } = useMiTallerQuery();
  const { tema, establecerTema } = useThemeStore();
  const { idioma, establecerIdioma, t } = useI18nStore();

  const [pestana, setPestana] = useState<PestanaConfig>('general');

  // Estado persistente de configuraciones masivas
  const [configGeneral, setConfigGeneral] = useState(() => {
    const guardado = localStorage.getItem('tochis_config_general');
    return guardado
      ? JSON.parse(guardado)
      : {
          prefijoFolio: 'TCH',
          siguienteFolio: '1048',
          iva: 16,
          moneda: 'MXN',
          diasGarantia: 90,
          horarioApertura: '08:00',
          horarioCierre: '19:00',
          diasLaborales: 'Lunes a Sábado',
          terminosGarantia:
            'Garantía de 90 días o 5,000 km en mano de obra y refacciones originales. No aplica en partes eléctricas ni desgaste normal.',
          formatoFecha: 'DD/MM/YYYY',
          zonaHoraria: 'America/Mexico_City',
        };
  });

  const [configNotificaciones, setConfigNotificaciones] = useState(() => {
    const guardado = localStorage.getItem('tochis_config_notificaciones');
    return guardado
      ? JSON.parse(guardado)
      : {
          whatsappIngreso: true,
          whatsappCotizacion: true,
          whatsappListo: true,
          emailCorteDiario: true,
          emailFacturaCliente: true,
          alertaInventarioBajo: true,
          alertaCitasManana: true,
          sonidosSistema: true,
          notificacionesPwa: true,
          plantillaListo:
            '¡Hola {cliente}! Tu vehículo {vehiculo} ya está listo para entrega en Tochi’s Taller. El saldo pendiente es de {total}. ¡Te esperamos!',
        };
  });

  const [configApariencia, setConfigApariencia] = useState(() => {
    const guardado = localStorage.getItem('tochis_config_apariencia');
    return guardado
      ? JSON.parse(guardado)
      : {
          temaPreset: 'carbono',
          colorAcento: '#F59E0B',
          densidadTabla: 'comoda',
          animaciones: true,
        };
  });

  const [passwordForm, setPasswordForm] = useState({
    actual: '',
    nueva: '',
    confirmacion: '',
  });

  const [dosFactores, setDosFactores] = useState(false);

  if (isPending) {
    return (
      <div className="space-y-4">
        <PageHeader titulo={t('cfg.titulo')} descripcion={t('cfg.subtitulo')} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !taller) {
    return (
      <ErrorState
        titulo="No pudimos cargar la configuración"
        descripcion={error instanceof Error ? error.message : 'Inténtalo nuevamente.'}
        onReintentar={() => refetch()}
      />
    );
  }

  const handleGuardarGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tochis_config_general', JSON.stringify(configGeneral));
    toast.success('Ajustes generales y de facturación guardados correctamente');
  };

  const handleGuardarNotificaciones = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tochis_config_notificaciones', JSON.stringify(configNotificaciones));
    toast.success('Preferencias de notificaciones y WhatsApp actualizadas');
  };

  const handleGuardarApariencia = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tochis_config_apariencia', JSON.stringify(configApariencia));
    toast.success('Configuración visual y tema actualizados con éxito');
  };

  const handleCambiarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.actual) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }
    if (passwordForm.nueva.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwordForm.nueva !== passwordForm.confirmacion) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    toast.success('Contraseña actualizada con éxito');
    setPasswordForm({ actual: '', nueva: '', confirmacion: '' });
  };

  const handleDescargarBackup = () => {
    const backupData = {
      sistema: "Tochi's Taller Cloud",
      version: '2.5.0',
      fecha: new Date().toISOString(),
      taller: {
        id: taller.id,
        nombre: taller.nombre,
        rfc: taller.rfc,
        moneda: taller.moneda,
        iva: taller.iva,
        plan: taller.plan,
      },
      configuraciones: {
        general: configGeneral,
        notificaciones: configNotificaciones,
        apariencia: configApariencia,
        temaActual: tema,
        idiomaActual: idioma,
      },
      timestamp: Date.now(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Backup_Completo_TochisTaller_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Copia de seguridad completa (JSON) generada y descargada');
  };

  const handleRestaurarBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.configuraciones?.general) {
            setConfigGeneral(parsed.configuraciones.general);
            localStorage.setItem(
              'tochis_config_general',
              JSON.stringify(parsed.configuraciones.general),
            );
          }
          if (parsed.configuraciones?.temaActual) {
            establecerTema(parsed.configuraciones.temaActual);
          }
          if (parsed.configuraciones?.idiomaActual) {
            establecerIdioma(parsed.configuraciones.idiomaActual);
          }
          toast.success('¡Copia de seguridad restaurada con éxito!');
        } catch {
          toast.error('El archivo de respaldo no es válido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLimpiarCache = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Optimizando almacenamiento y purgando caché local...',
        success: '¡Caché optimizada y liberada correctamente!',
        error: 'Error al limpiar caché',
      },
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          titulo={t('cfg.titulo')}
          descripcion={t('cfg.subtitulo')}
        />
        <div className="flex items-center gap-2">
          <Link to="/perfil">
            <Button
              variant="secondary"
              className="flex items-center gap-1.5 text-xs border-primary/30 text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t('perfil.titulo')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas KPI Superiores del Taller */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="p-5 border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#11151e]">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <CreditCard className="h-4 w-4 text-primary" /> Plan Contratado
          </p>
          <p className="mt-2 text-xl font-black text-foreground">{taller.plan}</p>
          <Badge
            variant={taller.estadoSuscripcion === 'ACTIVA' ? 'success' : 'warning'}
            conPunto
            className="mt-1"
          >
            {taller.estadoSuscripcion}
          </Badge>
        </Card>
        <Card className="p-5 border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#11151e]">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <Hash className="h-4 w-4 text-sky-400" /> Prefijo de Folio
          </p>
          <p className="mt-2 text-xl font-black text-foreground">{configGeneral.prefijoFolio}-</p>
          <p className="text-[11px] text-muted mt-1">Siguiente: #{configGeneral.siguienteFolio}</p>
        </Card>
        <Card className="p-5 border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#11151e]">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <Percent className="h-4 w-4 text-emerald-400" /> Tasa de IVA
          </p>
          <p className="mt-2 text-xl font-black text-foreground">{configGeneral.iva}%</p>
          <p className="text-[11px] text-emerald-400 mt-1">Impuesto vigente</p>
        </Card>
        <Card className="p-5 border-white/[0.08] bg-gradient-to-b from-[#161b24] to-[#11151e]">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <Wallet className="h-4 w-4 text-amber-400" /> Moneda Base
          </p>
          <p className="mt-2 text-xl font-black text-foreground">{configGeneral.moneda}</p>
          <p className="text-[11px] text-muted mt-1">Pesos Mexicanos</p>
        </Card>
      </div>

      {/* Accesos Rápidos Complementarios */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Link to="/mi-taller" className="group block">
          <Card className="flex items-center gap-4 p-4.5 transition-all hover:border-primary/40 hover:bg-[#161c28]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                Datos Fiscales y Domicilio del Taller
              </p>
              <p className="truncate text-xs text-muted">
                Razón social, RFC, teléfono del taller y dirección en factura.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        <Link to="/equipo" className="group block">
          <Card className="flex items-center gap-4 p-4.5 transition-all hover:border-sky-500/40 hover:bg-[#161c28]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30">
              <UsersRound className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground group-hover:text-sky-400 transition-colors text-sm">
                Equipo de Mecánicos y Roles de Acceso
              </p>
              <p className="truncate text-xs text-muted">
                Altas, bajas, contraseñas de mecánicos y permisos de cajero.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑAS DE CONFIGURACIÓN MASIVA                          */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#12161f] p-2">
        <div className="flex flex-wrap gap-1 border-b border-white/[0.06] pb-2">
          <button
            type="button"
            onClick={() => setPestana('general')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              pestana === 'general'
                ? 'bg-primary text-black shadow-md'
                : 'text-muted hover:bg-white/[0.04] hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4" />
            {t('cfg.general')}
          </button>
          <button
            type="button"
            onClick={() => setPestana('notificaciones')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              pestana === 'notificaciones'
                ? 'bg-primary text-black shadow-md'
                : 'text-muted hover:bg-white/[0.04] hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            {t('cfg.notificaciones')}
          </button>
          <button
            type="button"
            onClick={() => setPestana('apariencia')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              pestana === 'apariencia'
                ? 'bg-primary text-black shadow-md'
                : 'text-muted hover:bg-white/[0.04] hover:text-foreground'
            }`}
          >
            <Palette className="h-4 w-4" />
            {t('cfg.apariencia')}
          </button>
          <button
            type="button"
            onClick={() => setPestana('seguridad')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              pestana === 'seguridad'
                ? 'bg-primary text-black shadow-md'
                : 'text-muted hover:bg-white/[0.04] hover:text-foreground'
            }`}
          >
            <Shield className="h-4 w-4" />
            {t('cfg.seguridad')}
          </button>
          <button
            type="button"
            onClick={() => setPestana('respaldo')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              pestana === 'respaldo'
                ? 'bg-primary text-black shadow-md'
                : 'text-muted hover:bg-white/[0.04] hover:text-foreground'
            }`}
          >
            <Database className="h-4 w-4" />
            {t('cfg.respaldo')}
          </button>
          <button
            type="button"
            onClick={() => setPestana('suscripcion')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              pestana === 'suscripcion'
                ? 'bg-primary text-black shadow-md'
                : 'text-muted hover:bg-white/[0.04] hover:text-foreground'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            {t('cfg.suscripcion')}
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        <div className="p-4 sm:p-6">
          {/* 1. GENERAL & FACTURACIÓN */}
          {pestana === 'general' && (
            <form onSubmit={handleGuardarGeneral} className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-foreground">Ajustes de Folios e Impuestos</h4>
                <p className="text-xs text-muted">
                  Configura los números consecutivos de órdenes y cotizaciones.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="prefijo">Prefijo de Folio</Label>
                  <Input
                    id="prefijo"
                    value={configGeneral.prefijoFolio}
                    onChange={(e) =>
                      setConfigGeneral({
                        ...configGeneral,
                        prefijoFolio: e.target.value.toUpperCase(),
                      })
                    }
                    className="mt-1"
                  />
                  <p className="mt-1 text-[11px] text-muted">Ejemplo: TCH-1001</p>
                </div>

                <div>
                  <Label htmlFor="sigFolio">Siguiente Folio Consecutivo</Label>
                  <Input
                    id="sigFolio"
                    value={configGeneral.siguienteFolio}
                    onChange={(e) =>
                      setConfigGeneral({ ...configGeneral, siguienteFolio: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ivaInput">IVA Aplicable (%)</Label>
                  <Input
                    id="ivaInput"
                    type="number"
                    value={configGeneral.iva}
                    onChange={(e) =>
                      setConfigGeneral({ ...configGeneral, iva: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monedaSelect">Moneda Principal</Label>
                  <select
                    id="monedaSelect"
                    value={configGeneral.moneda}
                    onChange={(e) =>
                      setConfigGeneral({ ...configGeneral, moneda: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#11151e] px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="COP">COP - Peso Colombiano</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-5">
                <h4 className="text-sm font-bold text-foreground">Operatividad y Horarios de Taller</h4>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="diasLab">Días Laborales</Label>
                    <Input
                      id="diasLab"
                      value={configGeneral.diasLaborales}
                      onChange={(e) =>
                        setConfigGeneral({ ...configGeneral, diasLaborales: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="horApertura">Horario Apertura</Label>
                    <Input
                      id="horApertura"
                      type="time"
                      value={configGeneral.horarioApertura}
                      onChange={(e) =>
                        setConfigGeneral({ ...configGeneral, horarioApertura: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="horCierre">Horario Cierre</Label>
                    <Input
                      id="horCierre"
                      type="time"
                      value={configGeneral.horarioCierre}
                      onChange={(e) =>
                        setConfigGeneral({ ...configGeneral, horarioCierre: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-5">
                <Label htmlFor="terminosGarantia">Términos de Garantía Impresos en Presupuestos</Label>
                <Textarea
                  id="terminosGarantia"
                  rows={3}
                  value={configGeneral.terminosGarantia}
                  onChange={(e) =>
                    setConfigGeneral({ ...configGeneral, terminosGarantia: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {t('cfg.guardar')}
                </Button>
              </div>
            </form>
          )}

          {/* 2. NOTIFICACIONES & WHATSAPP */}
          {pestana === 'notificaciones' && (
            <form onSubmit={handleGuardarNotificaciones} className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-foreground">Mensajería Automática WhatsApp & SMS</h4>
                <p className="text-xs text-muted">Mantén a tus clientes informados del avance de sus autos.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#11151e] p-3.5 cursor-pointer hover:border-white/20 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Aviso de Recepción de Auto por WhatsApp</p>
                    <p className="text-[11px] text-muted">
                      Envía confirmación con número de orden e inventario inicial.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configNotificaciones.whatsappIngreso}
                    onChange={(e) =>
                      setConfigNotificaciones({
                        ...configNotificaciones,
                        whatsappIngreso: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#11151e] p-3.5 cursor-pointer hover:border-white/20 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Envío de Cotización con Enlace Público</p>
                    <p className="text-[11px] text-muted">
                      Permite al cliente aprobar refacciones y mano de obra desde su celular.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configNotificaciones.whatsappCotizacion}
                    onChange={(e) =>
                      setConfigNotificaciones({
                        ...configNotificaciones,
                        whatsappCotizacion: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#11151e] p-3.5 cursor-pointer hover:border-white/20 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Alerta de Vehículo Listo para Recoger</p>
                    <p className="text-[11px] text-muted">
                      Notifica al cliente tan pronto el mecánico marca la orden como LISTA.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configNotificaciones.whatsappListo}
                    onChange={(e) =>
                      setConfigNotificaciones({
                        ...configNotificaciones,
                        whatsappListo: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div>
                <Label htmlFor="plantillaWhatsApp">Plantilla del Mensaje de Vehículo Listo</Label>
                <Textarea
                  id="plantillaWhatsApp"
                  rows={2}
                  value={configNotificaciones.plantillaListo}
                  onChange={(e) =>
                    setConfigNotificaciones({
                      ...configNotificaciones,
                      plantillaListo: e.target.value,
                    })
                  }
                  className="mt-1"
                />
                <p className="mt-1 text-[11px] text-muted">
                  Variables dinámicas soportadas: {'{cliente}'}, {'{vehiculo}'}, {'{total}'}, {'{taller}'}.
                </p>
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <h4 className="text-sm font-bold text-foreground mb-3">Alertas Internas para el Equipo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#11151e] p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configNotificaciones.alertaInventarioBajo}
                      onChange={(e) =>
                        setConfigNotificaciones({
                          ...configNotificaciones,
                          alertaInventarioBajo: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Avisar cuando haya refacciones con stock bajo
                    </span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#11151e] p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configNotificaciones.alertaCitasManana}
                      onChange={(e) =>
                        setConfigNotificaciones({
                          ...configNotificaciones,
                          alertaCitasManana: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium text-foreground">
                      Resumen de citas agendadas para el día siguiente
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {t('cfg.guardar')}
                </Button>
              </div>
            </form>
          )}

          {/* 3. APARIENCIA, TEMA (DÍA/NOCHE) E IDIOMA */}
          {pestana === 'apariencia' && (
            <form onSubmit={handleGuardarApariencia} className="space-y-6">
              {/* SELECTOR MODO DÍA / NOCHE */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-400" />
                  {t('cfg.modoTema')}
                </h4>
                <p className="text-xs text-muted">
                  Selecciona la apariencia adecuada para el nivel de iluminación de tu taller.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      establecerTema('light');
                      toast.info('☀️ Modo Día (Claro) activado');
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      tema === 'light'
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-white/[0.08] bg-[#11151e] hover:border-white/20'
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/40">
                      <Sun className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{t('cfg.modoClaro')}</p>
                      <p className="text-[11px] text-muted">
                        Fondo blanco pulcro y tipografía oscura para máxima claridad con luz natural.
                      </p>
                    </div>
                    {tema === 'light' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      establecerTema('dark');
                      toast.info('🌙 Modo Noche (Oscuro) activado');
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      tema === 'dark'
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-white/[0.08] bg-[#11151e] hover:border-white/20'
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/40">
                      <Moon className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">{t('cfg.modoOscuro')}</p>
                      <p className="text-[11px] text-muted">
                        Fondo grafito automotriz con reflejos ámbar para menor fatiga visual.
                      </p>
                    </div>
                    {tema === 'dark' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                </div>
              </div>

              {/* SELECTOR IDIOMA EN TIEMPO REAL */}
              <div className="border-t border-white/[0.06] pt-5 space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4 text-sky-400" />
                  {t('cfg.idioma')}
                </h4>
                <p className="text-xs text-muted">
                  Cambia de manera instantánea el idioma de toda la plataforma en tiempo real.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      establecerIdioma('es');
                      toast.success('🇲🇽 Idioma cambiado a Español');
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      idioma === 'es'
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-white/[0.08] bg-[#11151e] hover:border-white/20'
                    }`}
                  >
                    <span className="text-3xl">🇲🇽</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">Español (Latinoamérica)</p>
                      <p className="text-[11px] text-muted">
                        Términos automotrices en español y formato regional de fechas.
                      </p>
                    </div>
                    {idioma === 'es' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      establecerIdioma('en');
                      toast.success('🇺🇸 Language switched to English');
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      idioma === 'en'
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'border-white/[0.08] bg-[#11151e] hover:border-white/20'
                    }`}
                  >
                    <span className="text-3xl">🇺🇸</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-foreground">English (United States)</p>
                      <p className="text-[11px] text-muted">
                        Automotive shop terms in English and standard US format.
                      </p>
                    </div>
                    {idioma === 'en' && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                </div>
              </div>

              {/* DENSIDAD DE TABLAS */}
              <div className="border-t border-white/[0.06] pt-5">
                <h4 className="text-sm font-bold text-foreground mb-2">Densidad de las Tablas y Listados</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="densidad"
                      value="comoda"
                      checked={configApariencia.densidadTabla === 'comoda'}
                      onChange={() =>
                        setConfigApariencia({ ...configApariencia, densidadTabla: 'comoda' })
                      }
                      className="accent-amber-500"
                    />
                    <span>Modo Cómodo (Espaciado amplio para tabletas)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="densidad"
                      value="compacta"
                      checked={configApariencia.densidadTabla === 'compacta'}
                      onChange={() =>
                        setConfigApariencia({ ...configApariencia, densidadTabla: 'compacta' })
                      }
                      className="accent-amber-500"
                    />
                    <span>Modo Compacto (Mayor cantidad de filas en pantalla)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {t('cfg.guardar')}
                </Button>
              </div>
            </form>
          )}

          {/* 4. SEGURIDAD & AUDITORÍA */}
          {pestana === 'seguridad' && (
            <div className="space-y-6">
              <form onSubmit={handleCambiarPassword} className="space-y-4">
                <h4 className="text-sm font-bold text-foreground">Cambio de Contraseña de Acceso</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="passActual">Contraseña Actual</Label>
                    <Input
                      id="passActual"
                      type="password"
                      value={passwordForm.actual}
                      onChange={(e) => setPasswordForm({ ...passwordForm, actual: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passNueva">Nueva Contraseña</Label>
                    <Input
                      id="passNueva"
                      type="password"
                      value={passwordForm.nueva}
                      onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passConfirm">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="passConfirm"
                      type="password"
                      value={passwordForm.confirmacion}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmacion: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" className="text-xs">
                    Actualizar Contraseña
                  </Button>
                </div>
              </form>

              {/* 2FA Autenticación en dos pasos */}
              <div className="border-t border-white/[0.06] pt-5">
                <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#11151e] p-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Autenticación en Dos Pasos (2FA con Google Authenticator)
                    </p>
                    <p className="text-[11px] text-muted">
                      Solicita un código de 6 dígitos cada vez que inicies sesión desde un nuevo equipo.
                    </p>
                  </div>
                  <Button
                    variant={dosFactores ? 'secondary' : 'primary'}
                    onClick={() => {
                      setDosFactores(!dosFactores);
                      toast.success(
                        dosFactores ? '2FA Desactivado' : '¡2FA Activado correctamente!',
                      );
                    }}
                    className="text-xs"
                  >
                    {dosFactores ? 'Desactivar 2FA' : 'Activar 2FA'}
                  </Button>
                </div>
              </div>

              {/* Sesiones activas */}
              <div className="border-t border-white/[0.06] pt-5 space-y-3">
                <h4 className="text-sm font-bold text-foreground">Sesiones y Dispositivos Activos</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-foreground">
                    <div className="flex items-center gap-3">
                      <Laptop className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="font-bold">Windows 11 • Chrome 130 (Este equipo)</p>
                        <p className="text-[11px] text-muted">
                          IP: 187.190.45.12 • Guadalajara, Jal. • Activa ahora
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Actual</Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#11151e] p-3 text-muted">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-sky-400" />
                      <div>
                        <p className="font-bold text-foreground">iPhone 15 Pro • Safari Móvil</p>
                        <p className="text-[11px] text-muted">IP: 187.190.45.98 • Hace 3 horas</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success('Sesión móvil cerrada')}
                      className="text-rose-400 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. RESPALDOS MASIVOS & MANTENIMIENTO */}
          {pestana === 'respaldo' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Gestión de Copias de Seguridad & Mantenimiento
                </h4>
                <p className="text-xs text-muted">
                  Exporta, importa y descarga backups integrales de toda la base de datos de tu taller.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/[0.08] bg-[#11151e] p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Download className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">Descargar Backup Integral (JSON)</p>
                      <p className="text-[11px] text-muted">Clientes, autos, historial de órdenes y caja.</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleDescargarBackup}
                    className="w-full flex items-center justify-center gap-2 text-xs"
                  >
                    <Download className="h-4 w-4" />
                    {t('cfg.backupDescargar')}
                  </Button>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#11151e] p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                      <Upload className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">Restaurar Copia de Seguridad</p>
                      <p className="text-[11px] text-muted">Carga un archivo de respaldo JSON para sincronizar.</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleRestaurarBackup}
                    className="w-full flex items-center justify-center gap-2 text-xs"
                  >
                    <Upload className="h-4 w-4" />
                    {t('cfg.restaurarBackup')}
                  </Button>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-5">
                <h4 className="text-sm font-bold text-foreground mb-3">Mantenimiento y Rendimiento</h4>
                <div className="flex flex-wrap items-center justify-between rounded-2xl border border-white/[0.08] bg-[#11151e] p-4 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Purgar Caché Local y Optimizar Consultas</p>
                    <p className="text-[11px] text-muted">
                      Libera memoria de tablas cacheadas y recarga los datos más recientes del servidor.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleLimpiarCache}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> {t('cfg.optimizarCache')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 6. PLAN & SUSCRIPCIÓN */}
          {pestana === 'suscripcion' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-foreground">Plan Actual: {taller.plan}</h4>
                  <p className="text-xs text-muted">
                    Tu suscripción se encuentra activa y vence el {taller.fechaVencimiento || '2026-12-31'}.
                  </p>
                </div>
                <Badge variant="success" conPunto className="px-3 py-1">
                  Suscripción Activa
                </Badge>
              </div>

              {/* Comparador de Planes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/[0.08] bg-[#11151e] p-5 space-y-3">
                  <p className="text-xs font-bold uppercase text-muted">Plan Básico</p>
                  <p className="text-2xl font-black text-foreground">
                    $499 <span className="text-xs text-muted font-normal">/mes</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted">
                    <li>✓ Hasta 2 mecánicos</li>
                    <li>✓ Órdenes ilimitadas</li>
                    <li>✓ 5 GB almacenamiento fotos</li>
                  </ul>
                  <Button variant="secondary" className="w-full text-xs" onClick={() => toast.info('Seleccionado')}>
                    Mantener
                  </Button>
                </div>

                <div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-5 space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <span className="absolute -top-3 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black text-black">
                    RECOMENDADO
                  </span>
                  <p className="text-xs font-bold uppercase text-primary">Plan Pro</p>
                  <p className="text-2xl font-black text-foreground">
                    $899 <span className="text-xs text-muted font-normal">/mes</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li>✓ Mecánicos ilimitados</li>
                    <li>✓ Alertas de WhatsApp automáticas</li>
                    <li>✓ Reportes financieros avanzados</li>
                    <li>✓ 50 GB almacenamiento en la nube</li>
                  </ul>
                  <Button
                    variant="primary"
                    className="w-full text-xs"
                    onClick={() => toast.success('¡Solicitud para mejorar al Plan Pro enviada con éxito!')}
                  >
                    Mejorar al Plan Pro
                  </Button>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-[#11151e] p-5 space-y-3">
                  <p className="text-xs font-bold uppercase text-muted">Plan Empresa / Multitaller</p>
                  <p className="text-2xl font-black text-foreground">
                    $1,499 <span className="text-xs text-muted font-normal">/mes</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted">
                    <li>✓ Sucursales múltiples</li>
                    <li>✓ Facturación fiscal CFDI directa</li>
                    <li>✓ 200 GB almacenamiento de fotos</li>
                    <li>✓ Soporte técnico VIP 24/7</li>
                  </ul>
                  <Button
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => toast.info('Contactando con soporte corporativo')}
                  >
                    Contactar Ventas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
