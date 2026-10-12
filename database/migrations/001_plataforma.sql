-- =========================================================
-- Tochi'sTaller - Migración 001: Plataforma (FASE 1)
-- Talleres, usuarios, suscripciones y recuperación de contraseña
-- PostgreSQL 14+
-- =========================================================

CREATE TABLE talleres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(120) NOT NULL,
  razon_social VARCHAR(160),
  logo_url TEXT,
  telefono VARCHAR(30),
  whatsapp VARCHAR(30),
  correo VARCHAR(160),
  direccion VARCHAR(240),
  ciudad VARCHAR(80),
  estado VARCHAR(80),
  codigo_postal VARCHAR(10),
  rfc VARCHAR(20),
  moneda VARCHAR(10) NOT NULL DEFAULT 'MXN',
  zona_horaria VARCHAR(64) NOT NULL DEFAULT 'America/Mexico_City',
  iva NUMERIC(5,2) NOT NULL DEFAULT 16.00,
  prefijo_folio VARCHAR(10) NOT NULL DEFAULT 'TCH',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  plan VARCHAR(20) NOT NULL DEFAULT 'TRIAL'
    CHECK (plan IN ('TRIAL', 'BASICO', 'PRO', 'EMPRESA')),
  fecha_inicio DATE,
  fecha_vencimiento DATE,
  estado_suscripcion VARCHAR(20) NOT NULL DEFAULT 'ACTIVA'
    CHECK (estado_suscripcion IN ('ACTIVA', 'SUSPENDIDA', 'VENCIDA', 'CANCELADA')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_talleres_iva CHECK (iva >= 0 AND iva <= 100)
);

CREATE INDEX idx_talleres_activo ON talleres (activo);

-- taller_id es NULL únicamente para usuarios SUPER_ADMIN de la plataforma.
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID REFERENCES talleres (id) ON DELETE CASCADE,
  nombre VARCHAR(80) NOT NULL,
  apellidos VARCHAR(80) NOT NULL,
  correo VARCHAR(160) NOT NULL,
  telefono VARCHAR(30),
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL
    CHECK (rol IN ('SUPER_ADMIN', 'PROPIETARIO', 'ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO')),
  foto_url TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_usuarios_taller CHECK (rol = 'SUPER_ADMIN' OR taller_id IS NOT NULL)
);

CREATE UNIQUE INDEX ux_usuarios_correo ON usuarios (lower(correo));
CREATE INDEX idx_usuarios_taller ON usuarios (taller_id);

CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id UUID NOT NULL REFERENCES talleres (id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL
    CHECK (plan IN ('TRIAL', 'BASICO', 'PRO', 'EMPRESA')),
  monto NUMERIC(10,2) NOT NULL DEFAULT 0,
  moneda VARCHAR(10) NOT NULL DEFAULT 'MXN',
  fecha_inicio DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA'
    CHECK (estado IN ('ACTIVA', 'SUSPENDIDA', 'VENCIDA', 'CANCELADA')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_suscripciones_fechas CHECK (fecha_vencimiento >= fecha_inicio)
);

CREATE INDEX idx_suscripciones_taller ON suscripciones (taller_id);
CREATE INDEX idx_suscripciones_vencimiento ON suscripciones (fecha_vencimiento);

CREATE TABLE tokens_recuperacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expira_en TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tokens_usuario ON tokens_recuperacion (usuario_id);
