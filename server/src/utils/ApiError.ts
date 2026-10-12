/** Error con código HTTP propio. Se captura en el middleware global de errores. */
export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(mensaje = 'Datos inválidos'): ApiError {
    return new ApiError(400, mensaje);
  }

  static noAutorizado(mensaje = 'No autorizado'): ApiError {
    return new ApiError(401, mensaje);
  }

  static prohibido(mensaje = 'No tienes permisos para realizar esta acción'): ApiError {
    return new ApiError(403, mensaje);
  }

  static noEncontrado(mensaje = 'Recurso no encontrado'): ApiError {
    return new ApiError(404, mensaje);
  }

  static conflicto(mensaje = 'Conflicto con el recurso'): ApiError {
    return new ApiError(409, mensaje);
  }
}
