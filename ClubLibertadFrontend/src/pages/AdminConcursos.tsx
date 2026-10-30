import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Categoria,
  Concurso,
  ConcursoRequest,
  EstadoConcurso,
  adminConcursosService,
  adminCategoriasService,
} from "../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

interface FormState {
  nombre: string;
  bannerUrl: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  estado: EstadoConcurso;
}

interface SeleccionCategoria {
  seleccionada: boolean;
  cupo: string;
  precio: string;
}

const FORM_INICIAL: FormState = {
  nombre: "",
  bannerUrl: "",
  fechaInicio: "",
  fechaFin: "",
  lugar: "",
  estado: "BORRADOR",
};

const inputBase =
  "w-full rounded-btn border-[1.5px] border-line bg-cream py-[11px] px-3.5 text-sm text-ink outline-none transition placeholder:text-[#A8A199] focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(155,27,48,0.10)]";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const badgeEstado = (estado: EstadoConcurso) => {
  if (estado === "PUBLICADO") return "bg-[#EAF5EF] text-success";
  if (estado === "CERRADO") return "bg-line text-ink-muted";
  return "bg-[#FFF4E0] text-[#9A6B00]";
};

export default function AdminConcursos() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [alerta, setAlerta] = useState<Alerta>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [seleccion, setSeleccion] = useState<Record<number, SeleccionCategoria>>({});
  const [categoriasOriginales, setCategoriasOriginales] = useState<Set<number>>(
    new Set()
  );

  const cargarDatos = async () => {
    try {
      const [listaConcursos, listaCategorias] = await Promise.all([
        adminConcursosService.listar(),
        adminCategoriasService.listar(),
      ]);
      setConcursos(listaConcursos);
      setCategorias(listaCategorias);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los concursos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const inicializarSeleccion = (concurso?: Concurso) => {
    const siguiente: Record<number, SeleccionCategoria> = {};

    categorias.forEach((cat) => {
      siguiente[cat.id] = { seleccionada: false, cupo: "", precio: "" };
    });

    concurso?.categorias.forEach((cc) => {
      siguiente[cc.categoriaId] = {
        seleccionada: true,
        cupo: cc.cupo != null ? String(cc.cupo) : "",
        precio: cc.precio != null ? String(cc.precio) : "",
      };
    });

    setSeleccion(siguiente);
  };

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setAlerta(null);
    setCategoriasOriginales(new Set());
    inicializarSeleccion();
    setMostrarForm(true);
  };

  const abrirEditar = (concurso: Concurso) => {
    setEditandoId(concurso.id);
    setForm({
      nombre: concurso.nombre,
      bannerUrl: concurso.bannerUrl || "",
      fechaInicio: concurso.fechaInicio || "",
      fechaFin: concurso.fechaFin || "",
      lugar: concurso.lugar,
      estado: concurso.estado,
    });
    setErrores({});
    setAlerta(null);
    setCategoriasOriginales(
      new Set(concurso.categorias.map((cc) => cc.categoriaId))
    );
    inicializarSeleccion(concurso);
    setMostrarForm(true);
  };

  const cerrarFormulario = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setErrores({});
    setForm(FORM_INICIAL);
    setCategoriasOriginales(new Set());
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => {
      const nuevos = { ...prev };
      delete nuevos[name];
      return nuevos;
    });
  };

  const toggleCategoria = (categoriaId: number) => {
    setSeleccion((prev) => ({
      ...prev,
      [categoriaId]: {
        seleccionada: !prev[categoriaId]?.seleccionada,
        cupo: prev[categoriaId]?.cupo || "",
        precio: prev[categoriaId]?.precio || "",
      },
    }));
    setErrores((prev) => {
      const nuevos = { ...prev };
      delete nuevos.categorias;
      return nuevos;
    });
  };

  const actualizarCategoria = (
    categoriaId: number,
    campo: "cupo" | "precio",
    valor: string
  ) => {
    setSeleccion((prev) => ({
      ...prev,
      [categoriaId]: {
        seleccionada: true,
        cupo: campo === "cupo" ? valor : prev[categoriaId]?.cupo || "",
        precio: campo === "precio" ? valor : prev[categoriaId]?.precio || "",
      },
    }));
  };

  const construirCategorias = () =>
    Object.entries(seleccion)
      .filter(([, valor]) => valor.seleccionada)
      .map(([categoriaId, valor]) => ({
        categoriaId: Number(categoriaId),
        cupo: valor.cupo ? Number(valor.cupo) : undefined,
        precio: valor.precio ? Number(valor.precio) : undefined,
      }));

  const validar = () => {
    const err: Record<string, string> = {};

    if (!form.nombre.trim()) err.nombre = "El nombre es obligatorio.";
    if (!form.lugar.trim()) err.lugar = "El lugar es obligatorio.";
    if (!form.fechaInicio) err.fechaInicio = "La fecha de inicio es obligatoria.";
    if (form.fechaFin && form.fechaInicio && form.fechaFin < form.fechaInicio) {
      err.fechaFin = "La fecha de fin no puede ser anterior a la de inicio.";
    }
    if (construirCategorias().length === 0) {
      err.categorias = "Selecciona al menos una categoría.";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlerta(null);

    if (!validar()) {
      setAlerta({ tipo: "error", texto: "Revisa los campos marcados." });
      return;
    }

    setGuardando(true);

    const payload: ConcursoRequest = {
      nombre: form.nombre.trim(),
      bannerUrl: form.bannerUrl.trim() || undefined,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin || undefined,
      lugar: form.lugar.trim(),
      estado: form.estado,
      categorias: construirCategorias(),
    };

    try {
      if (editandoId) {
        await adminConcursosService.actualizar(editandoId, payload);
        setAlerta({ tipo: "exito", texto: "Concurso actualizado correctamente." });
      } else {
        await adminConcursosService.crear(payload);
        setAlerta({ tipo: "exito", texto: "Concurso creado correctamente." });
      }

      await cargarDatos();
      cerrarFormulario();
    } catch (err: any) {
      if (err?.fieldErrors) {
        setErrores(err.fieldErrors);
      }
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo guardar el concurso.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (concurso: Concurso) => {
    if (!window.confirm(`¿Eliminar el concurso "${concurso.nombre}"?`)) return;

    try {
      await adminConcursosService.eliminar(concurso.id);
      setConcursos((prev) => prev.filter((c) => c.id !== concurso.id));
      setAlerta({ tipo: "exito", texto: "Concurso eliminado correctamente." });
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo eliminar el concurso.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-[30px] font-bold text-ink">Administrar concursos</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Crea concursos, asigna categorías y controla su publicación.
            </p>
          </div>

          <button
            onClick={abrirNuevo}
            className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <Plus size={18} /> Nuevo concurso
          </button>
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

        {mostrarForm && (
          <section className="mb-8 rounded-card border border-line bg-surface p-5 shadow-sm2 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">
                {editandoId ? "Editar concurso" : "Nuevo concurso"}
              </h2>
              <button
                onClick={cerrarFormulario}
                className="text-sm font-medium text-ink-muted hover:text-primary"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Nombre del concurso
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Selectivo Lima Norte 2026"
                    className={`${inputBase} ${errores.nombre ? "border-danger" : ""}`}
                  />
                  {errores.nombre && <p className="mt-1 text-xs text-danger">{errores.nombre}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">Lugar</label>
                  <input
                    name="lugar"
                    value={form.lugar}
                    onChange={handleChange}
                    placeholder="Ej. Trujillo, Perú"
                    className={`${inputBase} ${errores.lugar ? "border-danger" : ""}`}
                  />
                  {errores.lugar && <p className="mt-1 text-xs text-danger">{errores.lugar}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">Estado</label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className={`${inputBase} cursor-pointer`}
                  >
                    <option value="BORRADOR">Borrador</option>
                    <option value="PUBLICADO">Publicado</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Fecha de inicio
                  </label>
                  <input
                    name="fechaInicio"
                    type="date"
                    value={form.fechaInicio}
                    onChange={handleChange}
                    className={`${inputBase} ${errores.fechaInicio ? "border-danger" : ""}`}
                  />
                  {errores.fechaInicio && (
                    <p className="mt-1 text-xs text-danger">{errores.fechaInicio}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    Fecha de fin (opcional)
                  </label>
                  <input
                    name="fechaFin"
                    type="date"
                    value={form.fechaFin}
                    onChange={handleChange}
                    className={`${inputBase} ${errores.fechaFin ? "border-danger" : ""}`}
                  />
                  {errores.fechaFin && (
                    <p className="mt-1 text-xs text-danger">{errores.fechaFin}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[13px] font-medium text-ink">
                    URL del banner (opcional)
                  </label>
                  <input
                    name="bannerUrl"
                    value={form.bannerUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Categorías del concurso
                  </h3>
                  {errores.categorias && (
                    <span className="text-xs text-danger">{errores.categorias}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categorias.map((cat) => {
                    const seleccionada = seleccion[cat.id]?.seleccionada;
                    const inactiva = cat.activa === false;
                    const bloqueada = inactiva && !categoriasOriginales.has(cat.id);

                    return (
                      <div
                        key={cat.id}
                        className={`rounded-btn border p-3 transition ${
                          seleccionada ? "border-primary bg-blush/40" : "border-line bg-cream"
                        } ${bloqueada ? "opacity-60" : ""}`}
                      >
                        <label
                          className={`flex items-center gap-2 text-sm font-medium text-ink ${
                            bloqueada ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(seleccionada)}
                            onChange={() => toggleCategoria(cat.id)}
                            disabled={bloqueada}
                            className="h-4 w-4 accent-primary disabled:cursor-not-allowed"
                          />
                          {cat.nombre}
                          {inactiva && (
                            <span className="rounded-full bg-line px-1.5 py-0.5 text-[9px] font-semibold uppercase text-ink-muted">
                              Inactiva
                            </span>
                          )}
                        </label>

                        <p className="mt-1 text-[11px] text-ink-muted">
                          {cat.edadMin != null && cat.edadMax != null
                            ? `${cat.edadMin} - ${cat.edadMax} años`
                            : "Edad libre"}
                          {bloqueada ? " · No disponible" : ""}
                        </p>

                        {seleccionada && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min={0}
                              placeholder="Cupo"
                              value={seleccion[cat.id]?.cupo || ""}
                              onChange={(e) =>
                                actualizarCategoria(cat.id, "cupo", e.target.value)
                              }
                              className="w-full rounded border border-line bg-white px-2 py-1 text-xs outline-none focus:border-primary"
                            />
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="Precio"
                              value={seleccion[cat.id]?.precio || ""}
                              onChange={(e) =>
                                actualizarCategoria(cat.id, "precio", e.target.value)
                              }
                              className="w-full rounded border border-line bg-white px-2 py-1 text-xs outline-none focus:border-primary"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="rounded-btn border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition hover:border-primary hover:text-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {guardando && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  )}
                  {guardando ? "Guardando…" : editandoId ? "Guardar cambios" : "Crear concurso"}
                </button>
              </div>
            </form>
          </section>
        )}

        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando concursos…</p>
          </div>
        ) : error ? (
          <div className="rounded-card border border-danger/30 bg-blush p-6 text-sm text-danger">
            {error}
          </div>
        ) : concursos.length === 0 ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="mb-3 text-sm text-ink-muted">Todavía no hay concursos registrados.</p>
            <button onClick={abrirNuevo} className="text-sm font-semibold text-primary">
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm2">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Concurso</th>
                  <th className="px-4 py-3">Fechas</th>
                  <th className="px-4 py-3">Lugar</th>
                  <th className="px-4 py-3">Categorías</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {concursos.map((concurso) => (
                  <tr key={concurso.id} className="border-t border-line align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{concurso.nombre}</p>
                      <p className="text-[11px] text-ink-muted">ID #{concurso.id}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {formatearFecha(concurso.fechaInicio)}
                      {concurso.fechaFin ? ` - ${formatearFecha(concurso.fechaFin)}` : ""}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{concurso.lugar}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {concurso.categorias.length}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeEstado(
                          concurso.estado
                        )}`}
                      >
                        {concurso.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(concurso)}
                          className="rounded border border-line p-1.5 text-ink-muted transition hover:border-primary hover:text-primary"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => eliminar(concurso)}
                          className="rounded border border-line p-1.5 text-ink-muted transition hover:border-danger hover:text-danger"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
