import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  GraduationCap,
  Scissors,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import {
  BailarinDestacado,
  bailarinesService,
  authService,
} from "../services/api";

const DEMO: BailarinDestacado[] = [
  {
    id: 0,
    nombre: "Valeria",
    apellido: "Rojas",
    ciudad: "Chiclayo",
    categoria: "Juvenil",
    nivelEstrellas: 4.6,
    totalPrimeros: 7,
    totalParticipaciones: 18,
  },
  {
    id: 0,
    nombre: "Diego",
    apellido: "Salazar",
    ciudad: "Trujillo",
    categoria: "Adultos",
    nivelEstrellas: 4.4,
    totalPrimeros: 5,
    totalParticipaciones: 15,
  },
  {
    id: 0,
    nombre: "Camila",
    apellido: "Huamán",
    ciudad: "Arequipa",
    categoria: "Juvenil",
    nivelEstrellas: 4.1,
    totalPrimeros: 3,
    totalParticipaciones: 11,
  },
];

const SERVICIOS = [
  {
    icono: Scissors,
    titulo: "Vestuario y confección",
    texto:
      "Talleres especializados en vestidos de marinera, bordados y accesorios para competencia.",
  },
  {
    icono: GraduationCap,
    titulo: "Academias y clases",
    texto:
      "Escuelas de marinera norteña, limeña y serrana para todos los niveles y edades.",
  },
  {
    icono: Camera,
    titulo: "Fotografía y video",
    texto:
      "Profesionales que registran ensayos, concursos y momentos importantes de tu trayectoria.",
  },
];

function Estrellas({ nivel }: { nivel?: number }) {
  const llenas = nivel != null ? Math.round(nivel) : 0;

  return (
    <span className="stars" aria-label={nivel != null ? `${nivel} de 5` : "Sin nivel"}>
      {Array.from({ length: 5 }).map((_, indice) => (
        <svg
          key={indice}
          className={`star ${indice < llenas ? "" : "off"}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3 7 7 .6-5.3 4.6 1.7 7.3L12 17.8 5.6 21.5l1.7-7.3L2 9.6 9 9z" />
        </svg>
      ))}
    </span>
  );
}

export default function Comunidad() {
  const [bailarines, setBailarines] = useState<BailarinDestacado[]>([]);
  const [cargando, setCargando] = useState(true);
  const autenticado = Boolean(authService.obtenerToken());

  useEffect(() => {
    let activo = true;

    bailarinesService
      .destacados(6)
      .then((data) => {
        if (activo) setBailarines(data);
      })
      .catch(() => {
        // la página puede mostrar contenido de ejemplo
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const lista = bailarines.length > 0 ? bailarines : DEMO;

  return (
    <main>
      <section className="ep-section">
        <div className="wrap">
          <div className="head">
            <div>
              <p className="state">Comunidad</p>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", marginTop: 8 }}>
                La marinera se vive en comunidad
              </h1>
              <p className="lead" style={{ marginTop: 14 }}>
                Descubre bailarines, academias, servicios y resultados. Comparte tu perfil
                público y conecta con personas que comparten tu pasión por la marinera.
              </p>
            </div>
            {autenticado ? (
              <Link className="btn" to="/concursos">
                Ver concursos abiertos
              </Link>
            ) : (
              <Link className="btn" to="/registro">
                Unirme a la comunidad
              </Link>
            )}
          </div>

          <div className="stats" style={{ maxWidth: 620, margin: 0 }}>
            <div><b>+200</b><span>Bailarines</span></div>
            <div><b>+40</b><span>Academias</span></div>
            <div><b>+15</b><span>Concursos</span></div>
          </div>
        </div>
      </section>

      <section className="ep-section tint">
        <div className="wrap">
          <div className="head">
            <div>
              <h2>Bailarines destacados</h2>
              <p className="lead" style={{ marginTop: 10 }}>
                Perfiles con mayor nivel competitivo y trayectoria publicada.
              </p>
            </div>
            <Link className="btn ghost" to="/resultados">
              Ver resultados
            </Link>
          </div>

          {cargando ? (
            <p style={{ color: "var(--muted)" }}>Cargando bailarines…</p>
          ) : (
            <div className="community-grid">
              {lista.map((bailarin, indice) => (
                <article className="community-card" key={`${bailarin.id}-${indice}`}>
                  {bailarin.fotografiaUrl ? (
                    <img
                      src={bailarin.fotografiaUrl}
                      alt={`${bailarin.nombre} ${bailarin.apellido}`}
                      className="avatar"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="avatar">
                      {(bailarin.nombre?.[0] || "") + (bailarin.apellido?.[0] || "")}
                    </div>
                  )}

                  <h3>
                    {bailarin.nombre} {bailarin.apellido}
                  </h3>
                  <p>
                    {bailarin.ciudad || "Perú"}
                    {bailarin.categoria ? ` · ${bailarin.categoria}` : ""}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Estrellas nivel={bailarin.nivelEstrellas} />
                    <strong style={{ fontSize: 13 }}>
                      {bailarin.nivelEstrellas != null
                        ? Number(bailarin.nivelEstrellas).toFixed(1)
                        : "Pendiente"}
                    </strong>
                  </div>

                  <div className="meta">
                    <span><Trophy size={13} /> <strong>{bailarin.totalPrimeros}</strong> títulos</span>
                    <span><Users size={13} /> <strong>{bailarin.totalParticipaciones}</strong> concursos</span>
                  </div>

                  {bailarin.id > 0 && (
                    <Link
                      className="btn ghost sm"
                      to={`/bailarines/${bailarin.id}`}
                      style={{ marginTop: 14 }}
                    >
                      Ver perfil
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="ep-section">
        <div className="wrap">
          <div className="head">
            <h2>Servicios para la comunidad</h2>
          </div>

          <div className="community-grid">
            {SERVICIOS.map((servicio) => {
              const Icono = servicio.icono;
              return (
                <article className="community-card" key={servicio.titulo}>
                  <div
                    className="avatar"
                    style={{ background: "var(--soft)", color: "var(--red)" }}
                  >
                    <Icono size={26} />
                  </div>
                  <h3>{servicio.titulo}</h3>
                  <p>{servicio.texto}</p>
                  <span className="chip" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
                    Próximamente
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ep-section tint">
        <div className="wrap">
          <div className="head">
            <h2>Cómo participar</h2>
          </div>

          <div className="steps">
            <div className="step">
              <h3>Crea tu perfil</h3>
              <p>Regístrate y completa tus datos deportivos y tu fotografía.</p>
            </div>
            <div className="step">
              <h3>Comparte tu enlace</h3>
              <p>Tu perfil público muestra tu trayectoria, logros y nivel, sin exponer tu DNI.</p>
            </div>
            <div className="step">
              <h3>Sigue a otros bailarines</h3>
              <p>Consulta perfiles y resultados para inspirarte y conectar.</p>
            </div>
            <div className="step">
              <h3>Participa en concursos</h3>
              <p>Inscríbete con tu pareja y suma nuevos logros a tu historia.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ep-section">
        <div className="wrap">
          <div className="info-grid">
            <div className="card">
              <h3 className="info-title"><Sparkles size={20} /> Normas de convivencia</h3>
              <ul className="checklist">
                <li><Star size={18} /> Respeta a bailarines, parejas y organizadores.</li>
                <li><Star size={18} /> Comparte información verídica en tu perfil.</li>
                <li><Star size={18} /> No publiques datos privados de otras personas.</li>
                <li><Star size={18} /> Reporta conductas indebidas a la organización.</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="info-title"><Trophy size={20} /> ¿Quieres aparecer aquí?</h3>
              <p className="lead" style={{ fontSize: 15 }}>
                Los perfiles destacados se ordenan según el nivel competitivo y los logros
                publicados. Participa en concursos, carga tus resultados desde la
                administración y tu perfil irá escalando.
              </p>
              <Link className="btn" to="/concursos" style={{ marginTop: 16 }}>
                Ver concursos abiertos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
