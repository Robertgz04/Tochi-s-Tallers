import type { Request, Response } from 'express';
import * as vehiculoService from '../services/vehiculo.service';
import { asyncHandler } from '../utils/asyncHandler';
import { responderExito } from '../utils/response';
import { tallerId } from '../utils/request';

export const listar = asyncHandler(async (req: Request, res: Response) => {
  const vehiculos = await vehiculoService.listarVehiculos(tallerId(req), {
    busqueda: typeof req.query.q === 'string' ? req.query.q : undefined,
    clienteId: typeof req.query.clienteId === 'string' ? req.query.clienteId : undefined,
  });
  responderExito(res, vehiculos);
});

export const obtener = asyncHandler(async (req: Request, res: Response) => {
  const vehiculo = await vehiculoService.obtenerVehiculo(tallerId(req), req.params.id);
  responderExito(res, vehiculo);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const nuevo = await vehiculoService.crearVehiculo(tallerId(req), req.body);
  responderExito(res, nuevo, 201);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const actualizado = await vehiculoService.actualizarVehiculo(tallerId(req), req.params.id, req.body);
  responderExito(res, actualizado);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await vehiculoService.eliminarVehiculo(tallerId(req), req.params.id);
  responderExito(res, { mensaje: 'Vehículo eliminado correctamente.' });
});
