import { pool } from '../config/db';
import * as citaRepo from '../repositories/cita.repository';
import * as clienteRepo from '../repositories/cliente.repository';
import { ApiError } from '../utils/ApiError';
import type {
  ActualizarCitaInput,
  CrearCitaInput,
  EstadoCita,
} from '../validators/cita.validators';

export interface CitaResumen {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  estado: EstadoCita;
  clienteId: string | null;
  cliente: string | null;
  vehiculoId: string | null;
  placa: string | null;
  ordenId: string | null;
  responsableId: string | null;
  responsable: string | null;
}

export interface ResultadoCitas {
  items: CitaResumen[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

function aCita(fila: citaRepo.CitaFila): CitaResumen {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    todoElDia: fila.todo_el_dia,
    estado: fila.estado as EstadoCita,
    clienteId: fila.cliente_id,
    cliente: fila.cliente_nombre ?? null,
    vehiculoId: fila.vehiculo_id,
    placa: fila.placa ?? null,
    ordenId: fila.orden_id,
    responsableId: fila.responsable_id,
    responsable: fila.responsable_nombre ?? null,
  };
}

export async function listar(
  tallerId: string,
  filtros: { desde?: string; hasta?: string; estado?: string; busqueda?: string; pagina: number; porPagina: number },
): Promise<ResultadoCitas> {
  const { filas, total } = await citaRepo.listarCitas(pool, tallerId, filtros);
  return {
    items: filas.map(aCita),
    total,
    pagina: filtros.pagina,
    totalPaginas: Math.max(1, Math.ceil(total / filtros.porPagina)),
  };
}

export async function obtener(tallerId: string, id: string): Promise<CitaResumen> {
  const fila = await citaRepo.buscarCita(pool, tallerId, id);
  if (!fila) throw ApiError.noEncontrado('Cita no encontrada en tu taller.');
  return aCita(fila);
}

async function validarCliente(tallerId: string, clienteId?: string | null): Promise<void> {
  if (!clienteId) return;
  const cliente = await clienteRepo.buscarCliente(pool, tallerId, clienteId);
  if (!cliente) throw ApiError.badRequest('El cliente seleccionado no existe en tu taller.');
}

function validarRango(inicio: string, fin: string): void {
  if (new Date(fin).getTime() <= new Date(inicio).getTime()) {
    throw ApiError.badRequest('La fecha de fin debe ser posterior a la de inicio.');
  }
}

export async function crear(tallerId: string, datos: CrearCitaInput): Promise<CitaResumen> {
  await validarCliente(tallerId, datos.clienteId);
  validarRango(datos.fechaInicio, datos.fechaFin);
  const fila = await citaRepo.crearCita(pool, tallerId, {
    clienteId: datos.clienteId || null,
    vehiculoId: datos.vehiculoId || null,
    ordenId: datos.ordenId || null,
    titulo: datos.titulo,
    descripcion: datos.descripcion || null,
    fechaInicio: datos.fechaInicio,
    fechaFin: datos.fechaFin,
    todoElDia: datos.todoElDia ?? false,
    estado: datos.estado ?? 'PROGRAMADA',
    responsableId: datos.responsableId || null,
  });
  if (!fila) throw ApiError.badRequest('No se pudo crear la cita.');
  return aCita(fila);
}

export async function actualizar(tallerId: string, id: string, cambios: ActualizarCitaInput): Promise<CitaResumen> {
  const existente = await citaRepo.buscarCita(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Cita no encontrada en tu taller.');
  if (cambios.clienteId) await validarCliente(tallerId, cambios.clienteId);

  const inicio = cambios.fechaInicio ?? existente.fecha_inicio;
  const fin = cambios.fechaFin ?? existente.fecha_fin;
  validarRango(inicio, fin);

  const fila = await citaRepo.actualizarCita(pool, tallerId, id, {
    cliente_id: cambios.clienteId === undefined ? undefined : cambios.clienteId || null,
    vehiculo_id: cambios.vehiculoId === undefined ? undefined : cambios.vehiculoId || null,
    titulo: cambios.titulo,
    descripcion: cambios.descripcion === undefined ? undefined : cambios.descripcion || null,
    fecha_inicio: cambios.fechaInicio,
    fecha_fin: cambios.fechaFin,
    todo_el_dia: cambios.todoElDia,
    estado: cambios.estado,
    responsable_id: cambios.responsableId === undefined ? undefined : cambios.responsableId || null,
  });
  if (!fila) throw ApiError.noEncontrado('Cita no encontrada en tu taller.');
  return aCita(fila);
}

export async function cambiarEstado(tallerId: string, id: string, estado: EstadoCita): Promise<CitaResumen> {
  const existente = await citaRepo.buscarCita(pool, tallerId, id);
  if (!existente) throw ApiError.noEncontrado('Cita no encontrada en tu taller.');
  const fila = await citaRepo.actualizarCita(pool, tallerId, id, { estado });
  if (!fila) throw ApiError.noEncontrado('Cita no encontrada en tu taller.');
  return aCita(fila);
}

export async function eliminar(tallerId: string, id: string): Promise<void> {
  const existe = await citaRepo.buscarCita(pool, tallerId, id);
  if (!existe) throw ApiError.noEncontrado('Cita no encontrada en tu taller.');
  await citaRepo.eliminarCita(pool, tallerId, id);
}
