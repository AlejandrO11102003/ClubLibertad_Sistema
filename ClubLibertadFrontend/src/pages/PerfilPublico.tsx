import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Heart,
  MapPin,
  Share2,
  Star,
  Trophy,
} from "lucide-react";
import {
  Logro,
  PerfilPublico as PerfilPublicoData,
  TipoLogro,
  authService,
  bailarinesService,
} from "../services/api";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const estiloLogro = (tipo: TipoLogro) => {
  if (tipo === "CAMPEON") return "bg-[#FFF7DB] text-[#8B6F00] border-[#E5C158]";
  if (tipo === "SUBCAMPEON") return "bg-[#F3F4F6] text-[#5B6472] border-[#C4C9D2]";
  return "bg-[#FBEFE4] text-[#8A5A3B] border-[#D8A47F]";
};

const iconoLogro = (tipo: TipoLogro) => {
  if (tipo === "CAMPEON") return "🥇";
  if (tipo === "SUBCAMPEON") return "🥈";
  return "🥉";
};

function Estrellas({ nivel }: { nivel?: number }) {
  const llenas = nivel != null ? Math.round(nivel) : 0;

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, indice) => (
        <Star
          key={indice}
          size={18}
          className={indice < llenas ? "fill-accent text-accent" : "text-line"}
        />
      ))}
    </span>
  );
}

export default function PerfilPublico() {
  const { id } = useParams<{ id: string }>();

  const [perfil, setPerfil] = useState<PerfilPublicoData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [procesandoAdmiracion, setProcesandoAdmiracion] = useState(false);

  const autenticado = Boolean(authService.obtenerToken());
  const usuarioActual = authService.obtenerUsuario();
  const esMiPerfil = usuarioActual?.id != null && String(usuarioActual.id) === id;

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await bailarinesService.obtenerPerfilPublico(id || "");
        if (activo) setPerfil(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudo cargar el perfil público.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [id]);

  const compartir = async () => {
    const url = window.location.href;
    const titulo = perfil
      ? `${perfil.nombre} ${perfil.apellido} - Entre Pañuelos`
      : "Perfil de bailarín";

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // cancelado
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // sin portapapeles
    }
  };

  const alternarAdmiracion = async () => {
    if (!perfil || !autenticado || esMiPerfil || procesandoAdmiracion) return;
    setProcesandoAdmiracion(true);
    try {
      const estado = perfil.admiradoPorUsuario
        ? await bailarinesService.dejarDeAdmirar(perfil.usuarioId)
        : await bailarinesService.admirar(perfil.usuarioId);
      setPerfil((actual) => actual
        ? { ...actual, ...estado }
        : actual);
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar la admiración.");
    } finally {
      setProcesandoAdmiracion(false);
    }
  };

  const iniciales =
    `${perfil?.nombre?.[0] || ""}${perfil?.apellido?.[0] || ""}`.toUpperCase() || "EP";

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
            <Link to="/resultados" className="font-medium text-ink-muted no-underline hover:text-primary">
              Resultados
            </Link>
            {autenticado ? (
              <Link to="/perfil" className="font-semibold text-primary no-underline">
                Mi perfil
              </Link>
            ) : (
              <Link to="/login" className="font-semibold text-primary no-underline">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando perfil público…</p>
          </div>
        ) : error || !perfil ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="mb-3 text-sm text-ink-muted">
              {error || "Perfil público no encontrado."}
            </p>
            <Link to="/" className="text-sm font-semibold text-primary">
              Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-card border border-line bg-surface shadow-sm2">
              <div className="h-28 bg-[linear-gradient(135deg,#A3152E,#5E0C1B)]" />

              <div className="px-5 pb-5 sm:px-7">
                <div className="-mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div className="flex items-end gap-4">
                    {perfil.fotografiaUrl ? (
                      <img
                        src={perfil.fotografiaUrl}
                        alt={`${perfil.nombre} ${perfil.apellido}`}
                        className="h-24 w-24 rounded-full border-4 border-surface object-cover shadow-md"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-primary text-2xl font-semibold text-white shadow-md">
                        {iniciales}
                      </div>
                    )}

                    <div className="pb-1">
                      <h1 className="font-display text-[28px] font-bold leading-tight text-ink">
                        {perfil.nombre} {perfil.apellido}
                      </h1>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-muted">
                        <MapPin size={14} /> {perfil.ciudad || "Perú"}
                        {perfil.categoria ? ` · ${perfil.categoria}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:pb-1">
                    {!esMiPerfil && autenticado && (
                      <button
                        onClick={alternarAdmiracion}
                        disabled={procesandoAdmiracion}
                        className={`inline-flex items-center gap-1.5 rounded-btn border px-4 py-2 text-[13px] font-semibold transition ${
                          perfil.admiradoPorUsuario
                            ? "border-primary bg-blush text-primary"
                            : "border-line text-ink-muted hover:border-primary hover:text-primary"
                        } disabled:opacity-60`}
                      >
                        <Heart size={15} className={perfil.admiradoPorUsuario ? "fill-primary" : ""} />
                        {perfil.admiradoPorUsuario ? "Admirando" : "Admirar"}
                      </button>
                    )}
                    {esMiPerfil && (
                      <Link
                        to="/perfil"
                        className="rounded-btn border border-line px-4 py-2 text-[13px] font-medium text-ink-muted no-underline hover:border-primary hover:text-primary"
                      >
                        Editar perfil
                      </Link>
                    )}
                    <button
                      onClick={compartir}
                      className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-hover"
                    >
                      <Share2 size={15} /> {copiado ? "Enlace copiado" : "Compartir perfil"}
                    </button>
                  </div>
                </div>

                {(perfil.academiaActual || perfil.anioInicio || perfil.marineraFavorita) && (
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4 text-[12px] text-ink-muted">
                    {perfil.academiaActual && (
                      <span>
                        Academia: <strong className="text-ink">{perfil.academiaActual}</strong>
                      </span>
                    )}
                    <p className="mt-4 flex items-center gap-1.5 text-sm text-ink-muted">
                      <Heart size={15} className="text-primary" />
                      <strong className="text-ink">{perfil.totalAdmiradores}</strong> admiradores
                    </p>
                    {perfil.anioInicio && (
                      <span>
                        Bailarín desde: <strong className="text-ink">{perfil.anioInicio}</strong>
                      </span>
                    )}
                    {perfil.marineraFavorita && (
                      <span>
                        Marinera favorita:{" "}
                        <strong className="text-ink">{perfil.marineraFavorita}</strong>
                      </span>
                    )}
                  </div>
                )}

                {perfil.biografia && (
                  <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-ink-muted">
                    {perfil.biografia}
                  </p>
                )}
              </div>
            </section>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
              <aside className="space-y-5">
                <section className="rounded-card border border-line bg-surface p-5 text-center shadow-sm2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    Nivel competitivo
                  </p>

                  {perfil.nivelPendiente ? (
                    <div className="mt-3">
                      <p className="text-sm text-ink-muted">Cálculo pendiente</p>
                      <p className="mt-1 text-[11px] text-ink-muted">
                        Necesita resultados publicados.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Estrellas nivel={perfil.nivelEstrellas} />
                        <span className="text-lg font-bold text-accent">
                          {Number(perfil.nivelEstrellas).toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-ink-muted">
                        de 5 estrellas
                      </p>
                    </>
                  )}
                </section>

                <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
                  <h2 className="mb-3 font-display text-base font-bold text-ink">
                    Estadísticas
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    {[
                      { label: "Concursos", valor: perfil.totalConcursos },
                      { label: "Participaciones", valor: perfil.totalParticipaciones },
                      { label: "Primeros", valor: perfil.totalPrimeros },
                      { label: "Podios", valor: perfil.totalPrimeros + perfil.totalSegundos + perfil.totalTerceros },
                    ].map((item) => (
                      <div key={item.label} className="rounded-btn bg-cream p-2.5">
                        <p className="text-lg font-bold text-primary">{item.valor}</p>
                        <p className="text-[10px] text-ink-muted">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[12px] text-ink-muted">
                    <p className="flex justify-between">
                      <span>Promedio de posición</span>
                      <strong className="text-ink">
                        {perfil.promedioPosicion != null
                          ? Number(perfil.promedioPosicion).toFixed(2)
                          : "—"}
                      </strong>
                    </p>
                    <p className="flex justify-between">
                      <span>Mejor posición</span>
                      <strong className="text-ink">
                        {perfil.mejorPosicion != null ? `${perfil.mejorPosicion}°` : "—"}
                      </strong>
                    </p>
                  </div>
                </section>

                <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
                  <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-bold text-ink">
                    <Award size={18} className="text-accent" /> Logros
                  </h2>

                  {perfil.logros.length === 0 ? (
                    <p className="text-[12px] text-ink-muted">
                      Aún no tiene logros registrados.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {perfil.logros.map((logro: Logro) => (
                        <span
                          key={logro.id}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${estiloLogro(
                            logro.tipo
                          )}`}
                          title={`${logro.descripcion} (${formatearFecha(logro.fecha)})`}
                        >
                          {iconoLogro(logro.tipo)} {logro.descripcion}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              </aside>

              <section className="rounded-card border border-line bg-surface shadow-sm2">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <Trophy size={19} className="text-accent" /> Trayectoria
                  </h2>
                  <span className="text-[11px] text-ink-muted">
                    {perfil.totalParticipaciones} resultados
                  </span>
                </div>

                {perfil.trayectoria.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-ink-muted">
                    Aún no hay resultados publicados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
                        <tr>
                          <th className="px-4 py-3">Concurso</th>
                          <th className="px-4 py-3">Categoría</th>
                          <th className="px-4 py-3">Pareja</th>
                          <th className="px-4 py-3">Posición</th>
                          <th className="px-4 py-3">Puntaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {perfil.trayectoria.map((item, indice) => (
                          <tr key={`${item.concursoId}-${item.categoriaId}-${indice}`} className="border-t border-line">
                            <td className="px-4 py-3">
                              <p className="font-medium text-ink">{item.concursoNombre}</p>
                              <p className="text-[11px] text-ink-muted">
                                {formatearFecha(item.fechaInicio)}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-ink-muted">{item.categoriaNombre}</td>
                            <td className="px-4 py-3">
                              <Link
                                to={`/bailarines/${item.parejaId}`}
                                className="text-primary no-underline hover:underline"
                              >
                                {item.parejaNombre}
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-bold text-primary">{item.posicion}°</td>
                            <td className="px-4 py-3 text-ink-muted">
                              {item.puntaje != null ? Number(item.puntaje).toFixed(2) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
