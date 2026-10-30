import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Concurso, authService, concursosService } from "../services/api";
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

function Pañuelo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M5 25c20-20 35 10 55-5s30 5 35 8c-8 20-3 30-8 48-20 15-35-10-55 5S10 85 5 75c8-20 3-30 0-50z"
        fill="#fff"
      />
    </svg>
  );
}

const CONCURSOS_DEMO = [
  {
    id: "demo-1",
    nombre: "Concurso Regional Norteño",
    lugar: "Coliseo Municipal, Chiclayo",
    dia: "14",
    mes: "Nov 2026",
    categorias: ["Infantil", "Juvenil", "Adulto"],
    estado: "Inscripciones abiertas",
    banner: "b1",
  },
  {
    id: "demo-2",
    nombre: "Copa Lambayeque de Marinera",
    lugar: "Teatro Principal, Lambayeque",
    dia: "05",
    mes: "Dic 2026",
    categorias: ["Juvenil", "Adulto", "Senior"],
    estado: "Inscripciones abiertas",
    banner: "b2",
  },
  {
    id: "demo-3",
    nombre: "Festival Entre Pañuelos",
    lugar: "Lugar por confirmar",
    dia: "23",
    mes: "Ene 2027",
    categorias: ["Todas las categorías"],
    estado: "Próximamente",
    banner: "b3",
  },
];

export default function Home() {
  const { tema, alternar } = useTheme();
  const [concursos, setConcursos] = useState<Concurso[]>([]);

  const rol = (authService.obtenerRol() || "").toUpperCase();
  const autenticado = Boolean(authService.obtenerToken());
  const esAdmin = rol.includes("ADMIN");

  useEffect(() => {
    let activo = true;

    concursosService
      .listar()
      .then((data) => {
        if (activo) setConcursos(data);
      })
      .catch(() => {
        // el landing puede funcionar con los ejemplos
      });

    return () => {
      activo = false;
    };
  }, []);

  const destacados = concursos.filter((c) => c.estado !== "BORRADOR").slice(0, 3);

  return (
    <div className="ep-page ep-home" data-theme={tema}>
      <EpHeader tema={tema} alternar={alternar} />

      <main id="inicio">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <h1>Cada concurso que bailas queda en tu historia.</h1>
              <p className="lead">
                Inscríbete con tu pareja, lleva tu credencial en el celular y mira cómo
                crece tu trayectoria con cada resultado oficial.
              </p>
              <div className="cta">
                <Link className="btn" to={autenticado ? (esAdmin ? "/admin" : "/panel") : "/registro"}>
                  {autenticado ? "Ir a mi panel" : "Crear mi cuenta"}
                </Link>
                <a className="btn ghost" href="#concursos">
                  Ver concursos abiertos
                </a>
              </div>
              <p className="hero-note">
                Te registras con tu DNI, año de nacimiento y una contraseña. Tu DNI nunca
                se muestra en tu perfil público.
              </p>
            </div>

            <div className="stage" aria-hidden="true">
              <svg className="hanky" viewBox="0 0 440 440" preserveAspectRatio="xMidYMid slice">
                <g className="wave">
                  <path
                    d="M20 90c70-60 120 40 200-10s120 10 190 20c-30 70-10 120-30 190-70 50-130-40-200 10S50 360 20 330c30-70 10-120 0-240z"
                    fill="#A3152E"
                  />
                  <path
                    d="M70 140c60-30 100 30 160 0s80 5 130 15"
                    stroke="#fff"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    opacity=".7"
                  />
                  <path
                    d="M60 300c60 25 100-25 160 0s90-10 140-5"
                    stroke="#fff"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    opacity=".7"
                  />
                </g>
                <g className="wave" style={{ animationDelay: "-3s" }}>
                  <path
                    d="M250 30c40-20 90 10 130 0 20 30 10 70 20 100-40 30-90 0-130 20-20-30-10-70-20-120z"
                    fill="#C98F1F"
                    opacity=".92"
                  />
                </g>
              </svg>

              <div className="profile">
                <div className="who">
                  <div className="avatar">VR</div>
                  <div>
                    <b>Valeria Rojas</b>
                    <span>Chiclayo · Academia Norte Vivo</span>
                  </div>
                </div>
                <div className="level">
                  <strong>4.6</strong>
                  <div className="stars">
                    <Estrella /><Estrella /><Estrella /><Estrella /><Estrella off />
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  Nivel competitivo
                </span>
                <div className="stats">
                  <div><b>18</b><span>Concursos</span></div>
                  <div><b>7</b><span>Podios</span></div>
                  <div><b>212</b><span>Admiradores</span></div>
                </div>
                <div className="badges">
                  <span className="chip">Campeón de campeones</span>
                  <span className="chip">Podio selectivo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="concursos" className="soft">
          <div className="wrap">
            <div className="head">
              <div>
                <h2>Próximos concursos</h2>
                <p className="lead" style={{ margin: "10px 0 0" }}>
                  Elige tu categoría, busca a tu pareja por DNI y envíale la solicitud.
                </p>
              </div>
              <Link className="btn ghost" to="/concursos">
                Ver todos los concursos
              </Link>
            </div>

            <div className="contests">
              {destacados.length === 0
                ? CONCURSOS_DEMO.map((concurso) => (
                    <article className="contest" key={concurso.id}>
                      <div className={`banner ${concurso.banner}`}>
                        <div className="date">
                          {concurso.dia}
                          <small>{concurso.mes}</small>
                        </div>
                        <Pañuelo />
                      </div>
                      <div className="body">
                        <span className="state">{concurso.estado}</span>
                        <h3>{concurso.nombre}</h3>
                        <p>{concurso.lugar}</p>
                        <div className="cats">
                          {concurso.categorias.map((cat) => (
                            <span key={cat}>{cat}</span>
                          ))}
                        </div>
                        <Link className="btn" to="/concursos">
                          Ver concursos
                        </Link>
                      </div>
                    </article>
                  ))
                : destacados.map((concurso, indice) => {
                    const fecha = new Date(`${concurso.fechaInicio}T00:00:00`);
                    const dia = fecha.toLocaleDateString("es-PE", { day: "2-digit" });
                    const mes = fecha.toLocaleDateString("es-PE", {
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <article className="contest" key={concurso.id}>
                        <div className={`banner ${["b1", "b2", "b3"][indice % 3]}`}>
                          {concurso.bannerUrl ? (
                            <img
                              src={concurso.bannerUrl}
                              alt={`Banner de ${concurso.nombre}`}
                              className="banner-img"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Pañuelo />
                          )}
                          <div className="date">
                            {dia}
                            <small>{mes}</small>
                          </div>
                        </div>
                        <div className="body">
                          <span
                            className="state"
                            style={
                              concurso.estado === "CERRADO"
                                ? { color: "var(--muted)" }
                                : { color: "rgb(17, 158, 0)" }
                            }
                          >
                            {concurso.estado === "PUBLICADO"
                              ? "Inscripciones abiertas"
                              : "Finalizado"}
                          </span>
                          <h3>{concurso.nombre}</h3>
                          <p>{concurso.lugar}</p>
                          <div className="cats">
                            {concurso.categorias.slice(0, 4).map((cat) => (
                              <span key={cat.id}>{cat.nombre}</span>
                            ))}
                          </div>
                          <Link className="btn" to={`/concursos/${concurso.id}`}>
                            Ver concurso
                          </Link>
                        </div>
                      </article>
                    );
                  })}
            </div>
          </div>
        </section>

        <section id="como-funciona">
          <div className="wrap">
            <div className="head">
              <h2>De la inscripción a la credencial en cuatro pasos</h2>
            </div>
            <div className="steps">
              <div className="step">
                <h3>Elige concurso y categoría</h3>
                <p>Consulta los concursos abiertos y escoge dónde quieres competir.</p>
              </div>
              <div className="step">
                <h3>Busca a tu pareja</h3>
                <p>Escribe su DNI y envíale la solicitud de inscripción.</p>
              </div>
              <div className="step">
                <h3>Tu pareja acepta</h3>
                <p>La inscripción solo se confirma cuando ambos están de acuerdo.</p>
              </div>
              <div className="step">
                <h3>Recibe tu credencial</h3>
                <p>Muestra tu credencial digital en la entrada del recinto.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="nivel" className="dark">
          <div className="wrap split">
            <div>
              <h2>Tu nivel competitivo crece con cada resultado</h2>
              <p className="lead">
                Cuando el administrador publica los resultados oficiales, tu trayectoria se
                actualiza sola: participaciones, posiciones, logros e insignias.
              </p>
              <ul className="feat">
                <li>Un nivel de 1 a 5 estrellas, con decimales, calculado por la plataforma.</li>
                <li>Insignias por títulos, podios y logros selectivos.</li>
                <li>Perfil público para compartir tu historia con un enlace.</li>
              </ul>
            </div>

            <div className="ladder" aria-label="Ejemplo de resultados en el historial">
              <div className="rung">
                <div><b>Copa Lambayeque 2026</b><small>Final · Juvenil</small></div>
                <b>1.º lugar</b>
              </div>
              <div className="rung">
                <div><b>Regional Norteño 2025</b><small>Semifinal · Juvenil</small></div>
                <b>3.er lugar</b>
              </div>
              <div className="rung">
                <div><b>Festival del Pañuelo 2025</b><small>Final · Juvenil</small></div>
                <b>2.º lugar</b>
              </div>
              <div className="rung">
                <div>
                  <b>Nivel actual</b>
                  <small>Actualizado tras el último resultado</small>
                </div>
                <div className="stars">
                  <Estrella /><Estrella /><Estrella /><Estrella /><Estrella off />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="comunidad">
          <div className="wrap">
            <div className="head">
              <h2>Comunidad marinera</h2>
              <Link className="btn ghost" to="/resultados">
                Entrar a la comunidad
              </Link>
            </div>
            <div className="comm">
              <div className="panel">
                <h3>Bailarines destacados</h3>
                <p>Admira perfiles y sigue a quienes te inspiran.</p>
                <ul className="rank">
                  <li><span>Valeria Rojas</span><em>4.6 ★ · 212 admiradores</em></li>
                  <li><span>Diego Salazar</span><em>4.4 ★ · 187 admiradores</em></li>
                  <li><span>Camila Huamán</span><em>4.1 ★ · 143 admiradores</em></li>
                </ul>
              </div>
              <div className="panel">
                <h3>Servicios para bailarines</h3>
                <p>Academias, vestuario y accesorios ligados a la marinera.</p>
                <div className="ad">
                  <i>👗</i>
                  <div><b>Taller de vestidos de marinera</b><span>Vestuario · Contactar por WhatsApp</span></div>
                </div>
                <div className="ad">
                  <i>🎩</i>
                  <div><b>Sombreros y accesorios</b><span>Accesorios · Ver contacto</span></div>
                </div>
                <div className="ad">
                  <i>🏫</i>
                  <div><b>Academia de marinera norteña</b><span>Clases · Ver contacto</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="soft final">
          <div className="wrap">
            <h2>Empieza a construir tu trayectoria</h2>
            <p className="lead">
              Crea tu cuenta en un minuto y prepárate para tu próximo concurso.
            </p>
            <div className="cta">
              <Link className="btn" to={autenticado ? (esAdmin ? "/admin" : "/panel") : "/registro"}>
                {autenticado ? "Ir a mi panel" : "Crear mi cuenta"}
              </Link>
              <Link className="btn ghost" to="/login">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="ep-footer">
        <div className="wrap">
          <span>© 2026 Entre Pañuelos</span>
          <nav>
            <a href="#inicio">Privacidad</a>
            <a href="#inicio">Términos de uso</a>
            <a href="#inicio">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
