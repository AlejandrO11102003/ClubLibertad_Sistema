# Entre Pañuelos — Sistemas de Marinera

Proyecto con backend Spring Boot (`ClubLibertadBackend`), frontend React (`ClubLibertadFrontend`) y base de datos PostgreSQL en Docker.

## Requisitos

- Docker Desktop
- Java 17 o superior
- Node.js y npm

## Puesta en marcha desde cero

```powershell
git clone https://github.com/jhonalo9/ClubLibertad_Sistema.git
cd ClubLibertad_Sistema
```

El archivo `.env` **no** se versiona (contiene configuración local). Se crea a partir del ejemplo:

```powershell
cd ClubLibertadFrontend
Copy-Item .env.example .env
```

> Las credenciales que aparecen en este README, en `docker-compose.yml` y en
> `application.properties` son **valores por defecto para desarrollo local**.
> En producción deben sobreescribirse con variables de entorno
> (`DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`, etc.).

## Base de datos (Docker)

La base de datos corre en el puerto **5433** del host para no chocar con un PostgreSQL local en el 5432.

```powershell
# Iniciar la base de datos
docker compose up -d db

# Ver estado (debe aparecer "healthy")
docker compose ps

# Ver logs
docker compose logs -f db

# Detener conservando los datos
docker compose down

# Detener y borrar todos los datos
docker compose down -v
```

Credenciales de desarrollo:

| Parámetro | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5433` |
| Base de datos | `entre_panuelos` |
| Usuario | `postgres` |
| Contraseña | `postgres` |

Las tablas y los datos semilla se crean automáticamente con Flyway al iniciar el backend.

Para conectarse manualmente:

```powershell
docker exec -it entre_panuelos_db psql -U postgres -d entre_panuelos
```

## Backend

```powershell
cd ClubLibertadBackend
.\mvnw.cmd spring-boot:run
```

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

### Cuentas de prueba

| DNI | Contraseña | Rol |
|---|---|---|
| `00000001` | `admin123` | Administrador |
| `12345678` | `bailarin123` | Bailarín |
| `87654321` | `bailarin123` | Bailarín |
| `11223344` | `bailarin123` | Bailarín |

La URL de la base de datos se puede sobreescribir con la variable de entorno `DB_URL`:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5433/entre_panuelos"
```

## Frontend

```powershell
cd ClubLibertadFrontend
npm install
npm start
```

- Aplicación: `http://localhost:3000`

### Rutas principales

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Inicio |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Registro de bailarín |
| `/panel` | BAILARIN | Panel principal del bailarín |
| `/perfil` | Autenticado | Perfil editable |
| `/concursos` | Público | Listado de concursos |
| `/concursos/:id` | Público | Detalle del concurso |
| `/resultados` | Público | Resultados publicados e historial |
| `/como-funciona` | Público | Guía completa de la plataforma |
| `/comunidad` | Público | Bailarines destacados y servicios |
| `/bailarines/:id` | Público | Perfil público, trayectoria y nivel |
| `/admin` | ADMIN | Dashboard del panel administrativo |
| `/admin/concursos` | ADMIN | Gestión de concursos |
| `/admin/inscripciones` | ADMIN | Supervisión de inscripciones |
| `/admin/bailarines` | ADMIN | Gestión de cuentas de bailarines |
| `/admin/categorias` | ADMIN | Gestión de categorías |
| `/admin/anuncios` | ADMIN | Publicidad del carrusel de inicio |
| `/admin/resultados` | ADMIN | Carga de resultados desde Excel |
| `/inscripcion/:concursoId` | Autenticado | Solicitar inscripción con pareja |
| `/inscripciones` | Autenticado | Mis inscripciones |
| `/mi-pareja` | Autenticado | Solicitudes de pareja pendientes |
| `/notificaciones` | Autenticado | Notificaciones internas |
| `/credencial` | Autenticado | Credenciales disponibles |
| `/credencial/:inscripcionId` | Autenticado | Credencial digital de una inscripción |

### Nivel competitivo

El nivel se calcula automáticamente al publicar resultados y se expresa de 0.0 a 5.0 estrellas:

- **40%** rendimiento según la posición promedio.
- **30%** proporción de primeros puestos.
- **20%** experiencia según cantidad de participaciones.
- **10%** trayectoria en años.

Si el bailarín todavía no tiene resultados publicados, el nivel queda como **pendiente**.

## Anuncios (publicidad del inicio)

El hero del landing muestra un **carrusel de flyers** cuando existen anuncios activos y vigentes. Si no hay ninguno, se muestra la tarjeta del bailarín con mejor nivel competitivo.

- Se administran en `/admin/anuncios`.
- Las imágenes se suben desde el panel (JPG, PNG o WEBP, máximo 5 MB) y se guardan en `ClubLibertadBackend/uploads/anuncios/`.
- Esa carpeta **no se versiona** en Git.
- Se pueden programar con fecha de inicio y fin, reordenar y activar o desactivar.
