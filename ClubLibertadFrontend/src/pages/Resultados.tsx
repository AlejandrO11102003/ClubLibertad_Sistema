import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, BarChart3, CalendarDays, MapPin, Trophy } from "lucide-react";
import {
  Concurso,
  Resultado,
  authService,
  concursosService,
  resultadosService,
} from "../services/api";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const medalla = (posicion?: number) => {
  if (posicion === 1) return "🥇";
  if (posicion === 2) return "🥈";
  if (posicion === 3) return "🥉";
  return null;
};

const estiloPosicion = (posicion?: number) => {
  if (posicion === 1) return "bg-[#FFF7DB] border-[#E5C158]";
  if (posicion === 2) return "bg-[#F3F4F6] border-[#C4C9D2]";
  if (posicion === 3) return "bg-[#FBEFE4] border-[#D8A47F]";
  return "bg-surface border-line";
};

export default function Resultados() {
  const [searchParams, setSearchParams] = useSearchParams();
  const autenticado = Boolean(authService.obtenerToken());

  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [concursoId, setConcursoId] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [mios, setMios] = useState<Resultado[]>([]);
  const [tab, setTab] = useState<"concurso" | "historial">("concurso");
  const [cargando, setCargando] = useState(true);
  const [cargandoResultados, setCargandoResultados] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const lista = await concursosService.listar();
        if (!activo) return;
        setConcursos(lista);

        const solicitado = searchParams.get("concursoId");
        const inicial =
          lista.find((c) => String(c.id) === solicitado)?.id ||
          lista[0]?.id;

        if (inicial) setConcursoId(String(inicial));
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar los concursos.");
      } finally {
        if (activo) setCargando(false);
      }

      if (autenticado) {
        try {
          const datos = await resultadosService.mios();
          if (activo) setMios(datos);
        } catch {
          // el historial es opcional
        }
      }
    })();

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!concursoId) return;

    let activo = true;
    setCargandoResultados(true);

    (async () => {
      try {
        const data = await resultadosService.listarPorConcurso(concursoId);
        if (activo) setResultados(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar los resultados.");
      } finally {
        if (activo) setCargandoResultados(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [concursoId]);

  const concursoSeleccionado = concursos.find((c) => String(c.id) === concursoId);

  const grupos = useMemo(() => {
    const mapa = new Map<number, { nombre: string; items: Resultado[] }>();

    resultados.forEach((resultado) => {
      const actual = mapa.get(resultado.categoriaId) || {
        nombre: resultado.categoriaNombre,
        items: [],
      };
      actual.items.push(resultado);
      mapa.set(resultado.categoriaId, actual);
    });

    return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [resultados]);

  const historialPorConcurso = useMemo(() => {
    const mapa = new Map<number, { nombre: string; fecha?: string; items: Resultado[] }>();

    mios.forEach((resultado) => {
      const actual = mapa.get(resultado.concursoId) || {
        nombre: resultado.concursoNombre,
        fecha: resultado.fechaInicio,
        items: [],
      };
      actual.items.push(resultado);
      mapa.set(resultado.concursoId, actual);
    });

    return Array.from(mapa.values());
  }, [mios]);

  const cambiarConcurso = (id: string) => {
    setConcursoId(id);
    const siguiente = new URLSearchParams(searchParams);
    siguiente.set("concursoId", id);
    setSearchParams(siguiente, { replace: true });
  };

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
            {autenticado && (
              <Link to="/perfil" className="font-medium text-ink-muted no-underline hover:text-primary">
                Mi perfil
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 font-display text-[32px] font-bold text-ink">
            <Trophy size={30} className="text-accent" /> Resultados
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Consulta las posiciones oficiales publicadas por la organización.
          </p>
        </div>

        {autenticado && (
          <div className="mb-5 flex gap-2">
            <button
              onClick={() => setTab("concurso")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "concurso"
                  ? "bg-primary text-white"
                  : "border border-line bg-surface text-ink-muted hover:border-primary hover:text-primary"
              }`}
            >
              Por concurso
            </button>
            <button
              onClick={() => setTab("historial")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "historial"
                  ? "bg-primary text-white"
                  : "border border-line bg-surface text-ink-muted hover:border-primary hover:text-primary"
              }`}
            >
              Mi historial
            </button>
          </div>
        )}

        {tab === "concurso" ? (
          <>
            <div className="mb-5 rounded-card border border-line bg-surface p-4 shadow-sm2">
              <label className="mb-1.5 block text-[13px] font-medium text-ink">
                Selecciona un concurso
              </label>
              <select
                value={concursoId}
                onChange={(e) => cambiarConcurso(e.target.value)}
                disabled={cargando || concursos.length === 0}
                className="w-full cursor-pointer rounded-btn border-[1.5px] border-line bg-cream px-3.5 py-[11px] text-sm text-ink outline-none focus:border-primary focus:bg-white"
              >
                {concursos.length === 0 ? (
                  <option value="">No hay concursos disponibles</option>
                ) : (
                  concursos.map((concurso) => (
                    <option key={concurso.id} value={concurso.id}>
                      {concurso.nombre} ({concurso.estado})
                    </option>
                  ))
                )}
              </select>

              {concursoSeleccionado && (
                <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} /> {formatearFecha(concursoSeleccionado.fechaInicio)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {concursoSeleccionado.lugar}
                  </span>
                </div>
              )}
            </div>

            {cargando || cargandoResultados ? (
              <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
                <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                <p className="text-sm text-ink-muted">Cargando resultados…</p>
              </div>
            ) : error ? (
              <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
                {error}
              </div>
            ) : grupos.length === 0 ? (
              <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
                <BarChart3 className="mx-auto mb-3 text-ink-muted" size={34} />
                <p className="text-sm text-ink-muted">
                  Todavía no hay resultados publicados para este concurso.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {grupos.map((grupo) => (
                  <section
                    key={grupo.nombre}
                    className="overflow-hidden rounded-card border border-line bg-surface shadow-sm2"
                  >
                    <div className="border-b border-line bg-cream px-5 py-3">
                      <h2 className="font-display text-lg font-bold text-ink">
                        {grupo.nombre}
                      </h2>
                    </div>

                    <div className="divide-y divide-line">
                      {grupo.items.map((resultado) => (
                        <div
                          key={resultado.id}
                          className={`flex items-center gap-3 border-l-4 px-4 py-3 ${estiloPosicion(
                            resultado.posicion
                          )}`}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-lg font-bold text-ink">
                            {medalla(resultado.posicion) ||
                              (resultado.posicion != null
                                ? `${resultado.posicion}°`
                                : "Sin posición")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink">
                              <Link
                                to={`/bailarines/${resultado.solicitanteId}`}
                                className="text-ink no-underline hover:text-primary hover:underline"
                              >
                                {resultado.solicitanteNombre}
                              </Link>{" "}
                              y{" "}
                              <Link
                                to={`/bailarines/${resultado.parejaId}`}
                                className="text-ink no-underline hover:text-primary hover:underline"
                              >
                                {resultado.parejaNombre}
                              </Link>
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              {resultado.posicion != null
                                ? `Posición ${resultado.posicion}`
                                : "Sin posición"}
                              {resultado.etapa ? ` · ${resultado.etapa}` : ""}
                              {resultado.puntaje != null
                                ? ` · ${Number(resultado.puntaje).toFixed(2)} puntos`
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {historialPorConcurso.length === 0 ? (
              <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
                <BarChart3 className="mx-auto mb-3 text-ink-muted" size={34} />
                <p className="mb-2 text-sm text-ink-muted">
                  Aún no tienes resultados publicados.
                </p>
                <Link to="/concursos" className="text-sm font-semibold text-primary">
                  Explorar concursos
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {historialPorConcurso.map((grupo) => (
                  <section
                    key={grupo.nombre}
                    className="overflow-hidden rounded-card border border-line bg-surface shadow-sm2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream px-5 py-3">
                      <h2 className="font-display text-lg font-bold text-ink">{grupo.nombre}</h2>
                      <span className="text-[12px] text-ink-muted">
                        {formatearFecha(grupo.fecha)}
                      </span>
                    </div>

                    <div className="divide-y divide-line">
                      {grupo.items.map((resultado) => (
                        <div
                          key={resultado.id}
                          className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {resultado.categoriaNombre}
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              <Link
                                to={`/bailarines/${resultado.solicitanteId}`}
                                className="text-ink-muted no-underline hover:text-primary hover:underline"
                              >
                                {resultado.solicitanteNombre}
                              </Link>{" "}
                              y{" "}
                              <Link
                                to={`/bailarines/${resultado.parejaId}`}
                                className="text-ink-muted no-underline hover:text-primary hover:underline"
                              >
                                {resultado.parejaNombre}
                              </Link>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {medalla(resultado.posicion) ||
                                (resultado.posicion != null
                                  ? `${resultado.posicion}°`
                                  : "Sin posición")}
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              {resultado.puntaje != null
                                ? `${Number(resultado.puntaje).toFixed(2)} pts`
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
