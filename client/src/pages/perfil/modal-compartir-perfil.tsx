import { Check, Copy, QrCode, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { PerfilData } from './modal-editar-perfil';

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  perfil: PerfilData;
}

export function ModalCompartirPerfil({ abierto, onCerrar, perfil }: Propiedades) {
  const [copiado, setCopiado] = useState(false);
  const urlPerfil = window.location.origin + '/perfil';

  const handleCopiarEnlace = () => {
    navigator.clipboard.writeText(urlPerfil);
    setCopiado(true);
    toast.success('¡Enlace copiado al portapapeles!');
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleCompartirWhatsApp = () => {
    const texto = encodeURIComponent(
      `¡Hola! Te comparto mi perfil profesional en Tochi's Taller: ${perfil.nombre} ${perfil.apellidos} (${perfil.puesto}).\nConsulta mis trabajos y servicios aquí: ${urlPerfil}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Compartir Ficha de Perfil"
      descripcion="Comparte tu perfil profesional de mecánico con clientes y colegas estilo Snapchat/Instagram."
      tamano="md"
    >
      <div className="space-y-4">
        {/* Tarjeta Visual de Perfil (Snapcard) */}
        <div className="relative mx-auto max-w-xs overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-surface to-background p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-primary/20">
          <div className="absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-primary/20 blur-xl pointer-events-none" />

          {/* Avatar / GIF */}
          <div className="mx-auto relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            {perfil.fotoUrl ? (
              <img
                src={perfil.fotoUrl}
                alt={perfil.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/25 text-2xl font-black text-primary">
                {perfil.nombre.charAt(0)}
              </div>
            )}
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-400 shadow-sm" />
          </div>

          {/* Identidad */}
          <h4 className="mt-3 text-lg font-black text-foreground">
            {perfil.nombre} {perfil.apellidos}
          </h4>
          <p className="text-xs font-bold text-primary">{perfil.handle || '@mecanico_tochi'}</p>
          <p className="mt-0.5 text-[11px] text-muted">{perfil.puesto || 'Técnico Especialista'}</p>

          {/* Simulación Código QR / Snapcode */}
          <div className="my-4 mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm shadow-inner">
            <QrCode className="h-full w-full text-foreground/80 opacity-90" />
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-[11px] text-muted">
            <p className="font-semibold text-foreground">Tochi’s Taller Mecánico</p>
            <p className="text-[10px] text-primary">{perfil.estadoEmoji} {perfil.estadoAnimo || 'En línea'}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            onClick={handleCopiarEnlace}
            className="w-full flex items-center justify-center gap-2"
          >
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? '¡Enlace Copiado!' : 'Copiar Enlace de Perfil'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleCompartirWhatsApp}
            className="w-full flex items-center justify-center gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Share2 className="h-4 w-4" />
            Compartir por WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}

