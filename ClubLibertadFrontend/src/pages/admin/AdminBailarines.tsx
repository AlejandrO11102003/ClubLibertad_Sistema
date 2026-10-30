import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Search,
  Star,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import {
  AdminBailarin,
  adminBailarinesService,
} from "../../services/api";

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminBailarines() {
  const [bailarines, setBailarines] = useState<AdminBailarin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<string | null>(null);

  const [texto, setTexto] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [detalle, setDetalle] = useState<AdminBailarin | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await adminBailarinesService.listar();
        if (activo) setBailarines(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar los bailarines.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    bailarines.forEach((b) => {
      if (b.categoria) set.add(b.categoria);
    });
    return Array.from(set).sort();
  }, [bailarines]);

  const filtrados = useMemo(() => {
    const busqueda = normalizar(texto);

    return bailarines.filter((b) => {
      if (filtroActivo === "true" && !b.activo) return false;
      if (filtroActivo === "false" && b.activo) return false;
      if (filtroCategoria && b.categoria !== filtroCategoria) return false;

      if (!busqueda) return true;

      return normalizar(
        `${b.nombre || ""} ${b.apellido || ""} ${b.ciudad || ""} ${b.categoria || ""}`
      ).includes(busqueda);
    });
  }, [bailarines, texto, filtroActivo, filtroCategoria]);

  const resumen = useMemo(
    () => ({
      total: bailarines.length,
      activos: bailarines.filter((b) => b.activo).length,
      inactivos: bailarines.filter((b) => !b.activo).length,
      conResultados: bailarines.filter((b) => b.totalResultados > 0).length,
    }),
    [bailarines]
  );

  const cambiarEstado = async (bailarin: AdminBailarin) => {
    const accion = bailarin.activo ? "desactivar" : "activar";
    const confirmado = window.confirm(
      `¿Seguro que deseas ${accion} la cuenta de ${bailarin.nombre} ${bailarin.apellido}?`
    );

    if (!confirmado) return;

    setProcesando(bailarin.id);
    setAlerta(null);

    try {
      const actualizado = await adminBailarinesService.cambiarActivo(
        bailarin.id,
        !bailarin.activo
      );

      setBailarines((prev) =>
        prev.map((b) => (b.id === actualizado.id ? actualizado : b))
      );
      setAlerta(
        actualizado.activo
          ? "Cuenta activada correctamente."
          : "Cuenta desactivada. El bailarín no podrá iniciar sesión."
      );

      if (detalle?.id === actualizado.id) setDetalle(actualizado);
    } catch (err: any) {
      setAlerta(err?.message || "No se pudo cambiar el estado de la cuenta.");
    } finally {
      setProcesando(null);
    }
  };

  const limpiarFiltros = () => {
    setTexto("");
    setFiltroActivo("");
    setFiltroCategoria("");
  };

  if (cargando) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
        <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-ink-muted">Cargando bailarines…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
        {error}
      </div>
    );
  }

  const tarjetas = [
    { label: "Total", valor: resumen.total, color: "bg-blush text-primary" },
    { label: "Activos", valor: resumen.activos, color: "bg-[#EAF5EF] text-success" },
    { label: "Inactivos", valor: resumen.inactivos, color: "bg-line text-ink-muted" },
    { label: "Con resultados", valor: resumen.conResultados, color: "bg-[#FFF7DB] text-[#8B6F00]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[30px] font-bold text-ink">Bailarines</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Consulta las cuentas registradas y administra su acceso a la plataforma.
        </p>
      </div>

      {alerta && (
        <div className="rounded-btn border-l-[3px] border-success bg-[#EAF5EF] px-3.5 py-3 text-[13px] text-success">
          ✅ {alerta}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tarjetas.map((tarjeta) => (
          <div
            key={tarjeta.label}
            className="rounded-card border border-line bg-surface p-4 shadow-sm2"
          >
            <p className="text-[11px] font-medium text-ink-muted">{tarjeta.label}</p>
            <p className={`mt-1 inline-block rounded px-1.5 font-display text-2xl font-bold ${tarjeta.color}`}>
              {tarjeta.valor}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-card border border-line bg-surface p-4 shadow-sm2 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Buscar
            </label>
            <div className="flex items-center rounded-btn border border-line bg-cream px-3">
              <Search size={15} className="text-ink-muted" />
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Nombre, apellido o ciudad"
                className="w-full border-none bg-transparent px-2 py-2 text-[13px] text-ink outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Estado
            </label>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="w-full cursor-pointer rounded-btn border border-line bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Categoría
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full cursor-pointer rounded-btn border border-line bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-ink-muted">
            {filtrados.length} de {bailarines.length} bailarines
          </p>
          <button
            onClick={limpiarFiltros}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {filtrados.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
          <Users className="mx-auto mb-3 text-ink-muted" size={34} />
          <p className="text-sm text-ink-muted">
            {bailarines.length === 0
              ? "Todavía no hay bailarines registrados."
              : "No hay bailarines que coincidan con los filtros."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm2">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Bailarín</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">Inscripciones</th>
                <th className="px-4 py-3">Resultados</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((bailarin) => (
                <tr key={bailarin.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {bailarin.nombre} {bailarin.apellido}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      DNI {bailarin.dni} · Desde {formatearFecha(bailarin.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{bailarin.ciudad || "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {bailarin.categoria || "Sin definir"}
                  </td>
                  <td className="px-4 py-3">
                    {bailarin.nivelEstrellas != null ? (
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#8B6F00]">
                        <Star size={14} className="fill-accent text-accent" />
                        {Number(bailarin.nivelEstrellas).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-ink-muted">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{bailarin.totalInscripciones}</td>
                  <td className="px-4 py-3 text-ink-muted">{bailarin.totalResultados}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        bailarin.activo
                          ? "bg-[#EAF5EF] text-success"
                          : "bg-line text-ink-muted"
                      }`}
                    >
                      {bailarin.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setDetalle(bailarin)}
                        className="rounded border border-line p-1.5 text-ink-muted transition hover:border-primary hover:text-primary"
                        aria-label="Ver detalle"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        onClick={() => cambiarEstado(bailarin)}
                        disabled={procesando === bailarin.id}
                        className={`rounded border p-1.5 transition disabled:opacity-50 ${
                          bailarin.activo
                            ? "border-line text-ink-muted hover:border-danger hover:text-danger"
                            : "border-line text-ink-muted hover:border-success hover:text-success"
                        }`}
                        aria-label={bailarin.activo ? "Desactivar" : "Activar"}
                      >
                        {procesando === bailarin.id ? (
                          <span className="block h-[15px] w-[15px] animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                        ) : bailarin.activo ? (
                          <UserX size={15} />
                        ) : (
                          <UserCheck size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          onClick={() => setDetalle(null)}
        >
          <div
            className="w-full max-w-lg rounded-card border border-line bg-surface p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {(detalle.nombre?.[0] || "") + (detalle.apellido?.[0] || "")}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-ink">
                    {detalle.nombre} {detalle.apellido}
                  </h2>
                  <p className="text-[12px] text-ink-muted">DNI {detalle.dni}</p>
                </div>
              </div>
              <button
                onClick={() => setDetalle(null)}
                className="rounded p-1 text-ink-muted hover:text-ink"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2.5 border-t border-line pt-4 text-[13px]">
              <p className="flex justify-between">
                <span className="text-ink-muted">Ciudad</span>
                <strong className="text-ink">{detalle.ciudad || "—"}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Categoría</span>
                <strong className="text-ink">{detalle.categoria || "Sin definir"}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Academia</span>
                <strong className="text-ink">{detalle.academiaActual || "Independiente"}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Nivel</span>
                <strong className="text-ink">
                  {detalle.nivelEstrellas != null
                    ? `${Number(detalle.nivelEstrellas).toFixed(1)} / 5`
                    : "Pendiente"}
                </strong>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Inscripciones</span>
                <strong className="text-ink">{detalle.totalInscripciones}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Resultados</span>
                <strong className="text-ink">{detalle.totalResultados}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-ink-muted">Registrado</span>
                <strong className="text-ink">{formatearFecha(detalle.createdAt)}</strong>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Link
                to={`/bailarines/${detalle.id}`}
                className="rounded-btn border border-line px-4 py-2 text-sm font-medium text-ink-muted no-underline hover:border-primary hover:text-primary"
              >
                Ver perfil público
              </Link>
              <button
                onClick={() => cambiarEstado(detalle)}
                disabled={procesando === detalle.id}
                className={`rounded-btn px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                  detalle.activo
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-success hover:bg-success/90"
                }`}
              >
                {detalle.activo ? "Desactivar cuenta" : "Activar cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
