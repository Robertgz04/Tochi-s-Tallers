export const ROLES = [
  'SUPER_ADMIN',
  'PROPIETARIO',
  'ADMINISTRADOR',
  'RECEPCIONISTA',
  'MECANICO',
] as const;

export type Rol = (typeof ROLES)[number];

/** Roles con capacidad de administrar operaciones y usuarios del taller. */
export const ROLES_ADMINISTRADORES: readonly Rol[] = ['PROPIETARIO', 'ADMINISTRADOR'];

/** Roles con control total del taller. */
export const ROLES_PROPIETARIO: readonly Rol[] = ['PROPIETARIO'];

export function esRol(valor: unknown): valor is Rol {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
}
