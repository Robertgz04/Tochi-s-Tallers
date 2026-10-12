-- =========================================================
-- Tochi'sTaller - Migración 002: Operación del taller (FASE 1)
-- Clientes, vehículos, órdenes, cotizaciones y pagos
-- (Servicios, refacciones, evidencias e historial llegan en FASE 3-5)
-- =========================================================

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  nombre VARCHAR(80) NOT NULL,
  apellidos VARCHAR(80) NOT NULL,
  telefono VARCHAR(30),
  whatsapp VARCHAR(30),
  correo VARCHAR(160),
  direccion VARCHAR(240),
  notas TEXT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clientes_taller ON clientes (taller_id);
CREATE INDEX idx_clientes_busqueda ON clientes (lower(nombre), lower(apellidos));
CREATE INDEX idx_clientes_telefono ON clientes (taller_id, telefono);

CREATE TABLE vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes (id) ON DELETE RESTRICT,
  placa VARCHAR(15) NOT NULL,
  vin VARCHAR(20),
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(60) NOT NULL,
  anio INTEGER CHECK (anio BETWEEN 1900 AND 2100),
  color VARCHAR(40),
  motor VARCHAR(60),
  kilometraje INTEGER NOT NULL DEFAULT 0,
  combustible VARCHAR(20) NOT NULL DEFAULT 'GASOLINA'
    CHECK (combustible IN ('GASOLINA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GLP', 'GNC')),
  transmision VARCHAR(20)
    CHECK (transmision IS NULL OR transmision IN ('MANUAL', 'AUTOMATICA', 'CVT', 'OTRO')),
  notas TEXT,
  foto_url TEXT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_vehiculos_kilometraje CHECK (kilometraje >= 0)
);

CREATE UNIQUE INDEX ux_vehiculos_placa ON vehiculos (taller_id, placa);
CREATE UNIQUE INDEX ux_vehiculos_vin ON vehiculos (taller_id, vin)
  WHERE vin IS NOT NULL AND vin <> '';
CREATE INDEX idx_vehiculos_taller ON vehiculos (taller_id);
CREATE INDEX idx_vehiculos_cliente ON vehiculos (cliente_id);

CREATE TABLE ordenes_trabajo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(20) NOT NULL,
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes (id) ON DELETE RESTRICT,
  vehiculo_id UUID NOT NULL REFERENCES vehiculos (id) ON DELETE RESTRICT,
  mecanico_id UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_estimada DATE,
  fecha_finalizacion TIMESTAMPTZ,
  kilometraje_entrada INTEGER NOT NULL DEFAULT 0,
  nivel_combustible VARCHAR(20) NOT NULL DEFAULT 'MITAD'
    CHECK (nivel_combustible IN ('VACIO', 'RESERVA', 'CUARTO', 'MITAD', 'TRES_CUARTOS', 'LLENO')),
  descripcion_cliente TEXT,
  diagnostico TEXT,
  observaciones TEXT,
  estado VARCHAR(30) NOT NULL DEFAULT 'RECIBIDO'
    CHECK (estado IN (
      'RECIBIDO', 'DIAGNOSTICO', 'ESPERANDO_AUTORIZACION', 'AUTORIZADO',
      'EN_REPARACION', 'PRUEBAS', 'LISTO', 'ENTREGADO', 'CANCELADO'
    )),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  impuestos NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_ordenes_importes CHECK (
    subtotal >= 0 AND impuestos >= 0 AND descuento >= 0 AND total >= 0
  )
);

CREATE UNIQUE INDEX ux_ordenes_folio ON ordenes_trabajo (taller_id, folio);
CREATE INDEX idx_ordenes_taller_estado ON ordenes_trabajo (taller_id, estado);
CREATE INDEX idx_ordenes_taller_fecha ON ordenes_trabajo (taller_id, fecha_ingreso DESC);
CREATE INDEX idx_ordenes_mecanico ON ordenes_trabajo (mecanico_id);

CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(20) NOT NULL,
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes (id) ON DELETE RESTRICT,
  vehiculo_id UUID NOT NULL REFERENCES vehiculos (id) ON DELETE RESTRICT,
  orden_id UUID REFERENCES ordenes_trabajo (id) ON DELETE SET NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
    CHECK (estado IN ('BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'VENCIDA')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  impuestos NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  observaciones TEXT,
  token_publico VARCHAR(64) UNIQUE,
  fecha_aprobacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_cotizaciones_importes CHECK (
    subtotal >= 0 AND impuestos >= 0 AND descuento >= 0 AND total >= 0
  )
);

CREATE UNIQUE INDEX ux_cotizaciones_folio ON cotizaciones (taller_id, folio);
CREATE INDEX idx_cotizaciones_taller_estado ON cotizaciones (taller_id, estado);

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  orden_id UUID NOT NULL REFERENCES ordenes_trabajo (id) ON DELETE RESTRICT,
  cliente_id UUID NOT NULL REFERENCES clientes (id) ON DELETE RESTRICT,
  monto NUMERIC(12,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL
    CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'OTRO')),
  referencia VARCHAR(80),
  fecha_pago TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_pagos_monto CHECK (monto > 0)
);

CREATE INDEX idx_pagos_taller_fecha ON pagos (taller_id, fecha_pago DESC);
CREATE INDEX idx_pagos_orden ON pagos (orden_id);
