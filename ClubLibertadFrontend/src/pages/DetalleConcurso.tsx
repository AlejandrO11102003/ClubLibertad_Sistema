import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { Concurso, authService, concursosService } from "../services/api";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "Por definir";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function DetalleConcurso() {
  const { id } = useParams<{ id: string }>();
  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autenticado = Boolean(authService.obtenerToken());

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await concursosService.obtener(id || "");
        if (activo) setConcurso(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudo cargar el concurso.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS
          </Link>
          <Link to="/concursos" className="text-[13px] font-semibold text-primary no-underline">
            Ver todos los concursos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando concurso…</p>
          </div>
        ) : error || !concurso ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="mb-3 text-sm text-ink-muted">{error || "Concurso no encontrado."}</p>
            <Link to="/concursos" className="text-sm font-semibold text-primary">
              Volver al listado
            </Link>
          </div>
        ) : (
          <>
            <div className="relative mb-6 h-56 w-full overflow-hidden rounded-card bg-[linear-gradient(135deg,#A3152E,#5E0C1B)] shadow-sm2">
              {concurso.bannerUrl ? (
                <img
                  src={concurso.bannerUrl}
                  alt={concurso.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🎗️</div>
              )}
              <span
                className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  concurso.estado === "PUBLICADO"
                    ? "bg-[#EAF5EF] text-success"
                    : "bg-surface text-ink-muted"
                }`}
              >
                {concurso.estado === "PUBLICADO" ? "Inscripciones abiertas" : "Concurso cerrado"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
              <section>
                <h1 className="font-display text-[32px] font-bold leading-tight text-ink">
                  {concurso.nombre}
                </h1>

                <div className="mt-4 flex flex-col gap-2 text-sm text-ink-muted">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} /> {formatearFecha(concurso.fechaInicio)}
                    {concurso.fechaFin ? ` al ${formatearFecha(concurso.fechaFin)}` : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} /> {concurso.lugar}
                  </p>
                </div>

                <div className="mt-8">
                  <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-ink">
                    <Users size={18} /> Categorías
                  </h2>

                  {concurso.categorias.length === 0 ? (
                    <p className="rounded-card border border-line bg-surface p-4 text-sm text-ink-muted">
                      Este concurso todavía no tiene categorías registradas.
                    </p>
                  ) : (
                    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm2">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
                          <tr>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3">Edad</th>
                            <th className="px-4 py-3">Cupo</th>
                            <th className="px-4 py-3">Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {concurso.categorias.map((cat) => (
                            <tr key={cat.id} className="border-t border-line">
                              <td className="px-4 py-3 font-medium text-ink">{cat.nombre}</td>
                              <td className="px-4 py-3 text-ink-muted">
                                {cat.edadMin != null && cat.edadMax != null
                                  ? `${cat.edadMin} - ${cat.edadMax} años`
                                  : "Libre"}
                              </td>
                              <td className="px-4 py-3 text-ink-muted">
                                {cat.cupo != null ? cat.cupo : "Sin límite"}
                              </td>
                              <td className="px-4 py-3 text-ink-muted">
                                {cat.precio != null ? `S/ ${Number(cat.precio).toFixed(2)}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              <aside className="h-fit rounded-card border border-line bg-surface p-5 shadow-sm2">
                <h3 className="mb-2 font-display text-lg font-bold text-ink">Inscripción</h3>
                <p className="mb-4 text-[13px] leading-relaxed text-ink-muted">
                  {concurso.estado === "PUBLICADO"
                    ? "Inscríbete con tu pareja y espera su confirmación para completar el registro."
                    : "Este concurso ya cerró sus inscripciones."}
                </p>

                {concurso.estado !== "PUBLICADO" ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-btn bg-line px-4 py-2.5 text-sm font-semibold text-ink-muted"
                  >
                    Inscripciones cerradas
                  </button>
                ) : !autenticado ? (
                  <Link
                    to="/login"
                    className="block rounded-btn bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline hover:bg-primary-hover"
                  >
                    Iniciar sesión para inscribirme
                  </Link>
                ) : (
                  <Link
                    to={`/inscripcion/${concurso.id}`}
                    className="block rounded-btn bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white no-underline hover:bg-primary-hover"
                  >
                    Inscribirme con mi pareja
                  </Link>
                )}

                <Link
                  to={`/resultados?concursoId=${concurso.id}`}
                  className="mt-3 block text-center text-[12px] font-semibold text-primary no-underline hover:underline"
                >
                  Ver resultados publicados
                </Link>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
