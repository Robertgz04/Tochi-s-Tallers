import type { UsuarioFila } from '../repositories/usuario.repository';
import type { TallerFila } from '../repositories/taller.repository';
import type { UsuarioPublico } from '../types/auth';
import type { Taller } from '../types/taller';

export function aUsuarioPublico(fila: UsuarioFila): UsuarioPublico {
  return {
    id: fila.id,
    tallerId: fila.taller_id,
    nombre: fila.nombre,
    apellidos: fila.apellidos,
    correo: fila.correo,
    telefono: fila.telefono,
    rol: fila.rol,
    fotoUrl: fila.foto_url,
    activo: fila.activo,
    ultimoAcceso: fila.ultimo_acceso,
  };
}

export function aTaller(fila: TallerFila): Taller {
  return {
    id: fila.id,
    nombre: fila.nombre,
    razonSocial: fila.razon_social,
    logoUrl: fila.logo_url,
    telefono: fila.telefono,
    whatsapp: fila.whatsapp,
    correo: fila.correo,
    direccion: fila.direccion,
    ciudad: fila.ciudad,
    estado: fila.estado,
    codigoPostal: fila.codigo_postal,
    rfc: fila.rfc,
    moneda: fila.moneda,
    zonaHoraria: fila.zona_horaria,
    iva: fila.iva,
    prefijoFolio: fila.prefijo_folio,
    activo: fila.activo,
    plan: fila.plan,
    fechaInicio: fila.fecha_inicio,
    fechaVencimiento: fila.fecha_vencimiento,
    estadoSuscripcion: fila.estado_suscripcion,
    fechaCreacion: fila.created_at,
  };
}
