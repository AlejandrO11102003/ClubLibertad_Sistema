import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import {
  AdminDashboard as AdminDashboardData,
  EstadoInscripcion,
  adminDashboardService,
} from "../../services/api";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatearFechaHora = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const badgeEstado = (estado: EstadoInscripcion) => {
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

const etiquetaEstado = (estado: EstadoInscripcion) => {
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

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const respuesta = await adminDashboardService.obtener();
        if (activo) setData(respuesta);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudo cargar el dashboard.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
        <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-ink-muted">Cargando dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
        {error || "No se pudo cargar el dashboard."}
      </div>
    );
  }

  const totalInscripciones = Math.max(data.inscripcionesTotal, 1);
  const porcentajeConfirmadas = Math.round(
    (data.inscripcionesConfirmadas / totalInscripciones) * 100
  );
  const porcentajePendientes = Math.round(
    (data.inscripcionesPendientes / totalInscripciones) * 100
  );

  const kpis = [
    {
      label: "Bailarines registrados",
      valor: data.bailarinesRegistrados,
      icon: Users,
      color: "text-primary bg-blush",
      to: "/admin/bailarines",
    },
    {
      label: "Concursos activos",
      valor: data.concursosPublicados,
      icon: Trophy,
      color: "text-[#8B6F00] bg-[#FFF7DB]",
      to: "/admin/concursos",
    },
    {
      label: "Inscripciones pendientes",
      valor: data.inscripcionesPendientes,
      icon: ClipboardList,
      color: "text-[#9A6B00] bg-[#FFF4E0]",
      to: "/admin/inscripciones",
    },
    {
      label: "Resultados publicados",
      valor: data.resultadosPublicados,
      icon: CheckCircle2,
      color: "text-success bg-[#EAF5EF]",
      to: "/admin/resultados",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-[30px] font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Resumen general de la plataforma y actividad reciente.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/admin/concursos"
            className="inline-flex items-center justify-center gap-2 rounded-btn border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted no-underline transition hover:border-primary hover:text-primary"
          >
            <Plus size={16} /> Nuevo concurso
          </Link>
          <Link
            to="/admin/resultados"
            className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-primary-hover"
          >
            <FileSpreadsheet size={16} /> Cargar resultados
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icono = kpi.icon;
          return (
            <Link
              key={kpi.label}
              to={kpi.to}
              className="rounded-card border border-line bg-surface p-5 no-underline shadow-sm2 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-medium text-ink-muted">{kpi.label}</p>
                  <p className="mt-2 font-display text-[30px] font-bold text-ink">
                    {kpi.valor}
                  </p>
                </div>
                <span className={`rounded-btn p-2.5 ${kpi.color}`}>
                  <Icono size={20} />
                </span>
              </div>
              <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary">
                Ver módulo <ArrowRight size={12} />
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-card border border-line bg-surface shadow-sm2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">
              Inscripciones recientes
            </h2>
            <Link
              to="/admin/inscripciones"
              className="text-[12px] font-semibold text-primary no-underline hover:underline"
            >
              Ver todas
            </Link>
          </div>

          {data.inscripcionesRecientes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">
              Todavía no hay inscripciones registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-3">Pareja</th>
                    <th className="px-4 py-3">Concurso</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {data.inscripcionesRecientes.map((inscripcion) => (
                    <tr key={inscripcion.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-ink">
                        {inscripcion.solicitanteNombre} y {inscripcion.parejaNombre}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {inscripcion.concursoNombre}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {inscripcion.categoriaNombre}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeEstado(
                            inscripcion.estado
                          )}`}
                        >
                          {etiquetaEstado(inscripcion.estado)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-ink-muted">
                        {formatearFechaHora(inscripcion.fechaSolicitud)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">
              Estado de inscripciones
            </h2>

            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-ink-muted">Confirmadas</span>
                  <strong className="text-ink">
                    {data.inscripcionesConfirmadas} ({porcentajeConfirmadas}%)
                  </strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${porcentajeConfirmadas}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="text-ink-muted">Pendientes</span>
                  <strong className="text-ink">
                    {data.inscripcionesPendientes} ({porcentajePendientes}%)
                  </strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${porcentajePendientes}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-center">
              <div className="rounded-btn bg-cream p-2">
                <p className="text-lg font-bold text-ink">{data.inscripcionesTotal}</p>
                <p className="text-[10px] text-ink-muted">Total</p>
              </div>
              <div className="rounded-btn bg-cream p-2">
                <p className="text-lg font-bold text-ink">{data.categoriasTotal}</p>
                <p className="text-[10px] text-ink-muted">Categorías</p>
              </div>
            </div>
          </section>

          <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">
                Próximos concursos
              </h2>
              <Link
                to="/admin/concursos"
                className="text-[12px] font-semibold text-primary no-underline hover:underline"
              >
                Ver todos
              </Link>
            </div>

            {data.proximosConcursos.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-ink-muted">
                No hay concursos publicados próximos.
              </p>
            ) : (
              <ul className="space-y-3 text-[13px]">
                {data.proximosConcursos.map((concurso) => (
                  <li key={concurso.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                    <p className="font-semibold text-ink">{concurso.nombre}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-muted">
                      <CalendarDays size={13} /> {formatearFecha(concurso.fechaInicio)} ·{" "}
                      {concurso.lugar}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">
                Últimas importaciones
              </h2>
              <Link
                to="/admin/resultados"
                className="text-[12px] font-semibold text-primary no-underline hover:underline"
              >
                Ver módulo
              </Link>
            </div>

            {data.ultimasImportaciones.length === 0 ? (
              <p className="py-4 text-center text-[12px] text-ink-muted">
                Todavía no hay importaciones.
              </p>
            ) : (
              <ul className="space-y-3 text-[12px]">
                {data.ultimasImportaciones.map((importacion) => (
                  <li
                    key={importacion.id}
                    className="flex items-start justify-between gap-2 border-b border-line pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-ink">{importacion.archivo}</p>
                      <p className="text-[10px] text-ink-muted">
                        {formatearFechaHora(importacion.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        importacion.estado === "COMPLETADA"
                          ? "bg-[#EAF5EF] text-success"
                          : "bg-[#FFF4E0] text-[#9A6B00]"
                      }`}
                    >
                      {importacion.estado === "COMPLETADA" ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <AlertTriangle size={10} />
                      )}
                      {importacion.filasValidas}/{importacion.filasInvalidas}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
