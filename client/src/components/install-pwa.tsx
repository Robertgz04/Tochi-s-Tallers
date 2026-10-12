import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventoInstalacion extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Muestra el botón de instalación cuando el navegador lo permite
 * (Chrome, Edge, Samsung Internet). En iOS Safari se instruye al usuario
 * manualmente desde el menú de compartir.
 */
export function InstallPWA() {
  const [evento, setEvento] = useState<EventoInstalacion | null>(null);
  const [visible, setVisible] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    const alInstalar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalacion);
      setVisible(true);
    };
    const alInstalada = () => {
      setInstalada(true);
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', alInstalar);
    window.addEventListener('appinstalled', alInstalada);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalada(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', alInstalar);
      window.removeEventListener('appinstalled', alInstalada);
    };
  }, []);

  if (instalada || !visible || !evento) return null;

  const instalar = async () => {
    evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setEvento(null);
  };

  return (
    <Button variant="secondary" size="sm" onClick={instalar}>
      <Download className="h-4 w-4" aria-hidden="true" />
      Instalar Tochi&rsquo;sTaller
    </Button>
  );
}
