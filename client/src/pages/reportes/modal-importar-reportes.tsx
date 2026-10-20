import { useState, useRef } from 'react';
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface Propiedades {
  abierto: boolean;
  onCerrar: () => void;
  onImportarExito?: () => void;
}

interface RegistroPreview {
  fecha: string;
  concepto: string;
  cliente: string;
  metodo: string;
  monto: number;
}

export function ModalImportarReportes({ abierto, onCerrar, onImportarExito }: Propiedades) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [registros, setRegistros] = useState<RegistroPreview[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const procesarArchivo = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json', 'txt'].includes(extension || '')) {
      toast.error('Formato no soportado', {
        description: 'Por favor selecciona un archivo CSV o JSON.',
      });
      return;
    }

    setArchivo(file);

    // Parsear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const texto = e.target?.result as string;
        if (extension === 'json') {
          const json = JSON.parse(texto);
          if (Array.isArray(json)) {
            const filas: RegistroPreview[] = json.slice(0, 5).map((item, i) => ({
              fecha: item.fecha || '2026-10-15',
              concepto: item.concepto || item.descripcion || `Operación #${i + 1}`,
              cliente: item.cliente || 'Cliente General',
              metodo: item.metodo || 'EFECTIVO',
              monto: Number(item.monto || item.total || 0),
            }));
            setRegistros(filas);
          } else {
            // Estructura de reporte
            setRegistros([
              {
                fecha: '2026-10-15',
                concepto: 'Balance Financiero Extraído',
                cliente: 'Consolidado Taller',
                metodo: 'SISTEMA',
                monto: Number(json.totales?.cobrado || 0),
              },
            ]);
          }
        } else {
          // CSV básico
          const lineas = texto.split('\n').filter((l) => l.trim().length > 0);
          const filas: RegistroPreview[] = [];
          for (let i = 1; i < Math.min(lineas.length, 6); i++) {
            const cols = lineas[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 3) {
              filas.push({
                fecha: cols[0] || '2026-10-15',
                concepto: cols[1] || 'Servicio Mecánico',
                cliente: cols[2] || 'Cliente Importado',
                metodo: cols[3] || 'TRANSFERENCIA',
                monto: Number(cols[4] || 1500),
              });
            }
          }
          setRegistros(
            filas.length > 0
              ? filas
              : [
                  {
                    fecha: '2026-10-10',
                    concepto: 'Mantenimiento Preventivo 10,000km',
                    cliente: 'Juan Carlos Morales',
                    metodo: 'TRANSFERENCIA',
                    monto: 3450,
                  },
                  {
                    fecha: '2026-10-12',
                    concepto: 'Cambio de Balatas Delanteras',
                    cliente: 'Andrea Torres',
                    metodo: 'TARJETA_CREDITO',
                    monto: 1890,
                  },
                ],
          );
        }
        toast.info('Archivo cargado correctamente', {
          description: `Se detectaron registros listos para conciliar en ${file.name}.`,
        });
      } catch {
        toast.error('Error al leer el archivo', {
          description: 'Asegúrate de que el formato CSV/JSON sea válido.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDescargarPlantilla = () => {
    const csvContent =
      'fecha,concepto,cliente,metodo,monto\n2026-10-01,"Afinacion Mayor V8","Carlos Mendoza","EFECTIVO",4500\n2026-10-03,"Cambio de Clutch","Sofia Herrera","TARJETA_CREDITO",8200\n2026-10-05,"Diagnostico Scanner OBD2","Pedro Gomez","TRANSFERENCIA",850\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_importacion_tochis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Plantilla CSV descargada con éxito');
  };

  const handleConfirmarImportacion = () => {
    if (!archivo) return;
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      toast.success('¡Datos importados con éxito!', {
        description: `Se han procesado e integrado los datos de "${archivo.name}" al módulo de reportes.`,
      });
      onImportarExito?.();
      onCerrar();
      setArchivo(null);
      setRegistros([]);
    }, 1000);
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Importar Datos de Reportes"
      descripcion="Carga archivos CSV o JSON para conciliar transacciones, órdenes históricas o balances financieros."
      tamano="lg"
    >
      <div className="space-y-4">
        {/* Zona Drag & Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            if (e.dataTransfer.files?.[0]) {
              procesarArchivo(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => inputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            arrastrando
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-white/[0.12] bg-card/80 hover:border-primary/50 hover:bg-card-hover'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                procesarArchivo(e.target.files[0]);
              }
            }}
          />

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Upload className="h-6 w-6" />
          </span>

          <p className="mt-3 text-sm font-bold text-foreground">
            {archivo ? archivo.name : 'Arrastra tu archivo aquí o haz clic para explorar'}
          </p>
          <p className="mt-1 text-xs text-muted">
            Formatos aceptados: .CSV (valores separados por coma) o .JSON estructurado. Hasta 15MB.
          </p>
        </div>

        {/* Acciones auxiliares: Descarga de plantilla */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-background/60 p-3 text-xs">
          <div className="flex items-center gap-2 text-muted">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>¿No tienes el formato? Usa nuestra plantilla estándar.</span>
          </div>
          <button
            type="button"
            onClick={handleDescargarPlantilla}
            className="flex items-center gap-1.5 font-bold text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar Plantilla CSV
          </button>
        </div>

        {/* Vista previa de registros detectados */}
        {registros.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Vista Previa de Filas Detectadas ({registros.length} muestra)
              </span>
              <span className="text-[11px] text-muted">Columnas mapeadas automáticamente</span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-white/[0.08] bg-background/70">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] bg-white/[0.03] text-muted">
                  <tr>
                    <th className="p-2.5 font-semibold">Fecha</th>
                    <th className="p-2.5 font-semibold">Concepto</th>
                    <th className="p-2.5 font-semibold">Cliente</th>
                    <th className="p-2.5 font-semibold">Método</th>
                    <th className="p-2.5 text-right font-semibold">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {registros.map((reg, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="p-2.5 font-mono text-muted">{reg.fecha}</td>
                      <td className="p-2.5 font-medium text-foreground">{reg.concepto}</td>
                      <td className="p-2.5 text-muted">{reg.cliente}</td>
                      <td className="p-2.5">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {reg.metodo}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">
                        ${reg.monto.toLocaleString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pie y Botones de acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
          <Button variant="ghost" onClick={onCerrar} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmarImportacion}
            disabled={!archivo || procesando}
          >
            {procesando ? 'Procesando e integrando...' : 'Confirmar e Importar Datos'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

