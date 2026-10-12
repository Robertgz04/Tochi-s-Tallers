import type { Request, Response } from 'express';
import * as clienteService from '../services/cliente.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId } from '../utils/request';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const busqueda = typeof req.query.q === 'string' ? req.query.q : undefined;
  const clientes = await clienteService.listarClientes(tallerId(req), busqueda);
  responderExito(res, clientes);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const cliente = await clienteService.obtenerCliente(tallerId(req), req.params.id);
  responderExito(res, cliente);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const nuevo = await clienteService.crearCliente(tallerId(req), req.body);
  responderExito(res, nuevo, 201);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const actualizado = await clienteService.actualizarCliente(tallerId(req), req.params.id, req.body);
  responderExito(res, actualizado);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await clienteService.eliminarCliente(tallerId(req), req.params.id);
  responderExito(res, { mensaje: 'Cliente eliminado correctamente.' });
});
