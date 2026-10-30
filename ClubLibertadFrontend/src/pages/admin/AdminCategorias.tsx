import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Pencil,
  Plus,
  Power,
  Search,
  Tags,
  XCircle,
} from "lucide-react";
import {
  Categoria,
  CategoriaRequest,
  Concurso,
  adminCategoriasService,
  adminConcursosService,
} from "../../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

interface FormState {
  nombre: string;
  edadMin: string;
  edadMax: string;
  genero: string;
  activa: boolean;
}

const FORM_INICIAL: FormState = {
  nombre: "",
  edadMin: "",
  edadMax: "",
  genero: "",
  activa: true,
};

const inputBase =
  "w-full rounded-btn border-[1.5px] border-line bg-cream px-3.5 py-[10px] text-sm text-ink outline-none transition focus:border-primary focus:bg-white";

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const rangoEdades = (categoria: Categoria) => {
  if (categoria.edadMin != null && categoria.edadMax != null) {
    return `${categoria.edadMin} - ${categoria.edadMax} años`;
  }
  if (categoria.edadMin != null) return `Desde ${categoria.edadMin} años`;
  if (categoria.edadMax != null) return `Hasta ${categoria.edadMax} años`;
  return "Libre";
};

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<Alerta>(null);

  const [texto, setTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = async () => {
    try {
      const [listaCategorias, listaConcursos] = await Promise.all([
        adminCategoriasService.listar(),
        adminConcursosService.listar(),
      ]);
      setCategorias(listaCategorias);
      setConcursos(listaConcursos);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const usoPorCategoria = useMemo(() => {
    const mapa = new Map<number, number>();
    concursos.forEach((concurso) => {
      concurso.categorias.forEach((asignacion) => {
        mapa.set(
          asignacion.categoriaId,
          (mapa.get(asignacion.categoriaId) || 0) + 1
        );
      });
    });
    return mapa;
  }, [concursos]);

  const resumen = useMemo(
    () => ({
      total: categorias.length,
      activas: categorias.filter((c) => c.activa !== false).length,
      inactivas: categorias.filter((c) => c.activa === false).length,
      enUso: categorias.filter((c) => (usoPorCategoria.get(c.id) || 0) > 0).length,
    }),
    [categorias, usoPorCategoria]
  );

  const filtradas = useMemo(() => {
    const busqueda = normalizar(texto);

    return categorias.filter((categoria) => {
      if (filtroEstado === "true" && categoria.activa === false) return false;
      if (filtroEstado === "false" && categoria.activa !== false) return false;
      if (!busqueda) return true;

      return normalizar(`${categoria.nombre} ${categoria.genero || ""}`).includes(
        busqueda
      );
    });
  }, [categorias, texto, filtroEstado]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setAlerta(null);
    setMostrarForm(true);
  };

  const abrirEditar = (categoria: Categoria) => {
    setEditandoId(categoria.id);
    setForm({
      nombre: categoria.nombre,
      edadMin: categoria.edadMin != null ? String(categoria.edadMin) : "",
      edadMax: categoria.edadMax != null ? String(categoria.edadMax) : "",
      genero: categoria.genero || "",
      activa: categoria.activa !== false,
    });
    setErrores({});
    setAlerta(null);
    setMostrarForm(true);
  };

  const cerrarFormulario = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setErrores({});
    setForm(FORM_INICIAL);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrores((prev) => {
      const nuevos = { ...prev };
      delete nuevos[name];
      return nuevos;
    });
    setAlerta(null);
  };

  const validar = () => {
    const err: Record<string, string> = {};

    if (!form.nombre.trim()) err.nombre = "El nombre es obligatorio.";

    if (form.edadMin && Number(form.edadMin) < 0) {
      err.edadMin = "La edad mínima no es válida.";
    }

    if (form.edadMax && Number(form.edadMax) < 0) {
      err.edadMax = "La edad máxima no es válida.";
    }

    if (
      form.edadMin &&
      form.edadMax &&
      Number(form.edadMin) > Number(form.edadMax)
    ) {
      err.edadMax = "La edad máxima debe ser mayor o igual a la mínima.";
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

    const payload: CategoriaRequest = {
      nombre: form.nombre.trim(),
      edadMin: form.edadMin ? Number(form.edadMin) : undefined,
      edadMax: form.edadMax ? Number(form.edadMax) : undefined,
      genero: form.genero.trim() || undefined,
      activa: form.activa,
    };

    try {
      if (editandoId) {
        await adminCategoriasService.actualizar(editandoId, payload);
        setAlerta({ tipo: "exito", texto: "Categoría actualizada correctamente." });
      } else {
        await adminCategoriasService.crear(payload);
        setAlerta({ tipo: "exito", texto: "Categoría creada correctamente." });
      }

      await cargar();
      cerrarFormulario();
    } catch (err: any) {
      if (err?.fieldErrors) setErrores(err.fieldErrors);
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo guardar la categoría.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarActiva = async (categoria: Categoria) => {
    const accion = categoria.activa === false ? "activar" : "desactivar";
    const confirmado = window.confirm(
      `¿Seguro que deseas ${accion} la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) return;

    setProcesando(categoria.id);
    setAlerta(null);

    try {
      const actualizada = await adminCategoriasService.cambiarActiva(
        categoria.id,
        categoria.activa === false
      );
      setCategorias((prev) =>
        prev.map((c) => (c.id === actualizada.id ? actualizada : c))
      );
      setAlerta({
        tipo: "exito",
        texto:
          actualizada.activa === false
            ? "Categoría desactivada. No se ofrecerá en nuevos concursos."
            : "Categoría activada correctamente.",
      });
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo cambiar el estado de la categoría.",
      });
    } finally {
      setProcesando(null);
    }
  };

  const tarjetas = [
    { label: "Total", valor: resumen.total, color: "bg-blush text-primary" },
    { label: "Activas", valor: resumen.activas, color: "bg-[#EAF5EF] text-success" },
    { label: "Inactivas", valor: resumen.inactivas, color: "bg-line text-ink-muted" },
    { label: "En uso", valor: resumen.enUso, color: "bg-[#FFF7DB] text-[#8B6F00]" },
  ];

  if (cargando) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
        <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-ink-muted">Cargando categorías…</p>
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-[30px] font-bold text-ink">Categorías</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Administra las categorías disponibles para los concursos.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} /> Nueva categoría
        </button>
      </div>

      {alerta && (
        <div
          className={`rounded-btn border-l-[3px] px-3.5 py-3 text-[13px] ${
            alerta.tipo === "error"
              ? "border-danger bg-blush text-danger"
              : "border-success bg-[#EAF5EF] text-success"
          }`}
        >
          {alerta.texto}
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

      {mostrarForm && (
        <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">
              {editandoId ? "Editar categoría" : "Nueva categoría"}
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
                  Nombre
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juvenil"
                  className={`${inputBase} ${errores.nombre ? "border-danger" : ""}`}
                />
                {errores.nombre && (
                  <p className="mt-1 text-xs text-danger">{errores.nombre}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Edad mínima
                </label>
                <input
                  name="edadMin"
                  type="number"
                  min={0}
                  max={120}
                  value={form.edadMin}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className={`${inputBase} ${errores.edadMin ? "border-danger" : ""}`}
                />
                {errores.edadMin && (
                  <p className="mt-1 text-xs text-danger">{errores.edadMin}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Edad máxima
                </label>
                <input
                  name="edadMax"
                  type="number"
                  min={0}
                  max={120}
                  value={form.edadMax}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className={`${inputBase} ${errores.edadMax ? "border-danger" : ""}`}
                />
                {errores.edadMax && (
                  <p className="mt-1 text-xs text-danger">{errores.edadMax}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink">
                  Género / Modalidad
                </label>
                <select
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  className={`${inputBase} cursor-pointer`}
                >
                  <option value="">Sin definir</option>
                  <option value="Mixto">Mixto</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 pb-2 text-[13px] font-medium text-ink">
                  <input
                    type="checkbox"
                    name="activa"
                    checked={form.activa}
                    onChange={handleChange}
                    className="h-4 w-4 accent-primary"
                  />
                  Categoría activa
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={cerrarFormulario}
                className="rounded-btn border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:border-primary hover:text-primary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
              >
                {guardando && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                )}
                {guardando ? "Guardando…" : editandoId ? "Guardar cambios" : "Crear categoría"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-card border border-line bg-surface p-4 shadow-sm2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Buscar
            </label>
            <div className="flex items-center rounded-btn border border-line bg-cream px-3">
              <Search size={15} className="text-ink-muted" />
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Nombre de la categoría"
                className="w-full border-none bg-transparent px-2 py-2 text-[13px] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full cursor-pointer rounded-btn border border-line bg-cream px-3 py-2 text-[13px] outline-none focus:border-primary"
            >
              <option value="">Todas</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </div>
        </div>
      </section>

      {filtradas.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
          <Tags className="mx-auto mb-3 text-ink-muted" size={34} />
          <p className="text-sm text-ink-muted">
            No hay categorías que coincidan con los filtros.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm2">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Rango de edad</th>
                <th className="px-4 py-3">Género</th>
                <th className="px-4 py-3">Uso en concursos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((categoria) => {
                const activa = categoria.activa !== false;
                const uso = usoPorCategoria.get(categoria.id) || 0;

                return (
                  <tr
                    key={categoria.id}
                    className={`border-t border-line align-top ${
                      activa ? "" : "bg-cream/60"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className={`font-medium ${activa ? "text-ink" : "text-ink-muted"}`}>
                        {categoria.nombre}
                      </p>
                      <p className="text-[11px] text-ink-muted">ID #{categoria.id}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {rangoEdades(categoria)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {categoria.genero || "Sin definir"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{uso}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          activa
                            ? "bg-[#EAF5EF] text-success"
                            : "bg-line text-ink-muted"
                        }`}
                      >
                        {activa ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(categoria)}
                          className="rounded border border-line p-1.5 text-ink-muted transition hover:border-primary hover:text-primary"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => cambiarActiva(categoria)}
                          disabled={procesando === categoria.id}
                          className={`rounded border border-line p-1.5 transition disabled:opacity-50 ${
                            activa
                              ? "text-ink-muted hover:border-danger hover:text-danger"
                              : "text-ink-muted hover:border-success hover:text-success"
                          }`}
                          aria-label={activa ? "Desactivar" : "Activar"}
                        >
                          {procesando === categoria.id ? (
                            <span className="block h-[15px] w-[15px] animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                          ) : (
                            <Power size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
