import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, IdCard } from "lucide-react";
import { Credencial, credencialesService } from "../services/api";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Credenciales() {
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await credencialesService.listar();
        if (activo) setCredenciales(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar las credenciales.");
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
          <h1 className="flex items-center gap-2 font-display text-[30px] font-bold text-ink">
            <IdCard size={28} className="text-primary" /> Mi credencial digital
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            La credencial se genera automáticamente cuando una inscripción queda confirmada.
          </p>
        </div>

        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando credenciales…</p>
          </div>
        ) : error ? (
          <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
            {error}
          </div>
        ) : credenciales.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <IdCard className="mx-auto mb-3 text-ink-muted" size={34} />
            <p className="mb-2 text-sm text-ink-muted">
              Todavía no tienes credenciales disponibles.
            </p>
            <p className="mb-4 text-xs text-ink-muted">
              Necesitas una inscripción confirmada por tu pareja.
            </p>
            <Link to="/inscripciones" className="text-sm font-semibold text-primary">
              Ver mis inscripciones
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {credenciales.map((credencial) => (
              <article
                key={credencial.inscripcionId}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-sm2"
              >
                <div className="bg-[linear-gradient(135deg,#A3152E,#5E0C1B)] px-4 py-3 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
                    Credencial oficial
                  </p>
                  <p className="font-display text-lg font-bold">{credencial.concursoNombre}</p>
                  <p className="text-[11px] opacity-80">{credencial.codigo}</p>
                </div>

                <div className="p-4">
                  <p className="text-[13px] text-ink-muted">
                    Categoría: <strong className="text-ink">{credencial.categoriaNombre}</strong>
                  </p>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Pareja:{" "}
                    <strong className="text-ink">
                      {credencial.solicitante.nombre} {credencial.solicitante.apellido} y{" "}
                      {credencial.pareja.nombre} {credencial.pareja.apellido}
                    </strong>
                  </p>
                  <p className="mt-1 text-[12px] text-ink-muted">
                    {formatearFecha(credencial.fechaInicio)}
                    {credencial.fechaFin ? ` - ${formatearFecha(credencial.fechaFin)}` : ""} ·{" "}
                    {credencial.concursoLugar}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        credencial.completa
                          ? "bg-[#EAF5EF] text-success"
                          : "bg-[#FFF4E0] text-[#9A6B00]"
                      }`}
                    >
                      {credencial.completa ? "Completa" : "Falta foto"}
                    </span>

                    <Link
                      to={`/credencial/${credencial.inscripcionId}`}
                      className="text-xs font-semibold text-primary no-underline hover:underline"
                    >
                      Ver credencial →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
