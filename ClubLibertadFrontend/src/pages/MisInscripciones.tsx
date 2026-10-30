import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, IdCard, Users } from "lucide-react";
import {
  EstadoInscripcion,
  Inscripcion,
  authService,
  inscripcionesService,
} from "../services/api";

const formatearFechaHora = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const badge = (estado: EstadoInscripcion) => {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-[#EAF5EF] text-success";
    case "RECHAZADA":
      return "bg-blush text-danger";
    case "VENCIDA":
      return "bg-line text-ink-muted";
    default:
      return "bg-[#FFF4E0] text-[#9A6B00]";
  }
};

const etiqueta = (estado: EstadoInscripcion) => {
  switch (estado) {
    case "CONFIRMADA":
      return "Confirmada";
    case "RECHAZADA":
      return "Rechazada";
    case "VENCIDA":
      return "Vencida";
    default:
      return "Pendiente";
  }
};

export default function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const usuario = authService.obtenerUsuario();
  const miId = usuario?.id;

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await inscripcionesService.mias();
        if (activo) setInscripciones(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar tus inscripciones.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS
          </Link>

          <nav className="flex items-center gap-3 text-[13px]">
            <Link to="/concursos" className="font-medium text-ink-muted no-underline hover:text-primary">
              Concursos
            </Link>
            <Link to="/mi-pareja" className="font-medium text-ink-muted no-underline hover:text-primary">
              Mi pareja
            </Link>
            <Link to="/notificaciones" className="font-medium text-ink-muted no-underline hover:text-primary">
              Notificaciones
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-[30px] font-bold text-ink">Mis inscripciones</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Revisa el estado de tus solicitudes y participaciones confirmadas.
            </p>
          </div>
          <Link
            to="/concursos"
            className="rounded-btn bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline hover:bg-primary-hover"
          >
            Buscar un concurso
          </Link>
        </div>

        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando inscripciones…</p>
          </div>
        ) : error ? (
          <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
            {error}
          </div>
        ) : inscripciones.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="mb-2 text-sm text-ink-muted">
              Todavía no tienes inscripciones registradas.
            </p>
            <Link to="/concursos" className="text-sm font-semibold text-primary">
              Explorar concursos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {inscripciones.map((inscripcion) => {
              const esSolicitante = inscripcion.solicitanteId === miId;
              const contraparte = esSolicitante
                ? inscripcion.parejaNombre
                : inscripcion.solicitanteNombre;

              return (
                <article
                  key={inscripcion.id}
                  className="rounded-card border border-line bg-surface p-5 shadow-sm2"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="font-display text-lg font-bold text-ink">
                        {inscripcion.concursoNombre}
                      </h2>
                      <p className="mt-1 text-[13px] text-ink-muted">
                        Categoría: <strong className="text-ink">{inscripcion.categoriaNombre}</strong>
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${badge(
                        inscripcion.estado
                      )}`}
                    >
                      {etiqueta(inscripcion.estado)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-line pt-4 text-[13px] sm:grid-cols-2">
                    <p className="flex items-center gap-2 text-ink-muted">
                      <Users size={15} />
                      {esSolicitante ? "Pareja: " : "Solicitante: "}
                      <strong className="text-ink">{contraparte}</strong>
                    </p>
                    <p className="flex items-center gap-2 text-ink-muted">
                      <CalendarDays size={15} />
                      Solicitada: {formatearFechaHora(inscripcion.fechaSolicitud)}
                    </p>
                    <p className="text-ink-muted">
                      {inscripcion.estado === "CONFIRMADA"
                        ? `Confirmada: ${formatearFechaHora(inscripcion.fechaRespuesta)}`
                        : `Vence: ${formatearFechaHora(inscripcion.fechaVencimiento)}`}
                    </p>
                    <p className="text-ink-muted">
                      Tu rol: <strong className="text-ink">{esSolicitante ? "Solicitante" : "Pareja"}</strong>
                    </p>
                  </div>

                  {inscripcion.estado === "PENDIENTE" && !esSolicitante && (
                    <div className="mt-4 flex justify-end">
                      <Link
                        to="/mi-pareja"
                        className="rounded-btn bg-primary px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-primary-hover"
                      >
                        Responder solicitud
                      </Link>
                    </div>
                  )}

                  {inscripcion.estado === "CONFIRMADA" && (
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/credencial/${inscripcion.id}`}
                        className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-primary-hover"
                      >
                        <IdCard size={15} /> Ver credencial
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
