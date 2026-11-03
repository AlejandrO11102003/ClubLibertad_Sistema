import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import {
  Concurso,
  Importacion,
  Resultado,
  adminConcursosService,
  adminResultadosService,
} from "../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

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

export default function AdminResultados() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [concursoId, setConcursoId] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const [reporte, setReporte] = useState<Importacion | null>(null);
  const [importaciones, setImportaciones] = useState<Importacion[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [alerta, setAlerta] = useState<Alerta>(null);
  const [cargando, setCargando] = useState(true);

  const cargarConcursos = async () => {
    try {
      const data = await adminConcursosService.listar();
      setConcursos(data);
      if (data.length > 0) {
        setConcursoId((prev) => prev || String(data[0].id));
      }
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudieron cargar los concursos.",
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      const data = await adminResultadosService.listarImportaciones();
      setImportaciones(data);
    } catch {
      // no bloquea la pantalla
    }
  };

  const cargarResultados = async (id: string) => {
    if (!id) return;
    try {
      const data = await adminResultadosService.listarResultados(id);
      setResultados(data);
    } catch {
      setResultados([]);
    }
  };

  useEffect(() => {
    cargarConcursos();
    cargarHistorial();
  }, []);

  useEffect(() => {
    if (concursoId) {
      cargarResultados(concursoId);
    }
  }, [concursoId]);

  const seleccionarArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo(file);
    setReporte(null);
    setAlerta(null);
  };

  const descargarPlantilla = async () => {
    setDescargando(true);
    setAlerta(null);

    try {
      if (!concursoId) {
        setAlerta({ tipo: "error", texto: "Selecciona un concurso." });
        return;
      }
      await adminResultadosService.descargarPlantilla(concursoId);
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo descargar la plantilla.",
      });
    } finally {
      setDescargando(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlerta(null);

    if (!concursoId) {
      setAlerta({ tipo: "error", texto: "Selecciona un concurso." });
      return;
    }

    if (!archivo) {
      setAlerta({ tipo: "error", texto: "Selecciona un archivo Excel." });
      return;
    }

    setImportando(true);
    setReporte(null);

    try {
      const data = await adminResultadosService.importar(concursoId, archivo);
      setReporte(data);
      setAlerta({
        tipo: data.filasInvalidas > 0 ? "error" : "exito",
        texto:
          data.filasInvalidas > 0
            ? `Se importaron ${data.filasValidas} filas y ${data.filasInvalidas} presentaron errores.`
            : `Se importaron ${data.filasValidas} resultados correctamente.`,
      });
      setArchivo(null);
      await cargarHistorial();
      await cargarResultados(concursoId);
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo importar el archivo.",
      });
    } finally {
      setImportando(false);
    }
  };

  const concursoSeleccionado = concursos.find((c) => String(c.id) === concursoId);

  return (
    <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="font-display text-[30px] font-bold text-ink">Cargar resultados</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Importa los resultados oficiales desde Excel. Las filas válidas se publican
            automáticamente.
          </p>
        </div>

        {alerta && (
          <div
            role="alert"
            className={`mb-5 flex items-start gap-2.5 rounded-btn border-l-[3px] px-3.5 py-3 text-[13px] ${
              alerta.tipo === "error"
                ? "border-danger bg-blush text-danger"
                : "border-success bg-[#EAF5EF] text-success"
            }`}
          >
            <span>{alerta.tipo === "error" ? "⚠️" : "✅"}</span>
            <span>{alerta.texto}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-card border border-line bg-surface p-5 shadow-sm2 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <FileSpreadsheet size={20} className="text-primary" /> Importar archivo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Concurso
                </label>
                <select
                  value={concursoId}
                  onChange={(e) => setConcursoId(e.target.value)}
                  disabled={cargando || concursos.length === 0}
                  className="w-full cursor-pointer rounded-btn border-[1.5px] border-line bg-cream px-3.5 py-[11px] text-sm text-ink outline-none focus:border-primary focus:bg-white"
                >
                  {concursos.length === 0 ? (
                    <option value="">No hay concursos disponibles</option>
                  ) : (
                    concursos.map((concurso) => (
                      <option key={concurso.id} value={concurso.id}>
                        {concurso.nombre} ({concurso.estado})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Archivo Excel
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-btn border-[1.5px] border-dashed border-line bg-cream px-4 py-7 text-center transition hover:border-primary hover:bg-white">
                  <Upload size={26} className="mb-2 text-primary" />
                  <span className="text-sm font-medium text-ink">
                    {archivo ? archivo.name : "Selecciona un archivo .xlsx o .xls"}
                  </span>
                  <span className="mt-1 text-[11px] text-ink-muted">
                    {archivo
                      ? `${(archivo.size / 1024).toFixed(1)} KB`
                      : "Máximo 10 MB"}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={seleccionarArchivo}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={descargarPlantilla}
                  disabled={descargando || !concursoId}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-btn border border-line px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  <Download size={16} />
                  {descargando ? "Descargando…" : "Descargar plantilla"}
                </button>

                <button
                  type="submit"
                  disabled={importando || !archivo || !concursoId}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {importando ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {importando ? "Importando…" : "Importar resultados"}
                </button>
              </div>
            </form>

            <div className="mt-5 rounded-btn bg-cream p-4 text-[12px] text-ink-muted">
              <p className="mb-1 font-semibold text-ink">Columnas obligatorias</p>
              <p>
                <code>categoria</code>, <code>dni_solicitante</code>,{" "}
                <code>dni_pareja</code>, <code>etapa</code>. La columna{" "}
                <code>posicion</code> puede quedar vacía para parejas sin posición. La columna{" "}
                <code>puntaje</code> es opcional.
              </p>
              <p className="mt-2">
                La pareja debe tener una inscripción confirmada en la categoría indicada.
              </p>
            </div>
          </section>

          <section className="rounded-card border border-line bg-surface p-5 shadow-sm2 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">
              Reporte de la última importación
            </h2>

            {!reporte ? (
              <div className="rounded-btn border border-dashed border-line p-6 text-center text-sm text-ink-muted">
                Sube un archivo para ver el reporte de filas válidas e inválidas.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-btn bg-[#EAF5EF] p-3 text-center">
                    <p className="text-2xl font-bold text-success">{reporte.filasValidas}</p>
                    <p className="text-[11px] font-medium text-success">Filas válidas</p>
                  </div>
                  <div className="rounded-btn bg-blush p-3 text-center">
                    <p className="text-2xl font-bold text-danger">{reporte.filasInvalidas}</p>
                    <p className="text-[11px] font-medium text-danger">Filas inválidas</p>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-muted">
                  {reporte.estado === "COMPLETADA" ? (
                    <CheckCircle2 size={15} className="text-success" />
                  ) : (
                    <AlertTriangle size={15} className="text-[#9A6B00]" />
                  )}
                  {reporte.archivo} · {reporte.estado}
                </p>

                {reporte.errores.length > 0 && (
                  <div className="mt-3 max-h-56 overflow-y-auto rounded-btn border border-line bg-cream p-3">
                    <p className="mb-2 text-[12px] font-semibold text-danger">
                      Observaciones
                    </p>
                    <ul className="space-y-1.5 text-[11px] leading-snug text-ink-muted">
                      {reporte.errores.map((error) => (
                        <li key={error}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-card border border-line bg-surface shadow-sm2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">
              Resultados cargados
            </h2>
            <span className="text-[12px] text-ink-muted">
              {concursoSeleccionado ? concursoSeleccionado.nombre : "Sin concurso seleccionado"}
            </span>
          </div>

          {resultados.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">
              No hay resultados cargados para este concurso.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Pareja</th>
                    <th className="px-4 py-3">Etapa</th>
                    <th className="px-4 py-3">Posición</th>
                    <th className="px-4 py-3">Puntaje</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((resultado) => (
                    <tr key={resultado.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-ink">
                        {resultado.categoriaNombre}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {resultado.solicitanteNombre} y {resultado.parejaNombre}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {resultado.etapa}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {resultado.posicion != null ? `${resultado.posicion}°` : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">
                        {resultado.puntaje != null ? Number(resultado.puntaje).toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[10px] font-bold uppercase text-success">
                          Publicado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-card border border-line bg-surface shadow-sm2">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">Historial de importaciones</h2>
          </div>

          {importaciones.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">
              Todavía no se han realizado importaciones.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-3">Archivo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Válidas</th>
                    <th className="px-4 py-3">Inválidas</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {importaciones.map((item) => (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-4 py-3 font-medium text-ink">{item.archivo}</td>
                      <td className="px-4 py-3 text-ink-muted">{item.estado}</td>
                      <td className="px-4 py-3 text-success">{item.filasValidas}</td>
                      <td className="px-4 py-3 text-danger">{item.filasInvalidas}</td>
                      <td className="px-4 py-3 text-ink-muted">
                        {formatearFechaHora(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </div>
  );
}
