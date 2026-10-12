import type { PoolClient } from 'pg';
import { hashPassword } from '../utils/password';

export const PASSWORD_DEMO = 'Admin1234!';

/** Fecha hace N días. */
export function fechaAtras(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
}

/**
 * Fecha reciente (hace N días) garantizada dentro del mes en curso.
 * Evita que los datos demo caigan en un mes anterior al inicio de mes.
 */
export function fechaReciente(dias: number): Date {
  const fecha = fechaAtras(dias);
  const hoy = new Date();
  if (fecha.getMonth() !== hoy.getMonth() || fecha.getFullYear() !== hoy.getFullYear()) {
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1, 10, 0, 0);
  }
  return fecha;
}

/** Fecha en un mes anterior, en el día indicado. */
export function fechaMesAtras(meses: number, dia = 15): Date {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - meses);
  fecha.setDate(dia);
  return fecha;
}

export interface IdsDemo {
  tallerId: string;
  adminId: string;
  mecanicoId: string;
  juanId: string;
  anaId: string;
  luisId: string;
  sofiaId: string;
  versaId: string;
  corollaId: string;
  aveoId: string;
  rioId: string;
}

export async function sembrarBase(client: PoolClient): Promise<IdsDemo> {
  const passwordHash = await hashPassword(PASSWORD_DEMO);
  const hoy = new Date();
  const vencimiento = new Date(hoy);
  vencimiento.setFullYear(vencimiento.getFullYear() + 1);
  const hoyCorta = hoy.toISOString().slice(0, 10);
  const vencimientoCorta = vencimiento.toISOString().slice(0, 10);

  const taller = await client.query<{ id: string }>(
    `INSERT INTO talleres (
       nombre, razon_social, telefono, whatsapp, correo, direccion, ciudad, estado,
       codigo_postal, rfc, moneda, zona_horaria, iva, prefijo_folio,
       plan, fecha_inicio, fecha_vencimiento, estado_suscripcion
     ) VALUES (
       'Tochi''s Garage', 'Taller Mecánico Tochi''s Garage SA de CV', '55 1234 5678',
       '5512345678', 'contacto@tochisgarage.test', 'Av. Revolución 1230, Col. Centro',
       'Ciudad de México', 'Ciudad de México', '03300', 'TCG230101KJ5', 'MXN',
       'America/Mexico_City', 16.00, 'TCH', 'PRO', $1, $2, 'ACTIVA'
     )
     RETURNING id`,
    [hoyCorta, vencimientoCorta],
  );

  const tallerId = taller.rows[0].id;

  await client.query(
    `INSERT INTO suscripciones (taller_id, plan, monto, fecha_inicio, fecha_vencimiento, estado)
     VALUES ($1, 'PRO', 899, $2, $3, 'ACTIVA')`,
    [tallerId, hoyCorta, vencimientoCorta],
  );

  const crearUsuario = async (
    nombre: string,
    apellidos: string,
    correo: string,
    rol: string,
  ): Promise<string> => {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO usuarios (taller_id, nombre, apellidos, correo, telefono, password_hash, rol)
       VALUES ($1, $2, $3, lower($4), '55 0000 0000', $5, $6)
       RETURNING id`,
      [tallerId, nombre, apellidos, correo, passwordHash, rol],
    );
    return rows[0].id;
  };

  const adminId = await crearUsuario('Sergio', 'Tochi', 'admin@tochistaller.test', 'PROPIETARIO');
  const mecanicoId = await crearUsuario(
    'Carlos',
    'Méndez',
    'mecanico@tochistaller.test',
    'MECANICO',
  );
  await crearUsuario('María', 'López', 'recepcion@tochistaller.test', 'RECEPCIONISTA');

  const crearCliente = async (
    nombre: string,
    apellidos: string,
    correo: string,
    telefono: string,
  ): Promise<string> => {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO clientes (taller_id, nombre, apellidos, correo, telefono, whatsapp)
       VALUES ($1, $2, $3, $4, $5, $5) RETURNING id`,
      [tallerId, nombre, apellidos, correo, telefono],
    );
    return rows[0].id;
  };

  const juanId = await crearCliente('Juan', 'Pérez', 'juan.perez@test.mx', '55 9876 5432');
  const anaId = await crearCliente('Ana', 'Gutiérrez', 'ana.gutierrez@test.mx', '55 8765 4321');
  const luisId = await crearCliente('Luis', 'Ramírez', 'luis.ramirez@test.mx', '55 7654 3210');
  const sofiaId = await crearCliente(
    'Sofía',
    'Hernández',
    'sofia.hernandez@test.mx',
    '55 6543 2109',
  );

  const crearVehiculo = async (
    clienteId: string,
    placa: string,
    vin: string,
    marca: string,
    modelo: string,
    anio: number,
    color: string,
    kilometraje: number,
  ): Promise<string> => {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO vehiculos (
         taller_id, cliente_id, placa, vin, marca, modelo, anio, color,
         kilometraje, combustible, transmision
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'GASOLINA', 'CVT')
       RETURNING id`,
      [tallerId, clienteId, placa, vin, marca, modelo, anio, color, kilometraje],
    );
    return rows[0].id;
  };

  const versaId = await crearVehiculo(
    juanId,
    'ABC-123-A',
    '3N1CN7AP7KY000001',
    'Nissan',
    'Versa',
    2021,
    'Blanco',
    92450,
  );
  const corollaId = await crearVehiculo(
    anaId,
    'XYZ-987-B',
    '2T1BURHE0JC000002',
    'Toyota',
    'Corolla',
    2019,
    'Plata',
    68300,
  );
  const aveoId = await crearVehiculo(
    luisId,
    'KLM-345-C',
    '3G1JC5240GS000003',
    'Chevrolet',
    'Aveo',
    2016,
    'Rojo',
    134900,
  );
  const rioId = await crearVehiculo(
    sofiaId,
    'RIO-789-D',
    'KNAFK4A61P5000004',
    'Kia',
    'Rio',
    2020,
    'Azul',
    45200,
  );

  return {
    tallerId,
    adminId,
    mecanicoId,
    juanId,
    anaId,
    luisId,
    sofiaId,
    versaId,
    corollaId,
    aveoId,
    rioId,
  };
}
