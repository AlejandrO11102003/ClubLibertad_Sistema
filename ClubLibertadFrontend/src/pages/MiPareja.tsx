import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, X } from "lucide-react";
import { Inscripcion, inscripcionesService } from "../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

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

export default function MiPareja() {
  const [pendientes, setPendientes] = useState<Inscripcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionId, setAccionId] = useState<number | null>(null);
  const [alerta, setAlerta] = useState<Alerta>(null);

  const cargar = async () => {
    try {
      const data = await inscripcionesService.pendientes();
      setPendientes(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const responder = async (id: number, aceptar: boolean) => {
    setAccionId(id);
    setAlerta(null);

    try {
      if (aceptar) {
        await inscripcionesService.aceptar(id);
        setAlerta({
          tipo: "exito",
          texto: "Solicitud aceptada. La inscripción quedó confirmada.",
        });
      } else {
        await inscripcionesService.rechazar(id);
        setAlerta({ tipo: "exito", texto: "Solicitud rechazada." });
      }

      setPendientes((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo responder la solicitud.",
      });
    } finally {
      setAccionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS 
          </Link>

          <nav className="flex items-center gap-3 text-[13px]">
            <Link to="/inscripciones" className="font-medium text-ink-muted no-underline hover:text-primary">
              Mis inscripciones
            </Link>
            <Link to="/notificaciones" className="font-medium text-ink-muted no-underline hover:text-primary">
              Notificaciones
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-[30px] font-bold text-ink">Mi pareja</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Revisa las invitaciones que otros bailarines te enviaron.
          </p>
        </div>

        {alerta && (
          <div
            role="alert"
            className={`mb-5 flex items-start gap-2.5 rounded-btn border-l-[3px] px-3.5 py-3 text-[13px] ${
              alerta.tipo === "error"
                ? "border-danger bg-blush text-danger"
                : "border-success bg-[#EAF5EF] text-success"
            }`}
          >
            <span>{alerta.tipo === "error" ? "⚠️" : "✅"}</span>
            <span>{alerta.texto}</span>
          </div>
        )}

        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando solicitudes…</p>
          </div>
        ) : error ? (
          <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
            {error}
          </div>
        ) : pendientes.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="mb-2 text-sm text-ink-muted">
              No tienes solicitudes de pareja pendientes.
            </p>
            <Link to="/concursos" className="text-sm font-semibold text-primary">
              Explorar concursos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map((solicitud) => (
              <article
                key={solicitud.id}
                className="rounded-card border border-line bg-surface p-5 shadow-sm2"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {solicitud.solicitanteNombre
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-bold text-ink">
                      {solicitud.solicitanteNombre}
                    </h2>
                    <p className="text-[13px] text-ink-muted">
                      Te invita a participar en{" "}
                      <strong className="text-ink">{solicitud.concursoNombre}</strong>
                    </p>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      Categoría: <strong className="text-ink">{solicitud.categoriaNombre}</strong>
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <CalendarDays size={14} />
                      Enviada: {formatearFechaHora(solicitud.fechaSolicitud)} · Vence:{" "}
                      {formatearFechaHora(solicitud.fechaVencimiento)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => responder(solicitud.id, false)}
                    disabled={accionId === solicitud.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-btn border border-line px-4 py-2 text-sm font-medium text-ink-muted transition hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={16} /> Rechazar
                  </button>
                  <button
                    onClick={() => responder(solicitud.id, true)}
                    disabled={accionId === solicitud.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {accionId === solicitud.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    ) : (
                      <Check size={16} />
                    )}
                    Aceptar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
