import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import {
  Concurso,
  Inscripcion,
  PerfilPublico,
  authService,
  bailarinesService,
  concursosService,
  inscripcionesService,
} from "../services/api";
import useTheme from "../hooks/useTheme";
import EpHeader from "../components/layout/EpHeader";
import "../styles/entrepanuelos.css";

function Estrella({ off = false }: { off?: boolean }) {
  return (
    <svg className={`star ${off ? "off" : ""}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3 7 7 .6-5.3 4.6 1.7 7.3L12 17.8 5.6 21.5l1.7-7.3L2 9.6 9 9z" />
    </svg>
  );
}

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const iniciales = (nombre?: string, apellido?: string) =>
  `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase() || "EP";

const etiquetaInscripcion = (estado: Inscripcion["estado"]) => {
  switch (estado) {
    case "CONFIRMADA":
      return { texto: "Confirmada", clase: "t-ok" };
    case "RECHAZADA":
      return { texto: "Rechazada", clase: "t-no" };
    case "VENCIDA":
      return { texto: "Vencida", clase: "t-no" };
    default:
      return { texto: "Esperando respuesta", clase: "t-wait" };
  }
};

export default function PanelBailarin() {
  const { tema, alternar } = useTheme();
  const usuario = authService.obtenerUsuario();

  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [pendientes, setPendientes] = useState<Inscripcion[]>([]);
  const [mias, setMias] = useState<Inscripcion[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [accionId, setAccionId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const mostrarToast = (texto: string) => {
    setToast(texto);
    window.setTimeout(() => setToast(null), 2400);
  };

  const cargar = async () => {
    const id = usuario?.id;

    const [perfilData, pendientesData, miasData, concursosData] = await Promise.all([
      id
        ? bailarinesService.obtenerPerfilPublico(id).catch(() => null)
        : Promise.resolve(null),
      inscripcionesService.pendientes().catch(() => []),
      inscripcionesService.mias().catch(() => []),
      concursosService.listar().catch(() => []),
    ]);

    setPerfil(perfilData);
    setPendientes(pendientesData);
    setMias(miasData);
    setConcursos(concursosData);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const responder = async (id: number, aceptar: boolean) => {
    setAccionId(id);

    try {
      if (aceptar) {
        await inscripcionesService.aceptar(id);
        mostrarToast("Solicitud aceptada. La inscripción quedó confirmada.");
      } else {
        await inscripcionesService.rechazar(id);
        mostrarToast("Solicitud rechazada.");
      }

      await cargar();
    } catch (err: any) {
      mostrarToast(err?.message || "No se pudo responder la solicitud.");
    } finally {
      setAccionId(null);
    }
  };

  const inscripcionesVisibles = useMemo(
    () =>
      mias.filter(
        (inscripcion) =>
          inscripcion.estado !== "PENDIENTE" ||
          inscripcion.solicitanteId === usuario?.id
      ),
    [mias, usuario?.id]
  );

  const concursosAbiertos = useMemo(
    () => concursos.filter((c) => c.estado === "PUBLICADO").slice(0, 2),
    [concursos]
  );

  const trayectoria = perfil?.trayectoria || [];
  const nivel = perfil?.nivelEstrellas;
  const podios =
    (perfil?.totalPrimeros || 0) +
    (perfil?.totalSegundos || 0) +
    (perfil?.totalTerceros || 0);
  const titulos = perfil?.totalPrimeros || 0;
  const nombre = perfil?.nombre || usuario?.nombre || "Bailarín";
  const urlPublica = `${window.location.origin}/bailarines/${usuario?.id || ""}`;

  const insignias = [
    { icono: "🏆", texto: "Primer título", logrado: titulos >= 1 },
    { icono: "🥇", texto: "5 podios", logrado: podios >= 5 },
    { icono: "⭐", texto: "Nivel 4", logrado: (nivel || 0) >= 4 },
    { icono: "👑", texto: "Campeón de campeones", logrado: titulos >= 5 },
    { icono: "🌎", texto: "Campeón mundial", logrado: titulos >= 10 },
    { icono: "🎖️", texto: "Laureado", logrado: podios >= 10 },
  ];

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlPublica);
      mostrarToast("Enlace copiado");
    } catch {
      mostrarToast("No se pudo copiar el enlace");
    }
  };

  if (cargando) {
    return (
      <div className="ep-page ep-panel" data-theme={tema}>
        <div className="wrap" style={{ paddingTop: 100, textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>Cargando tu panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-page ep-panel" data-theme={tema}>
      <EpHeader tema={tema} alternar={alternar} />

      <main>
        <div className="wrap">
          <div className="hello">
            <div>
              <h1>Hola, {nombre}</h1>
              <p>
                Tienes <b>{pendientes.length}</b>{" "}
                {pendientes.length === 1 ? "solicitud de pareja" : "solicitudes de pareja"} por
                responder y{" "}
                <b>{mias.filter((i) => i.estado === "CONFIRMADA").length}</b>{" "}
                {mias.filter((i) => i.estado === "CONFIRMADA").length === 1
                  ? "inscripción confirmada"
                  : "inscripciones confirmadas"}
                .
              </p>
            </div>
            
          </div>

          <div className="panel-grid">
            <div className="col">
              <section className="card alert" id="solicitudes">
                <h2>Solicitudes de pareja</h2>
                <p className="sub">
                  Aceptas o rechazas. La inscripción se confirma solo si aceptas.
                </p>

                {pendientes.length === 0 ? (
                  <p className="empty">No tienes solicitudes pendientes.</p>
                ) : (
                  pendientes.map((solicitud) => (
                    <div className="ep-row" key={solicitud.id}>
                      <div className="pair">
                        <div className="avatar">
                          {iniciales(solicitud.solicitanteNombre)}
                        </div>
                        <div>
                          <b>{solicitud.solicitanteNombre} quiere bailar contigo</b>
                          <small>
                            {solicitud.concursoNombre} · {solicitud.categoriaNombre} ·{" "}
                            vence {formatearFecha(solicitud.fechaVencimiento)}
                          </small>
                        </div>
                      </div>
                      <div className="btns">
                        <button
                          className="btn sm"
                          disabled={accionId === solicitud.id}
                          onClick={() => responder(solicitud.id, true)}
                        >
                          Aceptar
                        </button>
                        <button
                          className="btn sm ghost"
                          disabled={accionId === solicitud.id}
                          onClick={() => responder(solicitud.id, false)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section className="card" id="inscripciones">
                <h2>Mis inscripciones</h2>
                <p className="sub">Tu credencial aparece cuando ambos aceptan.</p>

                {inscripcionesVisibles.length === 0 ? (
                  <p className="empty">Todavía no tienes inscripciones.</p>
                ) : (
                  inscripcionesVisibles.map((inscripcion) => {
                    const etiqueta = etiquetaInscripcion(inscripcion.estado);
                    const pareja =
                      inscripcion.solicitanteId === usuario?.id
                        ? inscripcion.parejaNombre
                        : inscripcion.solicitanteNombre;

                    return (
                      <div className="ep-row" key={inscripcion.id}>
                        <div className="pair">
                          <div className="avatar">{iniciales(pareja)}</div>
                          <div>
                            <b>{inscripcion.concursoNombre}</b>
                            <small>
                              con {pareja} · {inscripcion.categoriaNombre}
                            </small>
                          </div>
                        </div>
                        <div className="btns">
                          <span className={`tag ${etiqueta.clase}`}>{etiqueta.texto}</span>
                          {inscripcion.estado === "CONFIRMADA" && (
                            <Link
                              className="btn sm"
                              to={`/credencial/${inscripcion.id}`}
                            >
                              Ver credencial
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </section>

              <section className="card" id="concursos">
                <h2>Concursos abiertos</h2>
                <p className="sub">
                  Elige uno, escoge categoría y busca a tu pareja por DNI.
                </p>

                {concursosAbiertos.length === 0 ? (
                  <p className="empty">No hay concursos abiertos por ahora.</p>
                ) : (
                  concursosAbiertos.map((concurso) => (
                    <div className="ep-row" key={concurso.id}>
                      <div>
                        <b>{concurso.nombre}</b>
                        <small>
                          {concurso.lugar} · {formatearFecha(concurso.fechaInicio)}
                        </small>
                      </div>
                      <Link className="btn sm" to={`/inscripcion/${concurso.id}`}>
                        Inscribirme
                      </Link>
                    </div>
                  ))
                )}

                <Link
                  className="note"
                  to="/concursos"
                  style={{ display: "inline-block", color: "var(--red)", fontWeight: 600 }}
                >
                  Ver todos los concursos
                </Link>
              </section>
            </div>

            <div className="col">
              <section className="card level-card" id="trayectoria">
                <h2>Tu nivel competitivo</h2>
                <p className="sub">Se actualiza cuando se publican resultados oficiales.</p>

                {nivel != null ? (
                  <>
                    <div className="big">
                      <strong>{Number(nivel).toFixed(1)}</strong>
                      <div
                        className="stars"
                        aria-label={`${Number(nivel).toFixed(1)} de 5 estrellas`}
                      >
                        {Array.from({ length: 5 }).map((_, indice) => (
                          <Estrella
                            key={indice}
                            off={indice >= Math.round(Number(nivel))}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${Math.min(100, (Number(nivel) / 5) * 100)}%` }} />
                    </div>
                    <small>
                      {Number(nivel) >= 5
                        ? "Nivel máximo alcanzado."
                        : `Te faltan ${(5 - Number(nivel)).toFixed(1)} para las 5 estrellas.`}
                    </small>
                  </>
                ) : (
                  <p className="empty" style={{ color: "#b8c2dc" }}>
                    Nivel pendiente. Necesitas resultados publicados.
                  </p>
                )}

                <div className="stats">
                  <div><b>{perfil?.totalConcursos || 0}</b><span>Concursos</span></div>
                  <div><b>{podios}</b><span>Podios</span></div>
                  <div><b>{titulos}</b><span>Títulos</span></div>
                </div>
              </section>

              <section className="card">
                <h2>Últimos resultados</h2>
                <p className="sub">Publicados por la organización.</p>

                {trayectoria.length === 0 ? (
                  <p className="empty">Aún no tienes resultados publicados.</p>
                ) : (
                  trayectoria.slice(0, 3).map((resultado, indice) => (
                    <div className="ep-row" key={`${resultado.concursoId}-${indice}`}>
                      <div>
                        <b>{resultado.concursoNombre}</b>
                        <small>
                          {resultado.categoriaNombre} · con {resultado.parejaNombre}
                        </small>
                      </div>
                      <div className="pos">{resultado.posicion}°</div>
                    </div>
                  ))
                )}
              </section>

              <section className="card">
                <h2>Insignias</h2>
                <p className="sub">Logros que ya ganaste y los que vienen.</p>
                <div className="badge-grid">
                  {insignias.map((insignia) => (
                    <div
                      key={insignia.texto}
                      className={`badge ${insignia.logrado ? "" : "lock"}`}
                    >
                      <i>{insignia.icono}</i>
                      {insignia.texto}
                    </div>
                  ))}
                </div>
              </section>

              <section className="card" id="perfil">
                <h2>Tu perfil público</h2>
                <p className="sub">
                  Cualquiera con el enlace ve tu trayectoria, estadísticas y nivel. Tu DNI
                  no se muestra.
                </p>
                <div className="pub">{urlPublica.replace(/^https?:\/\//, "")}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="btn sm" onClick={copiarEnlace}>
                    Copiar enlace
                  </button>
                  <Link className="btn sm ghost" to="/perfil">
                    <Pencil size={14} /> Editar perfil
                  </Link>
                </div>
                <p className="note">
                  {perfil?.totalParticipaciones || 0} resultados en tu trayectoria.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <div className={`toast ${toast ? "on" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
