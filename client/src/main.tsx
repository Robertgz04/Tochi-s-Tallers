import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { useThemeStore } from './store/themeStore';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

// PWA: actualización automática del service worker.
registerSW({ immediate: true });

/** Toast del sistema que respeta el tema activo (día/noche). */
function AppToaster() {
  const tema = useThemeStore((estado) => estado.tema);
  return <Toaster theme={tema} position="top-right" richColors closeButton />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <AppToaster />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
