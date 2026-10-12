-- =========================================================
-- Tochi'sTaller - Migración 003: Inventario y Agenda (FASE 6)
-- Refacciones/productos de inventario y citas de agenda
-- PostgreSQL 14+
-- =========================================================

CREATE TABLE inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  sku VARCHAR(40) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(60),
  unidad VARCHAR(20) NOT NULL DEFAULT 'PZA',
  costo NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  ubicacion VARCHAR(80),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_inventario_stock CHECK (stock >= 0 AND stock_minimo >= 0),
  CONSTRAINT chk_inventario_precios CHECK (costo >= 0 AND precio >= 0)
);

CREATE UNIQUE INDEX ux_inventario_sku ON inventario (taller_id, sku);
CREATE INDEX idx_inventario_taller ON inventario (taller_id);
CREATE INDEX idx_inventario_stock_bajo ON inventario (taller_id, stock)
  WHERE activo;

CREATE TABLE inventario_movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventario (id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL
    CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
  cantidad INTEGER NOT NULL,
  motivo VARCHAR(200),
  usuario_id UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  orden_id UUID REFERENCES ordenes_trabajo (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_movimientos_cantidad CHECK (cantidad <> 0)
);

CREATE INDEX idx_movimientos_item ON inventario_movimientos (item_id);
CREATE INDEX idx_movimientos_taller_fecha ON inventario_movimientos (taller_id, created_at DESC);

CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes (id) ON DELETE CASCADE,
  vehiculo_id UUID REFERENCES vehiculos (id) ON DELETE SET NULL,
  orden_id UUID REFERENCES ordenes_trabajo (id) ON DELETE SET NULL,
  titulo VARCHAR(160) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  todo_el_dia BOOLEAN NOT NULL DEFAULT FALSE,
  estado VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADA'
    CHECK (estado IN ('PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA')),
  responsable_id UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_citas_rango CHECK (fecha_fin > fecha_inicio)
);

CREATE INDEX idx_citas_taller_fecha ON citas (taller_id, fecha_inicio);
CREATE INDEX idx_citas_responsable ON citas (responsable_id);
CREATE INDEX idx_citas_cliente ON citas (cliente_id);
