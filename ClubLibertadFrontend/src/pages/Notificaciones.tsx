import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, Heart } from "lucide-react";
import { Notificacion, notificacionesService } from "../services/api";

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

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await notificacionesService.listar();
        if (activo) setNotificaciones(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar las notificaciones.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarTodas = async () => {
    if (noLeidas === 0) return;
    setMarcando(true);

    try {
      await notificacionesService.marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err: any) {
      setError(err?.message || "No se pudieron marcar como leídas.");
    } finally {
      setMarcando(false);
    }
  };

  const marcarUna = async (id: number) => {
    try {
      await notificacionesService.marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch {
      // silencioso: no bloquea la lectura
    }
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS
          </Link>

          <nav className="flex items-center gap-3 text-[13px]">
            <Link to="/mi-pareja" className="font-medium text-ink-muted no-underline hover:text-primary">
              Mi pareja
            </Link>
            <Link to="/inscripciones" className="font-medium text-ink-muted no-underline hover:text-primary">
              Mis inscripciones
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="flex items-center gap-2 font-display text-[30px] font-bold text-ink">
              <Bell size={26} className="text-primary" /> Notificaciones
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {noLeidas > 0
                ? `Tienes ${noLeidas} notificación${noLeidas === 1 ? "" : "es"} sin leer.`
                : "Estás al día con tus notificaciones."}
            </p>
          </div>

          <button
            onClick={marcarTodas}
            disabled={marcando || noLeidas === 0}
            className="inline-flex items-center justify-center gap-2 rounded-btn border border-line px-4 py-2 text-[13px] font-medium text-ink-muted transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={16} /> Marcar todas como leídas
          </button>
        </div>

        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando notificaciones…</p>
          </div>
        ) : error ? (
          <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
            {error}
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <Bell className="mx-auto mb-3 text-ink-muted" size={32} />
            <p className="text-sm text-ink-muted">Todavía no tienes notificaciones.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notificaciones.map((notificacion) => {
              const destino =
                notificacion.tipo === "SOLICITUD_PAREJA" ? "/mi-pareja" : "/inscripciones";

              return (
                <article
                  key={notificacion.id}
                  className={`rounded-card border p-4 shadow-sm2 transition ${
                    notificacion.leida
                      ? "border-line bg-surface"
                      : "border-primary/25 bg-blush/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        notificacion.leida
                          ? "bg-cream text-ink-muted"
                          : "bg-primary text-white"
                      }`}
                    >
                      {notificacion.tipo === "SOLICITUD_PAREJA" ? (
                        <Heart size={16} />
                      ) : (
                        <Bell size={16} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-ink">
                        {notificacion.mensaje}
                      </p>
                      <p className="mt-1 text-[11px] text-ink-muted">
                        {formatearFechaHora(notificacion.createdAt)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <Link
                          to={destino}
                          className="text-xs font-semibold text-primary no-underline hover:underline"
                        >
                          Ver detalle
                        </Link>

                        {!notificacion.leida && (
                          <button
                            onClick={() => marcarUna(notificacion.id)}
                            className="text-xs font-medium text-ink-muted hover:text-primary"
                          >
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>

                    {!notificacion.leida && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
