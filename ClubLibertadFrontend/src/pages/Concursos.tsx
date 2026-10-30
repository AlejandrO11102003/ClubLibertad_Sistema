import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { Concurso, authService, concursosService } from "../services/api";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "Por definir";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const badgeEstado = (estado: Concurso["estado"]) => {
  if (estado === "PUBLICADO") {
    return "bg-[#EAF5EF] text-success";
  }
  return "bg-sand text-ink-muted";
};

export default function Concursos() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"TODOS" | "PUBLICADO" | "CERRADO">("TODOS");

  const autenticado = Boolean(authService.obtenerToken());

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await concursosService.listar();
        if (activo) setConcursos(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar los concursos.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const visibles = concursos.filter((c) => filtro === "TODOS" || c.estado === filtro);

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS
          </Link>

          <div className="flex items-center gap-3 text-[13px]">
            {autenticado ? (
              <Link to="/perfil" className="font-semibold text-primary no-underline">
                Mi perfil
              </Link>
            ) : (
              <Link to="/login" className="font-semibold text-primary no-underline">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-[32px] font-bold text-ink">Concursos</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Explora los concursos de marinera publicados y revisa sus categorías.
            </p>
          </div>

          <div className="flex gap-2">
            {(["TODOS", "PUBLICADO", "CERRADO"] as const).map((opcion) => (
              <button
                key={opcion}
                onClick={() => setFiltro(opcion)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  filtro === opcion
                    ? "bg-primary text-white"
                    : "border border-line bg-surface text-ink-muted hover:border-primary hover:text-primary"
                }`}
              >
                {opcion === "TODOS" ? "Todos" : opcion === "PUBLICADO" ? "Abiertos" : "Cerrados"}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando concursos…</p>
          </div>
        ) : error ? (
          <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
            {error}
          </div>
        ) : visibles.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="text-sm text-ink-muted">
              No hay concursos {filtro === "TODOS" ? "disponibles" : "en este estado"} por ahora.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibles.map((concurso) => (
              <Link
                key={concurso.id}
                to={`/concursos/${concurso.id}`}
                className="group overflow-hidden rounded-card border border-line bg-surface no-underline shadow-sm2 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-36 w-full overflow-hidden bg-[linear-gradient(135deg,#A3152E,#5E0C1B)]">
                  {concurso.bannerUrl ? (
                    <img
                      src={concurso.bannerUrl}
                      alt={concurso.nombre}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🎗️</div>
                  )}
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeEstado(
                      concurso.estado
                    )}`}
                  >
                    {concurso.estado === "PUBLICADO" ? "Inscripciones abiertas" : "Cerrado"}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-display text-lg font-bold text-ink">
                    {concurso.nombre}
                  </h3>

                  <p className="mb-1 flex items-center gap-1.5 text-[13px] text-ink-muted">
                    <CalendarDays size={14} /> {formatearFecha(concurso.fechaInicio)}
                    {concurso.fechaFin ? ` - ${formatearFecha(concurso.fechaFin)}` : ""}
                  </p>
                  <p className="mb-3 flex items-center gap-1.5 text-[13px] text-ink-muted">
                    <MapPin size={14} /> {concurso.lugar}
                  </p>

                  <div className="flex items-center justify-between border-t border-line pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <Users size={14} /> {concurso.categorias.length} categorías
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:underline">
                      Ver detalle →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
