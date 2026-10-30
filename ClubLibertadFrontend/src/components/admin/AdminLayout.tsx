import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { authService } from "../../services/api";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const cerrarSesion = () => {
    authService.cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-line bg-surface px-4 shadow-sm2 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream text-ink lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={19} />
            </button>
            <div>
              <p className="font-display text-base font-bold text-ink">
                Panel de administración
              </p>
              <p className="hidden text-[11px] text-ink-muted sm:block">
                Entre Pañuelos · Gestión de marinera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-btn border border-line px-3 py-2 text-[12px] font-medium text-ink-muted no-underline transition hover:border-primary hover:text-primary sm:inline-flex"
            >
              Ver sitio <ExternalLink size={14} />
            </Link>

            <button
              onClick={cerrarSesion}
              className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-primary-hover"
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
