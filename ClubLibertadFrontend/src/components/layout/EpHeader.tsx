import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Compass,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Trophy,
  User,
  X,
} from "lucide-react";
import { authService, notificacionesService } from "../../services/api";

interface Props {
  tema: "light" | "dark";
  alternar: () => void;
  mostrarTema?: boolean;
}

const iniciales = (nombre?: string, apellido?: string) =>
  `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase() || "EP";

const ENLACES = [
  { label: "Inicio", to: "/", icon: Home },
  { label: "Concursos", to: "/concursos", icon: Trophy },
  { label: "Resultados", to: "/resultados", icon: BarChart3 },
  { label: "Cómo funciona", to: "/como-funciona", icon: Compass },
  { label: "Comunidad", to: "/comunidad", icon: User },
];

export default function EpHeader({ tema, alternar, mostrarTema = true }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [noLeidas, setNoLeidas] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [avatarAbierto, setAvatarAbierto] = useState(false);

  const autenticado = Boolean(authService.obtenerToken());
  const usuario = authService.obtenerUsuario();
  const rol = (authService.obtenerRol() || "").toUpperCase();
  const esAdmin = rol.includes("ADMIN");
  const nombre = usuario?.nombre || (esAdmin ? "Administrador" : "Bailarín");
  const apellido = usuario?.apellido || "";
  const panelUrl = esAdmin ? "/admin" : "/panel";

  useEffect(() => {
    if (!autenticado) return;

    notificacionesService
      .contarNoLeidas()
      .then((cantidad) => setNoLeidas(cantidad))
      .catch(() => setNoLeidas(0));
  }, [autenticado]);

  useEffect(() => {
    setMenuAbierto(false);
    setAvatarAbierto(false);
  }, [location.pathname]);

  const cerrarSesion = () => {
    authService.cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <header className="ep-header">
      <div className="wrap nav">
        <div className="brand-group">
          <Link className="brand desktop-brand" to="/" aria-label="Entre Pañuelos, inicio">
            <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
              <path
                d="M3 12c8-8 14 4 22-2s9 2 12 4c-3 8-1 12-3 18-8 6-14-4-22 2s-9-2-12-4c3-8 1-12 3-18z"
                fill="#A3152E"
              />
              <path
                d="M12 20c5-3 9 3 15 0"
                stroke="#fff"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="brand-name">Entre Pañuelos</span>
          </Link>

          <button
            className="brand mobile-brand"
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
          >
            <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
              <path
                d="M3 12c8-8 14 4 22-2s9 2 12 4c-3 8-1 12-3 18-8 6-14-4-22 2s-9-2-12-4c3-8 1-12 3-18z"
                fill="#A3152E"
              />
              <path
                d="M12 20c5-3 9 3 15 0"
                stroke="#fff"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="brand-name">Entre Pañuelos</span>
          </button>
        </div>

        <ul className="desktop-nav">
          <li><Link to="/concursos">Concursos</Link></li>
          <li><Link to="/resultados">Resultados</Link></li>
          <li><Link to="/como-funciona">Cómo funciona</Link></li>
          <li><Link to="/comunidad">Comunidad</Link></li>
        </ul>

        <div className="actions desktop-actions">
          {mostrarTema && (
            <button
              className="theme ep-theme"
              type="button"
              onClick={alternar}
              aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {tema === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              <span className="tl">{tema === "dark" }</span>
            </button>
          )}

          {autenticado ? (
            <>
              <Link
                to="/notificaciones"
                className="bell ep-bell"
                aria-label={`Notificaciones${noLeidas ? `: ${noLeidas} sin leer` : ""}`}
              >
                <Bell size={17} />
                {noLeidas > 0 && <span className="bell-count">{noLeidas}</span>}
              </Link>

              <Link to={panelUrl} className="btn sm ep-panel-link">
                {esAdmin ? "Panel admin" : "Mi panel"}
              </Link>

              <Link
                to={usuario?.id ? `/bailarines/${usuario.id}` : "/perfil"}
                className="me"
                aria-label="Ver mi perfil público"
              >
                <span className="avatar" aria-hidden="true">
                  {iniciales(nombre, apellido)}
                </span>
                <span className="nav-user-name">{nombre}</span>
              </Link>

              <button
                className="bell ep-logout"
                type="button"
                onClick={cerrarSesion}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost sm ep-login-link" to="/login">
                Iniciar sesión
              </Link>
              <Link className="btn sm ep-register-link" to="/registro">
                Registrarse
              </Link>
            </>
          )}
        </div>

        <div className="mobile-actions">
          {mostrarTema && (
            <button
              className="mobile-theme-btn"
              type="button"
              onClick={alternar}
              aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {tema === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          {autenticado && (
            <Link
              to="/notificaciones"
              className="bell mobile-bell"
              aria-label={`Notificaciones${noLeidas ? `: ${noLeidas} sin leer` : ""}`}
            >
              <Bell size={17} />
              {noLeidas > 0 && <span className="bell-count">{noLeidas}</span>}
            </Link>
          )}

          {!autenticado && (
            <Link className="btn sm mobile-login-btn" to="/login">
              Iniciar sesión
            </Link>
          )}

          {autenticado && (
          <div className="mobile-user">
            <button
              className="mobile-avatar-btn"
              type="button"
              onClick={() => setAvatarAbierto((prev) => !prev)}
              aria-label="Opciones de usuario"
              aria-expanded={avatarAbierto}
            >
              <span className="avatar" aria-hidden="true">
                {iniciales(nombre, apellido)}
              </span>
            </button>

            {avatarAbierto && (
              <>
                <div
                  className="ep-menu-overlay"
                  onClick={() => setAvatarAbierto(false)}
                />
                <div className="ep-avatar-menu" role="menu">
                  <div className="ep-avatar-head">
                    <span className="avatar" aria-hidden="true">
                      {iniciales(nombre, apellido)}
                    </span>
                    <div>
                      <strong>{nombre} {apellido}</strong>
                      <span>{esAdmin ? "Administrador" : "Bailarín"}</span>
                    </div>
                  </div>

                  <Link to={panelUrl} onClick={() => setAvatarAbierto(false)}>
                    <LayoutDashboard size={17} /> {esAdmin ? "Panel admin" : "Mi panel"}
                  </Link>
                  <Link to="/perfil" onClick={() => setAvatarAbierto(false)}>
                    <User size={17} /> Mi perfil / Editar perfil
                  </Link>
                  <Link to="/notificaciones" onClick={() => setAvatarAbierto(false)}>
                    <Bell size={17} /> Notificaciones
                    {noLeidas > 0 && <span className="menu-badge">{noLeidas}</span>}
                  </Link>

                  {mostrarTema && (
                    <button
                      type="button"
                      onClick={() => {
                        alternar();
                        setAvatarAbierto(false);
                      }}
                    >
                      {tema === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                      {tema === "dark" ? "Modo claro" : "Modo oscuro"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="danger"
                    onClick={cerrarSesion}
                  >
                    <LogOut size={17} /> Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        </div>
      </div>

      {menuAbierto && (
        <>
          <div
            className="ep-mobile-overlay"
            onClick={() => setMenuAbierto(false)}
          />
          <aside className="ep-mobile-drawer">
            <div className="ep-mobile-head">
              <Link
                to="/"
                className="brand"
                onClick={() => setMenuAbierto(false)}
              >
                <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
                  <path
                    d="M3 12c8-8 14 4 22-2s9 2 12 4c-3 8-1 12-3 18-8 6-14-4-22 2s-9-2-12-4c3-8 1-12 3-18z"
                    fill="#A3152E"
                  />
                  <path
                    d="M12 20c5-3 9 3 15 0"
                    stroke="#fff"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="brand-name">Entre Pañuelos</span>
              </Link>

              <button
                type="button"
                className="ep-drawer-close"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
              >
                <X size={21} />
              </button>
            </div>

            <nav className="ep-mobile-links">
              {ENLACES.map((enlace) => {
                const Icono = enlace.icon;
                return (
                  <Link
                    key={enlace.to}
                    to={enlace.to}
                    onClick={() => setMenuAbierto(false)}
                  >
                    <Icono size={18} /> {enlace.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ep-mobile-footer">
              {autenticado ? (
                <>
                  <Link
                    to={panelUrl}
                    onClick={() => setMenuAbierto(false)}
                  >
                    <LayoutDashboard size={18} /> {esAdmin ? "Panel admin" : "Mi panel"}
                  </Link>
                  <Link to="/perfil" onClick={() => setMenuAbierto(false)}>
                    <User size={18} /> Editar perfil
                  </Link>
                  <Link to="/notificaciones" onClick={() => setMenuAbierto(false)}>
                    <Bell size={18} /> Notificaciones
                    {noLeidas > 0 && <span className="menu-badge">{noLeidas}</span>}
                  </Link>
                  <button type="button" onClick={cerrarSesion}>
                    <LogOut size={18} /> Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuAbierto(false)}>
                    <User size={18} /> Iniciar sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="btn"
                    onClick={() => setMenuAbierto(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
