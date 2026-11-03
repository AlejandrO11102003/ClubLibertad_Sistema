// Configuración centralizada de API y cliente HTTP para Spring Boot
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

export type TipoDocumento = "DNI" | "CE";

export interface LoginRequest {
  tipoDocumento: TipoDocumento;
  dni: string;
  password: string;
}

export interface ForgotPasswordRequest {
  tipoDocumento: TipoDocumento;
  dni: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RegistroBailarinRequest {
  tipoDocumento: TipoDocumento;
  dni: string;
  anioNacimiento: number;
  password: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  nacionalidad?: string;
  genero?: string;
  categoria?: string;
  academiaActual?: string;
}

export interface Perfil {
  id?: number;
  usuarioId: number;
  dni?: string;
  tipoDocumento?: TipoDocumento;
  anioNacimiento?: number;
  rol?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  nacionalidad?: string;
  genero?: string;
  categoria?: string;
  academiaActual?: string;
  anioInicio?: number;
  marineraFavorita?: string;
  biografia?: string;
  fotografiaUrl?: string;
}

export type PerfilRequest = Omit<
  Perfil,
  "id" | "usuarioId" | "dni" | "anioNacimiento" | "rol"
>;

export type EstadoConcurso = "BORRADOR" | "PUBLICADO" | "CERRADO";

export interface Categoria {
  id: number;
  nombre: string;
  edadMin?: number;
  edadMax?: number;
  genero?: string;
  activa?: boolean;
}

export interface CategoriaRequest {
  nombre: string;
  edadMin?: number;
  edadMax?: number;
  genero?: string;
  activa?: boolean;
}

export interface CategoriaConcurso {
  id: number;
  categoriaId: number;
  nombre: string;
  edadMin?: number;
  edadMax?: number;
  genero?: string;
  cupo?: number;
  precio?: number;
}

export interface Concurso {
  id: number;
  nombre: string;
  bannerUrl?: string;
  fechaInicio: string;
  fechaFin?: string;
  lugar: string;
  estado: EstadoConcurso;
  categorias: CategoriaConcurso[];
  createdAt?: string;
}

export interface ConcursoCategoriaInput {
  categoriaId: number;
  cupo?: number;
  precio?: number;
}

export interface ConcursoRequest {
  nombre: string;
  bannerUrl?: string;
  fechaInicio: string;
  fechaFin?: string;
  lugar: string;
  estado?: EstadoConcurso;
  categorias: ConcursoCategoriaInput[];
}

export type EstadoInscripcion = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "VENCIDA";

export interface Inscripcion {
  id: number;
  concursoId: number;
  concursoNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  solicitanteId: number;
  solicitanteNombre: string;
  parejaId: number;
  parejaNombre: string;
  estado: EstadoInscripcion;
  fechaSolicitud: string;
  fechaRespuesta?: string;
  fechaVencimiento: string;
}

export interface InscripcionRequest {
  concursoId: number;
  categoriaId: number;
  parejaTipoDocumento?: TipoDocumento;
  parejaDni: string;
}

export interface BailarinBusqueda {
  tipoDocumento?: TipoDocumento;
  dni: string;
  nombre?: string;
  apellido?: string;
  categoria?: string;
  ciudad?: string;
  fotografiaUrl?: string;
}

export interface BailarinDestacado {
  id: number;
  nombre?: string;
  apellido?: string;
  ciudad?: string;
  categoria?: string;
  fotografiaUrl?: string;
  nivelEstrellas?: number;
  totalPrimeros: number;
  totalParticipaciones: number;
}

export type TipoNotificacion =
  | "SOLICITUD_PAREJA"
  | "SOLICITUD_ACEPTADA"
  | "SOLICITUD_RECHAZADA";

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
  referenciaId?: number;
  leida: boolean;
  createdAt: string;
}

export interface CredencialBailarin {
  nombre?: string;
  apellido?: string;
  dni?: string;
  ciudad?: string;
  fotografiaUrl?: string;
}

export interface Credencial {
  inscripcionId: number;
  codigo: string;
  concursoId: number;
  concursoNombre: string;
  concursoLugar: string;
  fechaInicio: string;
  fechaFin?: string;
  categoriaNombre: string;
  estadoInscripcion: EstadoInscripcion;
  completa: boolean;
  faltantes: string[];
  solicitante: CredencialBailarin;
  pareja: CredencialBailarin;
}

export type EstadoImportacion = "COMPLETADA" | "CON_ERRORES";

export interface Importacion {
  id: number;
  archivo: string;
  estado: EstadoImportacion;
  filasValidas: number;
  filasInvalidas: number;
  errores: string[];
  createdAt: string;
}

export interface AdminDashboard {
  bailarinesRegistrados: number;
  concursosTotal: number;
  concursosPublicados: number;
  concursosCerrados: number;
  inscripcionesTotal: number;
  inscripcionesPendientes: number;
  inscripcionesConfirmadas: number;
  resultadosPublicados: number;
  categoriasTotal: number;
  inscripcionesRecientes: Inscripcion[];
  proximosConcursos: Concurso[];
  ultimasImportaciones: Importacion[];
}

export interface Resultado {
  id: number;
  concursoId: number;
  concursoNombre: string;
  fechaInicio?: string;
  fechaFin?: string;
  categoriaId: number;
  categoriaNombre: string;
  inscripcionId: number;
  solicitanteId: number;
  solicitanteNombre: string;
  parejaId: number;
  parejaNombre: string;
  posicion: number;
  puntaje?: number;
  publicado: boolean;
}

export type TipoLogro = "CAMPEON" | "SUBCAMPEON" | "TERCER_LUGAR";

export interface Logro {
  id: number;
  tipo: TipoLogro;
  descripcion: string;
  concursoId: number;
  concursoNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  fecha?: string;
}

export interface TrayectoriaItem {
  concursoId: number;
  concursoNombre: string;
  fechaInicio: string;
  categoriaId: number;
  categoriaNombre: string;
  posicion: number;
  puntaje?: number;
  parejaId: number;
  parejaNombre: string;
}

export interface PerfilPublico {
  usuarioId: number;
  nombre?: string;
  apellido?: string;
  ciudad?: string;
  fotografiaUrl?: string;
  categoria?: string;
  academiaActual?: string;
  anioInicio?: number;
  marineraFavorita?: string;
  biografia?: string;
  nivelEstrellas?: number;
  nivelPendiente: boolean;
  totalConcursos: number;
  totalParticipaciones: number;
  totalPrimeros: number;
  totalSegundos: number;
  totalTerceros: number;
  promedioPosicion?: number;
  mejorPosicion?: number;
  logros: Logro[];
  trayectoria: TrayectoriaItem[];
}

export interface LoginResponse {
  token?: string;
  jwt?: string;
  accessToken?: string;
  tokenType?: string;
  tipo?: string;
  expiraEn?: number;
  dni?: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  role?: string;
  roles?: string[];
  usuario?: {
    id?: number;
    dni?: string;
    nombre?: string;
    apellido?: string;
    rol?: string;
    [key: string]: any;
  };
  mensaje?: string;
  message?: string;
  [key: string]: any;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  status: number;
  data: any;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    data?: any,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}


export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let responseData: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let errorMessage = "Ocurrió un error en el servidor";
    let fieldErrors: Record<string, string> | undefined;

    if (responseData) {
      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (
        responseData.data &&
        typeof responseData.data === "object" &&
        !Array.isArray(responseData.data)
      ) {
        fieldErrors = responseData.data as Record<string, string>;
        const primerError = Object.values(fieldErrors)[0];
        if (primerError) errorMessage = primerError;
      }

      if (!fieldErrors) {
        if (responseData.mensaje) {
          errorMessage = responseData.mensaje;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }
    } else if (response.status === 401) {
      errorMessage = "Credenciales incorrectas. Verifica tu DNI y contraseña.";
    } else if (response.status === 403) {
      errorMessage = "No tienes permisos para acceder a este recurso.";
    } else if (response.status === 404) {
      errorMessage = "El recurso solicitado no fue encontrado.";
    }

    throw new ApiError(errorMessage, response.status, responseData, fieldErrors);
  }

  return responseData as T;
}

/**
 * Igual que apiFetch, pero desenvuelve el sobre { success, message, data }
 * que devuelve el backend.
 */
export async function apiFetchData<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch<ApiEnvelope<T> | T>(endpoint, options);

  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "data" in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
}

/**
 * Sube archivos con multipart/form-data. No fuerza Content-Type para que
 * el navegador agregue el boundary correcto.
 */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  let responseData: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let mensaje = "No se pudo subir el archivo";
    let fieldErrors: Record<string, string> | undefined;

    if (responseData) {
      if (
        responseData.data &&
        typeof responseData.data === "object" &&
        !Array.isArray(responseData.data)
      ) {
        fieldErrors = responseData.data as Record<string, string>;
        const primero = Object.values(fieldErrors)[0];
        if (primero) mensaje = primero;
      }

      if (!fieldErrors && (responseData.message || responseData.mensaje)) {
        mensaje = responseData.message || responseData.mensaje;
      }
    }

    throw new ApiError(mensaje, response.status, responseData, fieldErrors);
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    "success" in responseData &&
    "data" in responseData
  ) {
    return responseData.data as T;
  }

  return responseData as T;
}


export const authService = {

  async forgotPassword(data: ForgotPasswordRequest): Promise<string | null> {
    return apiFetchData<string | null>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiFetchData<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiFetchData<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  async registrarBailarin(data: RegistroBailarinRequest): Promise<any> {
    return apiFetchData<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async me(): Promise<Perfil> {
    return apiFetchData<Perfil>("/auth/me");
  },


  guardarSesion(data: LoginResponse, recordar: boolean = false): void {
    const storage = recordar ? localStorage : sessionStorage;
    const token = data.token || data.accessToken || data.jwt;

    if (token) {
      storage.setItem("token", token);
      // Mantener en localStorage para retrocompatibilidad
      localStorage.setItem("token", token);
    }

    if (data.rol || data.role) {
      const rol = data.rol || data.role;
      storage.setItem("rol", rol as string);
      localStorage.setItem("rol", rol as string);
    }

    if (data.usuario) {
      storage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
    } else if (data.dni) {
      storage.setItem("usuario", JSON.stringify({ dni: data.dni, nombre: data.nombre }));
      localStorage.setItem("usuario", JSON.stringify({ dni: data.dni, nombre: data.nombre }));
    }
  },

  
  obtenerToken(): string | null {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  
  obtenerUsuario(): any | null {
    const raw = localStorage.getItem("usuario") || sessionStorage.getItem("usuario");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  
  obtenerRol(): string | null {
    return localStorage.getItem("rol") || sessionStorage.getItem("rol");
  },

  
  cerrarSesion(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("rol");
    sessionStorage.removeItem("usuario");
  },
};


export const perfilService = {

  async obtener(): Promise<Perfil> {
    return apiFetchData<Perfil>("/perfil");
  },

  async actualizar(data: PerfilRequest): Promise<Perfil> {
    return apiFetchData<Perfil>("/perfil", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};


export const concursosService = {

  async listar(): Promise<Concurso[]> {
    return apiFetchData<Concurso[]>("/concursos");
  },

  async obtener(id: number | string): Promise<Concurso> {
    return apiFetchData<Concurso>(`/concursos/${id}`);
  },
};


export const categoriasService = {

  async listar(): Promise<Categoria[]> {
    return apiFetchData<Categoria[]>("/categorias");
  },
};

export const adminCategoriasService = {

  async listar(): Promise<Categoria[]> {
    return apiFetchData<Categoria[]>("/admin/categorias");
  },

  async crear(data: CategoriaRequest): Promise<Categoria> {
    return apiFetchData<Categoria>("/admin/categorias", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async actualizar(id: number | string, data: CategoriaRequest): Promise<Categoria> {
    return apiFetchData<Categoria>(`/admin/categorias/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async cambiarActiva(id: number | string, activa: boolean): Promise<Categoria> {
    return apiFetchData<Categoria>(`/admin/categorias/${id}/activa`, {
      method: "PATCH",
      body: JSON.stringify({ activa }),
    });
  },
};


export const adminConcursosService = {

  async listar(): Promise<Concurso[]> {
    return apiFetchData<Concurso[]>("/admin/concursos");
  },

  async obtener(id: number | string): Promise<Concurso> {
    return apiFetchData<Concurso>(`/admin/concursos/${id}`);
  },

  async crear(data: ConcursoRequest): Promise<Concurso> {
    return apiFetchData<Concurso>("/admin/concursos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async actualizar(id: number | string, data: ConcursoRequest): Promise<Concurso> {
    return apiFetchData<Concurso>(`/admin/concursos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async eliminar(id: number | string): Promise<void> {
    return apiFetchData<void>(`/admin/concursos/${id}`, {
      method: "DELETE",
    });
  },
};


export const inscripcionesService = {

  async crear(data: InscripcionRequest): Promise<Inscripcion> {
    return apiFetchData<Inscripcion>("/inscripciones", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async mias(): Promise<Inscripcion[]> {
    return apiFetchData<Inscripcion[]>("/inscripciones/mias");
  },

  async pendientes(): Promise<Inscripcion[]> {
    return apiFetchData<Inscripcion[]>("/inscripciones/pendientes");
  },

  async aceptar(id: number | string): Promise<Inscripcion> {
    return apiFetchData<Inscripcion>(`/inscripciones/${id}/aceptar`, {
      method: "POST",
    });
  },

  async rechazar(id: number | string): Promise<Inscripcion> {
    return apiFetchData<Inscripcion>(`/inscripciones/${id}/rechazar`, {
      method: "POST",
    });
  },
};


export const bailarinesService = {

  async buscarPorDni(
    dni: string,
    tipoDocumento: TipoDocumento = "DNI"
  ): Promise<BailarinBusqueda> {
    return apiFetchData<BailarinBusqueda>(
      `/bailarines/buscar?tipoDocumento=${tipoDocumento}&dni=${encodeURIComponent(dni)}`
    );
  },

  async obtenerPerfilPublico(usuarioId: number | string): Promise<PerfilPublico> {
    return apiFetchData<PerfilPublico>(
      `/bailarines/${usuarioId}/perfil-publico`
    );
  },

  async destacados(limite: number = 6): Promise<BailarinDestacado[]> {
    return apiFetchData<BailarinDestacado[]>(
      `/bailarines/destacados?limite=${limite}`
    );
  },
};

export const trayectoriaService = {

  async mia(): Promise<PerfilPublico> {
    return apiFetchData<PerfilPublico>("/trayectoria/mia");
  },
};


export const notificacionesService = {

  async listar(): Promise<Notificacion[]> {
    return apiFetchData<Notificacion[]>("/notificaciones");
  },

  async contarNoLeidas(): Promise<number> {
    return apiFetchData<number>("/notificaciones/no-leidas");
  },

  async marcarLeida(id: number | string): Promise<void> {
    return apiFetchData<void>(`/notificaciones/${id}/leer`, {
      method: "PATCH",
    });
  },

  async marcarTodasLeidas(): Promise<void> {
    return apiFetchData<void>("/notificaciones/leer-todas", {
      method: "PATCH",
    });
  },
};


export const credencialesService = {

  async listar(): Promise<Credencial[]> {
    return apiFetchData<Credencial[]>("/credenciales");
  },

  async obtener(inscripcionId: number | string): Promise<Credencial> {
    return apiFetchData<Credencial>(`/credenciales/${inscripcionId}`);
  },
};


export const adminDashboardService = {

  async obtener(): Promise<AdminDashboard> {
    return apiFetchData<AdminDashboard>("/admin/dashboard");
  },
};

export interface AdminBailarin {
  id: number;
  dni?: string;
  nombre?: string;
  apellido?: string;
  ciudad?: string;
  categoria?: string;
  academiaActual?: string;
  nivelEstrellas?: number;
  activo: boolean;
  totalInscripciones: number;
  totalResultados: number;
  createdAt?: string;
}

export interface AdminBailarinFiltros {
  texto?: string;
  activo?: boolean;
  categoria?: string;
}

export const adminBailarinesService = {

  async listar(filtros: AdminBailarinFiltros = {}): Promise<AdminBailarin[]> {
    const params = new URLSearchParams();

    if (filtros.texto) params.set("texto", filtros.texto);
    if (filtros.activo !== undefined) params.set("activo", String(filtros.activo));
    if (filtros.categoria) params.set("categoria", filtros.categoria);

    const query = params.toString();
    return apiFetchData<AdminBailarin[]>(
      `/admin/bailarines${query ? `?${query}` : ""}`
    );
  },

  async obtener(id: number | string): Promise<AdminBailarin> {
    return apiFetchData<AdminBailarin>(`/admin/bailarines/${id}`);
  },

  async cambiarActivo(id: number | string, activo: boolean): Promise<AdminBailarin> {
    return apiFetchData<AdminBailarin>(`/admin/bailarines/${id}/activo`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    });
  },
};

export interface AdminInscripcionFiltros {
  concursoId?: number | string;
  categoriaId?: number | string;
  estado?: EstadoInscripcion;
  texto?: string;
}

export const adminInscripcionesService = {

  async listar(filtros: AdminInscripcionFiltros = {}): Promise<Inscripcion[]> {
    const params = new URLSearchParams();

    if (filtros.concursoId) params.set("concursoId", String(filtros.concursoId));
    if (filtros.categoriaId) params.set("categoriaId", String(filtros.categoriaId));
    if (filtros.estado) params.set("estado", filtros.estado);
    if (filtros.texto) params.set("texto", filtros.texto);

    const query = params.toString();
    return apiFetchData<Inscripcion[]>(
      `/admin/inscripciones${query ? `?${query}` : ""}`
    );
  },

  async obtener(id: number | string): Promise<Inscripcion> {
    return apiFetchData<Inscripcion>(`/admin/inscripciones/${id}`);
  },

  async exportar(concursoId: number | string): Promise<void> {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${API_URL}/admin/inscripciones/${concursoId}/exportar`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new ApiError("No se pudo exportar las inscripciones", response.status);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `inscripciones-concurso-${concursoId}.xlsx`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  },
};


export const resultadosService = {

  async listarPorConcurso(concursoId: number | string): Promise<Resultado[]> {
    return apiFetchData<Resultado[]>(
      `/concursos/${concursoId}/resultados`
    );
  },

  async mios(): Promise<Resultado[]> {
    return apiFetchData<Resultado[]>("/resultados/mios");
  },
};


export const adminResultadosService = {

  async importar(concursoId: number | string, archivo: File): Promise<Importacion> {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return apiUpload<Importacion>(
      `/admin/resultados/importar?concursoId=${concursoId}`,
      formData
    );
  },

  async listarImportaciones(): Promise<Importacion[]> {
    return apiFetchData<Importacion[]>("/admin/resultados/importaciones");
  },

  async listarResultados(concursoId: number | string): Promise<Resultado[]> {
    return apiFetchData<Resultado[]>(
      `/admin/resultados?concursoId=${concursoId}`
    );
  },

  async descargarPlantilla(): Promise<void> {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/resultados/plantilla`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new ApiError("No se pudo descargar la plantilla", response.status);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "plantilla-resultados.xlsx";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  },
};


// =====================================================================
// Anuncios publicitarios (carrusel del landing)
// =====================================================================

export interface Anuncio {
  id: number;
  titulo: string;
  entidad?: string;
  descripcion?: string;
  imagenUrl: string;
  enlaceUrl?: string;
  activo: boolean;
  orden: number;
  fechaInicio?: string;
  fechaFin?: string;
  vigente?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnuncioRequest {
  titulo: string;
  entidad?: string;
  descripcion?: string;
  imagenUrl: string;
  enlaceUrl?: string;
  activo?: boolean;
  orden?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ImagenSubida {
  url: string;
}

/**
 * Convierte una ruta relativa del backend (/uploads/...) en una URL absoluta.
 * Las URLs externas se devuelven sin cambios.
 */
export function resolverImagen(url?: string | null): string {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const origen = API_URL.replace(/\/api\/?$/i, "");
  return `${origen}${url.startsWith("/") ? "" : "/"}${url}`;
}

export const anunciosService = {

  async listar(): Promise<Anuncio[]> {
    return apiFetchData<Anuncio[]>("/anuncios");
  },
};

export const adminAnunciosService = {

  async listar(): Promise<Anuncio[]> {
    return apiFetchData<Anuncio[]>("/admin/anuncios");
  },

  async crear(data: AnuncioRequest): Promise<Anuncio> {
    return apiFetchData<Anuncio>("/admin/anuncios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async actualizar(id: number | string, data: AnuncioRequest): Promise<Anuncio> {
    return apiFetchData<Anuncio>(`/admin/anuncios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async cambiarActivo(id: number | string, activo: boolean): Promise<Anuncio> {
    return apiFetchData<Anuncio>(`/admin/anuncios/${id}/activo`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    });
  },

  async mover(id: number | string, direccion: "SUBIR" | "BAJAR"): Promise<Anuncio[]> {
    return apiFetchData<Anuncio[]>(`/admin/anuncios/${id}/mover`, {
      method: "PATCH",
      body: JSON.stringify({ direccion }),
    });
  },

  async eliminar(id: number | string): Promise<void> {
    await apiFetchData<null>(`/admin/anuncios/${id}`, { method: "DELETE" });
  },

  async subirImagen(archivo: File): Promise<ImagenSubida> {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return apiUpload<ImagenSubida>("/admin/anuncios/imagen", formData);
  },
};
