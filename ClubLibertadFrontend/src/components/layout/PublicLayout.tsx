import { Outlet } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import EpHeader from "./EpHeader";

export default function PublicLayout() {
  const { tema, alternar } = useTheme();

  return (
    <div className="ep-page ep-inner" data-theme={tema}>
      <EpHeader tema={tema} alternar={alternar} />

      <Outlet />

      <footer className="ep-footer">
        <div className="wrap">
          <span>© 2026 Entre Pañuelos</span>
          <nav>
            <a href="/#inicio">Privacidad</a>
            <a href="/#inicio">Términos de uso</a>
            <a href="/#inicio">Contacto</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
