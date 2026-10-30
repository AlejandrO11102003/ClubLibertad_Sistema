import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  Tags,
  Trophy,
  Users,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SECCIONES = [
  {
    titulo: "General",
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true }],
  },
  {
    titulo: "Gestión",
    items: [
      { label: "Concursos", to: "/admin/concursos", icon: Trophy, end: false },
      { label: "Inscripciones", to: "/admin/inscripciones", icon: ClipboardList, end: false },
      { label: "Bailarines", to: "/admin/bailarines", icon: Users, end: false },
      { label: "Categorías", to: "/admin/categorias", icon: Tags, end: false },
    ],
  },
  {
    titulo: "Resultados",
    items: [
      { label: "Cargar resultados", to: "/admin/resultados", icon: FileSpreadsheet, end: false },
    ],
  },
];

export default function AdminSidebar({ open, onClose }: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#3F0812] text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <NavLink
            to="/admin"
            onClick={onClose}
            className="font-display text-lg font-bold text-white no-underline"
          >
            🎗️ ENTRE PAÑUELOS
          </NavLink>
          <button
            onClick={onClose}
            className="rounded p-1 text-white/70 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Administración
        </p>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {SECCIONES.map((seccion) => (
            <div key={seccion.titulo} className="mb-2">
              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                {seccion.titulo}
              </p>

              {seccion.items.map((item) => {
                const Icono = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `mb-0.5 flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-[13px] no-underline transition ${
                        isActive
                          ? "border-accent bg-accent/15 font-semibold text-white"
                          : "border-transparent font-medium text-white/75 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icono size={17} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Sesión</p>
          <p className="mt-1 text-[12px] font-medium text-white/80">Administrador</p>
        </div>
      </aside>
    </>
  );
}
