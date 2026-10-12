# Tochi'sTaller

Sistema SaaS **PWA** para administrar talleres mecánicos: clientes, vehículos, órdenes de
trabajo, cotizaciones, evidencias y pagos. Funciona en computadora, tablet y celular, y puede
instalarse como aplicación.

> **Estado del proyecto: FASE 1 completada.** La base es funcional de punta a punta:
> frontend + backend + PostgreSQL + autenticación JWT + multi-taller + dashboard + PWA.
> Las fases 2 a 9 (clientes, vehículos, órdenes, cotizaciones, pagos, inventario, agenda,
> reportes, superadmin) se construyen sobre esta base. Ver [Roadmap](#roadmap-de-fases).

---

## 1. ¿Qué es Tochi'sTaller?

Tochi'sTaller reemplaza libretas, hojas de cálculo, Excel y mensajes perdidos por WhatsApp con
un sistema centralizado donde cada taller controla:

- Clientes y sus vehículos
- Órdenes de trabajo con estados y responsables
- Cotizaciones con aprobación del cliente
- Evidencias fotográficas (ANTES / DIAGNÓSTICO / DURANTE / DESPUÉS)
- Pagos parciales y saldos
- Ingresos, estadísticas y reportes

Cada taller tiene sus datos completamente aislados (`taller_id`), y la separación se aplica
**desde el backend**, no desde el frontend.

---

## 2. Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7, Axios, TanStack Query 5, React Hook Form, Zod, Recharts, date-fns, Lucide React, Zustand, Sonner |
| PWA | vite-plugin-pwa (estrategia `injectManifest`), manifest.webmanifest, service worker propio (`client/src/sw.ts`), iconos generados por script |
| Backend | Node.js 22, Express 4, TypeScript (strict), Zod, JWT, bcrypt, helmet, CORS, rate limiting |
| Base de datos | PostgreSQL 14+ con `pg` (SQL parametrizado) y migraciones versionadas |
| Tests / QA | Verificación manual end-to-end en navegador (agente de navegador) |

---

## 3. Requisitos

- **Node.js 18 o superior** (probado en 22.x)
- **npm 9 o superior**
- **PostgreSQL 14 o superior** (local, Docker o servicio gestionado)

---

## 4. Instalación

Clonar o abrir la carpeta del proyecto y ejecutar:

```bash
# Dependencias de la raíz (herramienta de desarrollo concurrente)
npm install

# Dependencias del backend
cd server
npm install

# Dependencias del frontend
cd ../client
npm install

# Iconos PWA (ya incluidos; solo si se modifican)
node scripts/generate-icons.mjs
```

---

## 5. Variables de entorno

El proyecto **nunca** versiona secretos. Usa archivos `.env` locales (ya ignorados por git).

### Backend — `server/.env`

Copia el ejemplo (desde la carpeta `server`):

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tochis_taller
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
JWT_SECRET=cambia-este-secreto-por-un-valor-largo-y-aleatorio
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:5173
```

`JWT_SECRET` es obligatorio (mínimo 10 caracteres); si falta, el servidor se detiene con un
mensaje claro en lugar de arrancar con un secreto inseguro.

### Frontend — `client/.env`

```bash
cp .env.example .env
```

```env
VITE_API_URL=/api
```

En desarrollo, Vite proxea `/api` hacia `http://localhost:4000`. En producción, define aquí la
URL pública de tu API (ej. `https://api.tudominio.com/api`).

---

## 6. Base de datos

Crear la base vacía (una sola vez):

```bash
createdb -U postgres tochis_taller
```

En Windows, si `createdb` no está en el `PATH`, usa el binario del instalador de PostgreSQL:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE tochis_taller;"
```

> El instalador de EDB no crea accesos directos porque PostgreSQL se registra como **servicio de
> Windows** (`postgresql-x64-17`, arranque automático), no como una aplicación de ventana.
> Para inspeccionar la base visualmente, busca **pgAdmin 4** en el menú Inicio.

Aplicar migraciones (desde la carpeta `server`):

```bash
npm run db:migrate
```

Cargar datos demo (opcional, desde la carpeta `server`):

```bash
npm run db:seed
```

Las migraciones viven en `database/migrations/*.sql`, se aplican en orden alfabético y se
registran en la tabla `schema_migrations`, por lo que es seguro ejecutarlas varias veces.

### Credenciales demo (solo para desarrollo)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Propietario | `admin@tochistaller.test` | `Admin1234!` |
| Mecánico | `mecanico@tochistaller.test` | `Admin1234!` |
| Recepción | `recepcion@tochistaller.test` | `Admin1234!` |

Taller: **Tochi's Garage** · Cliente: **Juan Pérez** · Vehículo: **Nissan Versa 2021 (ABC-123-A)**

Estos datos son únicamente demostrativos. Para un entorno limpio, no ejecutes `db:seed` y
registra tu taller desde la pantalla de registro (`/registro`).

---

## 7. Ejecución

### Desarrollo (frontend + backend juntos)

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto inicia la API (`:4000`) y el frontend (`:5173`) en paralelo. Abre **http://localhost:5173**.

### Por separado

```bash
# Terminal 1 — API
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

### Producción

```bash
# Compilar ambos
npm run build

# Ejecutar la API compilada
cd server
npm start
```

El build del frontend genera `client/dist/` con el manifest, el service worker y los chunks
divididos por ruta (code splitting).

### Scripts disponibles

| Comando | Carpeta | Descripción |
| --- | --- | --- |
| `npm run dev` | raíz | Levanta API y cliente juntos |
| `npm run build` | raíz | Compila servidor y cliente |
| `npm run db:migrate` | raíz / `server` | Aplica migraciones pendientes |
| `npm run db:seed` | raíz / `server` | Inserta datos demo (idempotente) |
| `npm run icons` | raíz / `client` | Regenera iconos PNG de la PWA |
| `npm run typecheck` | `server` / `client` | Verificación de tipos |
| `npm run dev` | `server` | API con recarga automática (tsx) |
| `npm run dev` | `client` | Vite dev server con proxy `/api` |
| `npm run preview` | `client` | Sirve el build de producción local |

---

## 8. Arquitectura

```
tochis-taller/
├── client/                 # Frontend (React + TypeScript + Vite)
│   ├── public/icons/       # Iconos PWA generados
│   ├── scripts/            # Generador de iconos
│   └── src/
│       ├── components/     # UI reutilizable, layout, logo, PWA
│       ├── hooks/          # Queries y mutaciones (TanStack Query)
│       ├── lib/            # Cliente Axios y utilidades
│       ├── pages/          # Login, registro, dashboard, equipo, taller
│       ├── routes/         # Definición de rutas
│       ├── services/       # Llamadas a la API por dominio
│       ├── store/          # Estado de autenticación y transiciones (Zustand)
│       ├── types/          # Tipos compartidos
│       └── sw.ts           # Service worker
├── server/                 # Backend (Express + TypeScript)
│   └── src/
│       ├── config/         # Variables de entorno y pool de PostgreSQL
│       ├── controllers/    # Traducen HTTP <-> dominio
│       ├── middlewares/    # auth, roles, taller, validación, errores, rate limit
│       ├── repositories/   # SQL parametrizado (única capa que habla con la BD)
│       ├── routes/         # Definición de endpoints
│       ├── services/       # Lógica de negocio y transacciones
│       ├── types/          # Tipos del dominio
│       ├── utils/          # JWT, bcrypt, errores, mappers
│       ├── validators/     # Esquemas Zod
│       └── db/             # Migraciones y seed
├── database/migrations/    # SQL versionado
├── docs/                   # Documentación técnica
└── README.md
```

**Flujo de una petición:**

```
Cliente React -> services/ (Axios) -> API REST -> routes -> middlewares
  -> controller -> service -> repository -> PostgreSQL
```

- Los **controllers** no contienen lógica de negocio.
- Los **repositories** son la única capa que escribe SQL, siempre parametrizado (`$1`, `$2`...).
- Los **services** manejan transacciones y reglas (ej. registro: taller + usuario + suscripción).
- **Inicio y cierre de sesión con transición**: `useSesionTransicion` muestra una pantalla a
  pantalla completa (bienvenida o despedida) con cuenta regresiva de 3 segundos y redirige sola;
  el estado vive en `store/sesionTransicionStore` y la pantalla se monta una vez en `App.tsx`
  (`components/transicion-sesion.tsx`).
- El **middleware `tallerMiddleware`** toma `taller_id` del token verificado: el cliente
  nunca envía su taller.

### Multi-taller y seguridad

- Cada tabla operativa incluye `taller_id` con índice y llave foránea.
- Todas las consultas filtran por el `taller_id` del JWT.
- Roles `SUPER_ADMIN`, `PROPIETARIO`, `ADMINISTRADOR`, `RECEPCIONISTA`, `MECANICO` controlados
  con `roleMiddleware`.
- Contraseñas con **bcrypt** (10 rounds); los hashes nunca salen por la API.
- JWT con expiración configurable (`JWT_EXPIRES_IN`) e issuer verificado.
- `helmet`, CORS restringido, rate limiting en autenticación, cuerpo JSON limitado a 2 MB y
  validación Zod en body y params.

### Formato de respuestas

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Cliente no encontrado" }
```

Los errores técnicos nunca se exponen al usuario final: el middleware global registra el
detalle en consola y devuelve un mensaje amigable.

---

## 9. API REST (FASE 1)

Base: `http://localhost:4000/api`

### Autenticación

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/registro` | Público | Crea taller (plan TRIAL) + usuario PROPIETARIO y devuelve token |
| POST | `/auth/login` | Público | Inicia sesión con correo y contraseña |
| GET | `/auth/me` | Autenticado | Usuario del token actual |
| PUT | `/auth/cambiar-password` | Autenticado | Cambia la contraseña con la actual |
| POST | `/auth/recuperar` | Público | Genera token de recuperación (60 min) |
| POST | `/auth/restablecer` | Público | Restablece la contraseña con un token válido |

### Taller

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/talleres/mio` | Autenticado | Datos del taller del usuario |
| PUT | `/talleres/mio` | PROPIETARIO, ADMINISTRADOR | Actualiza datos y configuración comercial |

### Usuarios (equipo)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/usuarios` | PROPIETARIO, ADMINISTRADOR | Lista el equipo del taller |
| POST | `/usuarios` | PROPIETARIO, ADMINISTRADOR | Crea un usuario del taller |
| PATCH | `/usuarios/:id` | PROPIETARIO, ADMINISTRADOR | Actualiza rol, nombre o estado |

### Reportes

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/reportes/dashboard` | Autenticado | Métricas, serie de ingresos, órdenes por estado y trabajos recientes |
| GET | `/salud` | Público | Estado del servidor y de la base de datos |

Las rutas de clientes, vehículos, órdenes, cotizaciones y pagos se incorporan en las fases 2-5
respetando el mismo contrato: `{ success, data }`, validación Zod y aislamiento por `taller_id`.

---

## 10. PWA

- `manifest.webmanifest`: nombre **Tochi'sTaller**, short name **Tochi**, display `standalone`,
  tema oscuro, iconos 192, 512 y maskable.
- Service worker propio (`client/src/sw.ts`) con estrategia `injectManifest`:
  precacheo de 20+ archivos estáticos, navegaciones *network first* con respaldo offline y
  estáticos *cache first* con revalidación.
- Botón **Instalar Tochi'sTaller** en el header cuando el navegador lo permite
  (`beforeinstallprompt`). En iOS se instala desde Compartir > "Agregar a pantalla de inicio".
- Los iconos se generan sin dependencias con `node scripts/generate-icons.mjs`.

---

## 11. Roadmap de fases

| Fase | Alcance |
| --- | --- |
| **1 (lista)** | Estructura, PostgreSQL, autenticación, usuarios, taller, layout, sidebar, dashboard, PWA |
| 2 | Clientes y vehículos (CRUD, búsqueda, historial) |
| 3 | Órdenes de trabajo, servicios, refacciones, estados e historial |
| 4 | Cotizaciones, PDF y autorización pública del cliente |
| 5 | Evidencias fotográficas y pagos |
| 6 | Inventario y agenda |
| 7 | Reportes y recordatorios |
| 8 | Offline avanzado y WhatsApp Business Cloud API |
| 9 | Panel superadmin y suscripciones |

---

## 12. Notas técnicas

- **Service worker con `injectManifest`**: se usa un service worker propio en lugar del
  generado por Workbox. Motivo: la ruta del proyecto contiene un apóstrofo (`Tochi'sTaller`) y el
  generador de Workbox no lograba resolver los imports del service worker en ese caso. Además,
  un SW propio deja preparada la caché de datos para la fase 8.
- **PostgreSQL 14+**: se usa `gen_random_uuid()`, disponible de forma nativa desde PostgreSQL 13.
- **Fechas**: la base trabaja con `TIMESTAMPTZ`; el frontend las muestra con `date-fns` en español.
- **Sin dependencias innecesarias**: no se usa ORM, librería de UI ni gestor de estado global
  adicional; solo lo necesario para el stack definido.
- **Seguridad de dependencias**: `server/package.json` incluye `overrides` para `tar` (>= 7.5.22),
  que elimina las vulnerabilidades heredadas de la cadena de instalación de `bcrypt`.
  `npm audit` reporta **0 vulnerabilidades** en los tres paquetes.
- **Editor**: `.vscode/settings.json` fija la versión de TypeScript del proyecto y desactiva la
  descarga automática de tipos, para que el panel de problemas refleje solo errores reales.

### Comandos para verificar que todo está limpio

```bash
npm --prefix server run typecheck   # tipos del backend
npm --prefix client run typecheck   # tipos del frontend (incluye el service worker)
npm run build                       # compila backend + frontend + PWA
npm audit --prefix server           # 0 vulnerabilidades
```