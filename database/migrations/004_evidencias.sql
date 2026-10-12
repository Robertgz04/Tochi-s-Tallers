-- =========================================================
-- Tochi'sTaller - Migración 004: Evidencias fotográficas (FASE 5)
-- Fotos por orden de trabajo: ANTES / DIAGNOSTICO / DURANTE / DESPUES
-- =========================================================

CREATE TABLE orden_evidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  orden_id UUID NOT NULL REFERENCES ordenes_trabajo (id) ON DELETE CASCADE,
  etapa VARCHAR(20) NOT NULL
    CHECK (etapa IN ('ANTES', 'DIAGNOSTICO', 'DURANTE', 'DESPUES')),
  url TEXT NOT NULL,
  nombre_archivo VARCHAR(255),
  mime VARCHAR(80),
  tamano_bytes INTEGER NOT NULL DEFAULT 0,
  descripcion TEXT,
  creado_por UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_evidencias_tamano CHECK (tamano_bytes >= 0)
);

CREATE INDEX idx_evidencias_orden ON orden_evidencias (orden_id, created_at DESC);
CREATE INDEX idx_evidencias_taller ON orden_evidencias (taller_id);
