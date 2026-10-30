import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  IdCard,
  Search,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { authService } from "../services/api";

const PASOS = [
  {
    titulo: "Crea tu cuenta",
    texto:
      "Regístrate con tu DNI, año de nacimiento y una contraseña. Tu DNI nunca se muestra en tu perfil público.",
    icono: UserPlus,
  },
  {
    titulo: "Completa tu perfil",
    texto:
      "Agrega tu foto, ciudad, academia, categoría y marinera favorita para que tu pareja y la comunidad te conozcan.",
    icono: Users,
  },
  {
    titulo: "Inscríbete con pareja",
    texto:
      "Elige un concurso y una categoría, busca a tu pareja por DNI y envíale la solicitud.",
    icono: Search,
  },
  {
    titulo: "Recibe tu credencial",
    texto:
      "Cuando tu pareja acepta, la inscripción queda confirmada y tu credencial digital se genera automáticamente.",
    icono: IdCard,
  },
];

const FAQ = [
  {
    pregunta: "¿Necesito tener pareja para inscribirme?",
    respuesta:
      "Sí. La inscripción se realiza en pareja. Debes buscar a la otra persona por su DNI y enviarle una solicitud; la inscripción se confirma cuando ella acepta.",
  },
  {
    pregunta: "¿Mi DNI será visible en mi perfil?",
    respuesta:
      "No. El DNI se usa para identificar tu cuenta, pero nunca se muestra completo en tu perfil público ni en la credencial.",
  },
  {
    pregunta: "¿Cómo se actualiza mi nivel competitivo?",
    respuesta:
      "Cuando el administrador publica los resultados oficiales, la plataforma actualiza automáticamente tus participaciones, posiciones, logros y estrellas.",
  },
  {
    pregunta: "¿Puedo participar en más de una categoría?",
    respuesta:
      "Sí, siempre que no tengas otra inscripción activa en la misma categoría del mismo concurso.",
  },
  {
    pregunta: "¿Qué pasa si mi pareja rechaza la solicitud?",
    respuesta:
      "La inscripción queda rechazada y puedes enviar una nueva solicitud a otra pareja, siempre que el concurso siga abierto.",
  },
];

export default function ComoFunciona() {
  const autenticado = Boolean(authService.obtenerToken());
  const esAdmin = (authService.obtenerRol() || "").toUpperCase().includes("ADMIN");
  const panelUrl = esAdmin ? "/admin" : "/panel";

  return (
    <main>
      <section className="ep-section">
        <div className="wrap">
          <div className="head">
            <div>
              <p className="state">Guía rápida</p>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", marginTop: 8 }}>
                Cómo funciona Entre Pañuelos
              </h1>
              <p className="lead" style={{ marginTop: 14 }}>
                Desde tu registro hasta la publicación de resultados: todo lo que necesitas
                para competir, llevar tu credencial y construir tu trayectoria.
              </p>
            </div>
            {autenticado ? (
              <Link className="btn" to={panelUrl}>
                {esAdmin ? "Ir al panel admin" : "Ir a mi panel"}
              </Link>
            ) : (
              <Link className="btn" to="/registro">
                Crear mi cuenta
              </Link>
            )}
          </div>

          <div className="steps">
            {PASOS.map((paso) => {
              const Icono = paso.icono;
              return (
                <div className="step" key={paso.titulo}>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                  <span className="step-icon" aria-hidden="true">
                    <Icono size={18} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ep-section tint">
        <div className="wrap">
          <div className="head">
            <h2>Dos experiencias, una misma plataforma</h2>
          </div>

          <div className="info-grid">
            <div className="card">
              <h3 className="info-title">
                <Trophy size={20} /> Para bailarines
              </h3>
              <ul className="checklist">
                <li><CheckCircle2 size={18} /> Regístrate y completa tu perfil deportivo.</li>
                <li><CheckCircle2 size={18} /> Busca pareja por DNI y envía solicitudes.</li>
                <li><CheckCircle2 size={18} /> Acepta o rechaza invitaciones de pareja.</li>
                <li><CheckCircle2 size={18} /> Consulta tu credencial digital cuando esté confirmada.</li>
                <li><CheckCircle2 size={18} /> Revisa tus resultados, logros, nivel y perfil público.</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="info-title">
                <ShieldCheck size={20} /> Para administradores
              </h3>
              <ul className="checklist">
                <li><CheckCircle2 size={18} /> Crear concursos con banner, fechas, lugar y categorías.</li>
                <li><CheckCircle2 size={18} /> Publicar o cerrar inscripciones según el calendario.</li>
                <li><CheckCircle2 size={18} /> Supervisar inscripciones y cuentas de bailarines.</li>
                <li><CheckCircle2 size={18} /> Gestionar categorías y su disponibilidad.</li>
                <li><CheckCircle2 size={18} /> Importar resultados desde Excel y publicarlos.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="ep-section">
        <div className="wrap">
          <div className="head">
            <h2>Del Excel a tu perfil público</h2>
          </div>

          <div className="info-grid">
            <div className="card">
              <h3 className="info-title">
                <FileSpreadsheet size={20} /> Carga de resultados
              </h3>
              <p className="lead" style={{ fontSize: 15 }}>
                El administrador descarga la plantilla, completa las posiciones y sube el
                archivo. El sistema valida cada fila, reporta errores y publica únicamente
                los resultados válidos.
              </p>
            </div>

            <div className="card">
              <h3 className="info-title">
                <ClipboardList size={20} /> Actualización automática
              </h3>
              <p className="lead" style={{ fontSize: 15 }}>
                Al publicar un resultado se actualizan la trayectoria, las estadísticas, los
                logros y el nivel competitivo de ambos bailarines. No necesitas hacer nada
                adicional.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ep-section tint">
        <div className="wrap">
          <div className="head">
            <h2>Preguntas frecuentes</h2>
          </div>

          <div className="faq">
            {FAQ.map((item) => (
              <details key={item.pregunta}>
                <summary>{item.pregunta}</summary>
                <p>{item.respuesta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ep-section final">
        <div className="wrap">
          <h2>¿Listo para tu próximo concurso?</h2>
          <p className="lead">
            Crea tu cuenta, encuentra a tu pareja y empieza a construir tu trayectoria.
          </p>
          <div className="cta">
            {autenticado ? (
              <Link className="btn" to="/concursos">Ver concursos abiertos</Link>
            ) : (
              <>
                <Link className="btn" to="/registro">Crear mi cuenta</Link>
                <Link className="btn ghost" to="/concursos">Ver concursos</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
