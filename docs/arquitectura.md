# Arquitectura técnica — Tochi'sTaller

Documento de referencia de la FASE 1. Complementa el `README.md`.

## 1. Principios aplicados

1. **Aislamiento por taller en el servidor.** El `taller_id` se toma del JWT verificado. El
   frontend nunca lo envía y el backend nunca lo acepta desde el body o la query.
2. **Capas con responsabilidad única.** `route → middleware → controller → service → repository`.
   Solo los repositories conocen SQL.
3. **Consultas parametrizadas.** Todo acceso a datos usa `pg` con parámetros `$1...$n`.
4. **Errores amigables.** El usuario nunca ve stack traces ni códigos HTTP crudos.
5. **Sin lógica complexa en la UI.** Los componentes de presentación no hacen consultas ni
   reglas de negocio; consumen hooks (`useQueries.ts`) y services.

## 2. Autenticación

```
POST /api/auth/login
  → authService.login()            (valida contra la BD con bcrypt)
  → firmarToken({ sub, correo, rol, tallerId })
  → { success: true, data: { token, usuario } }
```

- El token viaja como `Authorization: Bearer <jwt>`.
- El interceptor de Axios lo agrega a cada petición; si la API responde `401`, el store de
  Zustand limpia la sesión y redirige a `/login`.
- `ProtectedRoute` valida la sesión en el arranque contra `/api/auth/me`.
- Recuperación de contraseña: se genera un token aleatorio (24 bytes, base64url) con expiración
  de 60 minutos, guardado en `tokens_recuperacion`. En desarrollo la API devuelve
  `tokenPrueba` para poder probar el flujo sin servidor de correo.

## 3. Roles

| Rol | Alcance |
| --- | --- |
| `SUPER_ADMIN` | Plataforma (panel en fase 9). `taller_id` nulo. |
| `PROPIETARIO` | Control total de su taller |
| `ADMINISTRADOR` | Operaciones y equipo del taller |
| `RECEPCIONISTA` | Clientes, vehículos, cotizaciones y órdenes (fases 2-4) |
| `MECANICO` | Trabajos asignados, estados y evidencias (fases 3-5) |

Implementación: `roleMiddleware('PROPIETARIO', 'ADMINISTRADOR')` en la ruta, combinado con
`tallerMiddleware`.

## 4. Modelo de datos (FASE 1)

```
talleres ──< usuarios
    │           └──< tokens_recuperacion
    ├──< suscripciones
    ├──< clientes ──< vehiculos
    │       ├──< ordenes_trabajo >── usuarios (mecánico)
    │       │        ├──< pagos
    │       └──< cotizaciones >── ordenes_trabajo
    ├──< cotizaciones
    └──< pagos
```

- UUIDs como llaves primarias, `gen_random_uuid()` por defecto.
- `CHECK` constraints para estados, roles, métodos de pago y rangos de importes.
- Índices compuestos por `taller_id` en todas las entidades operativas (consultas siempre
  filtran por taller).
- Índices únicos: `usuarios.lower(correo)`, `vehiculos(taller_id, placa)`, VIN parcial,
  `ordenes_trabajo(taller_id, folio)`, `cotizaciones(taller_id, folio)`.
- `ON DELETE CASCADE` al taller (borrado lógico en la práctica vía `activo`),
  `RESTRICT` en clientes/vehículos para no perder historial financiero.

## 5. Decisiones de diseño

- **Sin ORM**: SQL versionado a mano en `database/migrations/`, ejecutado por un runner propio
  que registra cada archivo en `schema_migrations`. Ventaja: consultas-BAJO y control total de
  índices; el runner aplica cada archivo dentro de una transacción.
- **Dashboard en una sola consulta por indicador** (7 consultas en paralelo vía `Promise.all`)
  contra un pool de 10 conexiones: suficiente para un taller mediano sin caer en N+1.
- **Zustand solo para autenticación**; el resto del estado de servidor vive en TanStack Query
  con `staleTime` por recurso.
- **Tailwind CSS 4 con tokens semánticos** (`bg-background`, `bg-card`, `text-muted`,
  `text-primary`): cambiar la paleta completa se hace en `client/src/index.css`.
- **Iconos PWA generados por script** (codificador PNG propio, sin dependencias ni recursos con
  copyright).

## 6. Rendimiento

- Code splitting por ruta con `React.lazy` (login, registro, dashboard, equipo, taller).
- Bundle inicial ~142 kB gzip; la librería de gráficas (Recharts) se carga solo con el dashboard.
- Paginación del lado del servidor prevista para las fases 2+ (`Pagination` y `DataTable` ya la
  soportan).

## 7. Verificación realizada en la FASE 1

- `npm run build` (servidor y cliente) sin errores de TypeScript en modo `strict`.
- Migraciones y seed aplicados sobre PostgreSQL real.
- API probada con peticiones reales: login correcto e incorrecto, `me`, dashboard, taller, equipo.
- Seguridad: `401` sin token, `401` con contraseña errónea, `403` para roles no autorizados.
- Navegador: login → dashboard con gráficas y tabla, vista móvil (390 px) sin scroll horizontal,
  páginas de Equipo y Mi taller.
- PWA: manifest, service worker e iconos generados en el build de producción.