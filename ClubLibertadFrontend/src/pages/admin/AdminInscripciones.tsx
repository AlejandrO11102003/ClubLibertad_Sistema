import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  Concurso,
  EstadoInscripcion,
  Inscripcion,
  adminConcursosService,
  adminInscripcionesService,
} from "../../services/api";

const formatearFechaHora = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const badge = (estado: EstadoInscripcion) => {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-[#EAF5EF] text-success";
    case "RECHAZADA":
      return "bg-blush text-danger";
    case "VENCIDA":
      return "bg-line text-ink-muted";
    default:
      return "bg-[#FFF4E0] text-[#9A6B00]";
  }
};

const etiqueta = (estado: EstadoInscripcion) => {
  switch (estado) {
    case "CONFIRMADA":
      return "Confirmada";
    case "RECHAZADA":
      return "Rechazada";
    case "VENCIDA":
      return "Vencida";
    default:
      return "Pendiente";
  }
};

export default function AdminInscripciones() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroConcurso, setFiltroConcurso] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [texto, setTexto] = useState("");
  const [detalle, setDetalle] = useState<Inscripcion | null>(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const [listaInscripciones, listaConcursos] = await Promise.all([
          adminInscripcionesService.listar(),
          adminConcursosService.listar(),
        ]);

        if (!activo) return;
        setInscripciones(listaInscripciones);
        setConcursos(listaConcursos);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudieron cargar las inscripciones.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  const categorias = useMemo(() => {
    const mapa = new Map<number, string>();
    inscripciones.forEach((i) => mapa.set(i.categoriaId, i.categoriaNombre));
    return Array.from(mapa.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [inscripciones]);

  const filtradas = useMemo(() => {
    const busqueda = normalizar(texto);

    return inscripciones.filter((inscripcion) => {
      if (filtroConcurso && inscripcion.concursoId !== Number(filtroConcurso)) return false;
      if (filtroCategoria && inscripcion.categoriaId !== Number(filtroCategoria)) return false;
      if (filtroEstado && inscripcion.estado !== filtroEstado) return false;

      if (!busqueda) return true;

      const contenido = normalizar(
        `${inscripcion.solicitanteNombre} ${inscripcion.parejaNombre} ${inscripcion.concursoNombre} ${inscripcion.categoriaNombre}`
      );
      return contenido.includes(busqueda);
    });
  }, [inscripciones, filtroConcurso, filtroCategoria, filtroEstado, texto]);

  const resumen = useMemo(
    () => ({
      total: inscripciones.length,
      pendientes: inscripciones.filter((i) => i.estado === "PENDIENTE").length,
      confirmadas: inscripciones.filter((i) => i.estado === "CONFIRMADA").length,
      cerradas: inscripciones.filter(
        (i) => i.estado === "RECHAZADA" || i.estado === "VENCIDA"
      ).length,
    }),
    [inscripciones]
  );

  const limpiarFiltros = () => {
    setFiltroConcurso("");
    setFiltroCategoria("");
    setFiltroEstado("");
    setTexto("");
  };

  const exportarConcurso = async () => {
    if (!filtroConcurso) {
      setError("Selecciona un concurso para exportar sus inscripciones.");
      return;
    }
    setExportando(true);
    setError(null);
    try {
      await adminInscripcionesService.exportar(filtroConcurso);
    } catch (err: any) {
      setError(err?.message || "No se pudo exportar el archivo.");
    } finally {
      setExportando(false);
    }
  };

  const tarjetas = [
    {
      label: "Total",
      valor: resumen.total,
      icon: ClipboardList,
      color: "bg-blush text-primary",
    },
    {
      label: "Pendientes",
      valor: resumen.pendientes,
      icon: Clock,
      color: "bg-[#FFF4E0] text-[#9A6B00]",
    },
    {
      label: "Confirmadas",
      valor: resumen.confirmadas,
      icon: CheckCircle2,
      color: "bg-[#EAF5EF] text-success",
    },
    {
      label: "Cerradas",
      valor: resumen.cerradas,
      icon: AlertTriangle,
      color: "bg-line text-ink-muted",
    },
  ];

  if (cargando) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
        <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-ink-muted">Cargando inscripciones…</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[30px] font-bold text-ink">Inscripciones</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Supervisa las solicitudes de pareja y las participaciones confirmadas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icon;
          return (
            <div
              key={tarjeta.label}
              className="rounded-card border border-line bg-surface p-4 shadow-sm2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-ink-muted">{tarjeta.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink">
                    {tarjeta.valor}
                  </p>
                </div>
                <span className={`rounded-btn p-2 ${tarjeta.color}`}>
                  <Icono size={18} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-card border border-line bg-surface p-4 shadow-sm2 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Concurso
            </label>
            <select
              value={filtroConcurso}
              onChange={(e) => setFiltroConcurso(e.target.value)}
              className="w-full cursor-pointer rounded-btn border border-line bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
            >
              <option value="">Todos los concursos</option>
              {concursos.map((concurso) => (
                <option key={concurso.id} value={concurso.id}>
                  {concurso.nombre}
                </option>
              ))}
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
              <option value="">Todas las categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full cursor-pointer rounded-btn border border-line bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="RECHAZADA">Rechazada</option>
              <option value="VENCIDA">Vencida</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Buscar
            </label>
            <div className="flex items-center rounded-btn border border-line bg-cream px-3">
              <Search size={15} className="text-ink-muted" />
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Nombre, concurso o categoría"
                className="w-full border-none bg-transparent px-2 py-2 text-[13px] text-ink outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-ink-muted">
            {filtradas.length} de {inscripciones.length} inscripciones
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={limpiarFiltros}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Limpiar filtros
            </button>
            <button
              onClick={exportarConcurso}
              disabled={exportando || !filtroConcurso}
              className="rounded-btn bg-primary px-3 py-2 text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportando ? "Exportando…" : "Exportar Excel"}
            </button>
          </div>
        </div>
      </section>

      {filtradas.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
          <Users className="mx-auto mb-3 text-ink-muted" size={34} />
          <p className="text-sm text-ink-muted">
            {inscripciones.length === 0
              ? "Todavía no hay inscripciones registradas."
              : "No hay inscripciones que coincidan con los filtros."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm2">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Pareja</th>
                <th className="px-4 py-3">Concurso</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Solicitada</th>
                <th className="px-4 py-3">Vence / Respuesta</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((inscripcion) => (
                <tr key={inscripcion.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      <Link
                        to={`/bailarines/${inscripcion.solicitanteId}`}
                        className="text-ink no-underline hover:text-primary hover:underline"
                      >
                        {inscripcion.solicitanteNombre}
                      </Link>{" "}
                      y{" "}
                      <Link
                        to={`/bailarines/${inscripcion.parejaId}`}
                        className="text-ink no-underline hover:text-primary hover:underline"
                      >
                        {inscripcion.parejaNombre}
                      </Link>
                    </p>
                    <p className="text-[11px] text-ink-muted">ID #{inscripcion.id}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{inscripcion.concursoNombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{inscripcion.categoriaNombre}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge(
                        inscripcion.estado
                      )}`}
                    >
                      {etiqueta(inscripcion.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-muted">
                    {formatearFechaHora(inscripcion.fechaSolicitud)}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-ink-muted">
                    {inscripcion.estado === "CONFIRMADA"
                      ? formatearFechaHora(inscripcion.fechaRespuesta)
                      : formatearFechaHora(inscripcion.fechaVencimiento)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDetalle(inscripcion)}
                      className="inline-flex items-center gap-1.5 rounded-btn border border-line px-3 py-1.5 text-[12px] font-medium text-ink-muted transition hover:border-primary hover:text-primary"
                    >
                      <Eye size={14} /> Ver
                    </button>
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
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  Inscripción #{detalle.id}
                </h2>
                <p className="text-[12px] text-ink-muted">{detalle.concursoNombre}</p>
              </div>
              <button
                onClick={() => setDetalle(null)}
                className="rounded p-1 text-ink-muted hover:text-ink"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${badge(
                detalle.estado
              )}`}
            >
              {etiqueta(detalle.estado)}
            </span>

            <div className="mt-4 space-y-3 border-t border-line pt-4 text-[13px]">
              <p className="flex justify-between gap-4">
                <span className="text-ink-muted">Categoría</span>
                <strong className="text-right text-ink">{detalle.categoriaNombre}</strong>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-ink-muted">Solicitante</span>
                <Link
                  to={`/bailarines/${detalle.solicitanteId}`}
                  className="text-right font-semibold text-primary no-underline hover:underline"
                >
                  {detalle.solicitanteNombre}
                </Link>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-ink-muted">Pareja</span>
                <Link
                  to={`/bailarines/${detalle.parejaId}`}
                  className="text-right font-semibold text-primary no-underline hover:underline"
                >
                  {detalle.parejaNombre}
                </Link>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-ink-muted">Solicitada</span>
                <strong className="text-right text-ink">
                  {formatearFechaHora(detalle.fechaSolicitud)}
                </strong>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-ink-muted">
                  {detalle.estado === "CONFIRMADA" ? "Confirmada" : "Vence"}
                </span>
                <strong className="text-right text-ink">
                  {detalle.estado === "CONFIRMADA"
                    ? formatearFechaHora(detalle.fechaRespuesta)
                    : formatearFechaHora(detalle.fechaVencimiento)}
                </strong>
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetalle(null)}
                className="rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
