import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  Megaphone,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import {
  Anuncio,
  AnuncioRequest,
  adminAnunciosService,
  resolverImagen,
} from "../../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

interface FormState {
  titulo: string;
  entidad: string;
  descripcion: string;
  imagenUrl: string;
  enlaceUrl: string;
  activo: boolean;
  orden: string;
  fechaInicio: string;
  fechaFin: string;
}

const FORM_INICIAL: FormState = {
  titulo: "",
  entidad: "",
  descripcion: "",
  imagenUrl: "",
  enlaceUrl: "",
  activo: true,
  orden: "",
  fechaInicio: "",
  fechaFin: "",
};

const inputBase =
  "w-full rounded-btn border-[1.5px] border-line bg-cream px-3.5 py-[10px] text-sm text-ink outline-none transition focus:border-primary focus:bg-white";

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const esExterno = (enlace?: string) => Boolean(enlace && /^https?:\/\//i.test(enlace));

export default function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerta, setAlerta] = useState<Alerta>(null);

  const [texto, setTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [procesando, setProcesando] = useState<number | null>(null);

  const inputArchivo = useRef<HTMLInputElement>(null);

  const cargar = async () => {
    try {
      const data = await adminAnunciosService.listar();
      setAnuncios(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los anuncios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    if (!modalAbierto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") cerrarModal();
    };

    document.addEventListener("keydown", alPresionarTecla);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", alPresionarTecla);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalAbierto]);

  const resumen = useMemo(
    () => ({
      total: anuncios.length,
      activos: anuncios.filter((a) => a.activo).length,
      vigentes: anuncios.filter((a) => a.vigente).length,
      programados: anuncios.filter(
        (a) => a.activo && a.fechaInicio && new Date(`${a.fechaInicio}T00:00:00`) > new Date()
      ).length,
    }),
    [anuncios]
  );

  const filtrados = useMemo(() => {
    const busqueda = normalizar(texto);

    return anuncios.filter((anuncio) => {
      if (filtroEstado === "true" && !anuncio.activo) return false;
      if (filtroEstado === "false" && anuncio.activo) return false;
      if (!busqueda) return true;

      return normalizar(`${anuncio.titulo} ${anuncio.entidad || ""}`).includes(busqueda);
    });
  }, [anuncios, texto, filtroEstado]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErrores({});
    setAlerta(null);
    setModalAbierto(true);
  };

  const abrirEditar = (anuncio: Anuncio) => {
    setEditandoId(anuncio.id);
    setForm({
      titulo: anuncio.titulo,
      entidad: anuncio.entidad || "",
      descripcion: anuncio.descripcion || "",
      imagenUrl: anuncio.imagenUrl,
      enlaceUrl: anuncio.enlaceUrl || "",
      activo: anuncio.activo,
      orden: String(anuncio.orden ?? 0),
      fechaInicio: anuncio.fechaInicio || "",
      fechaFin: anuncio.fechaFin || "",
    });
    setErrores({});
    setAlerta(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setErrores({});
    setForm(FORM_INICIAL);
  };

  const handleChange = (
    evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = evento.target;
    const checked = (evento.target as HTMLInputElement).checked;

    setForm((previo) => ({
      ...previo,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrores((previos) => {
      const nuevos = { ...previos };
      delete nuevos[name];
      return nuevos;
    });
    setAlerta(null);
  };

  const subirArchivo = async (archivo: File) => {
    setAlerta(null);

    if (!/^image\/(jpeg|png|webp)$/i.test(archivo.type)) {
      setAlerta({ tipo: "error", texto: "La imagen debe ser JPG, PNG o WEBP." });
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setAlerta({ tipo: "error", texto: "La imagen no puede superar los 5 MB." });
      return;
    }

    setSubiendo(true);

    try {
      const { url } = await adminAnunciosService.subirImagen(archivo);
      setForm((previo) => ({ ...previo, imagenUrl: url }));
      setErrores((previos) => {
        const nuevos = { ...previos };
        delete nuevos.imagenUrl;
        return nuevos;
      });
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo subir la imagen.",
      });
    } finally {
      setSubiendo(false);
    }
  };

  const alSoltarArchivo = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    setArrastrando(false);

    const archivo = evento.dataTransfer.files?.[0];
    if (archivo) subirArchivo(archivo);
  };

  const validar = () => {
    const nuevos: Record<string, string> = {};

    if (!form.titulo.trim()) {
      nuevos.titulo = "El título es obligatorio.";
    }

    if (!form.imagenUrl) {
      nuevos.imagenUrl = "Sube la imagen del anuncio.";
    }

    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
      nuevos.fechaFin = "La fecha de fin no puede ser anterior al inicio.";
    }

    if (form.enlaceUrl.trim()) {
      const enlace = form.enlaceUrl.trim();
      if (!enlace.startsWith("/") && !/^https?:\/\//i.test(enlace)) {
        nuevos.enlaceUrl = "Usa un enlace http(s):// o una ruta interna que empiece con /.";
      }
    }

    if (form.orden && Number(form.orden) < 0) {
      nuevos.orden = "El orden no puede ser negativo.";
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setAlerta(null);

    if (!validar()) {
      setAlerta({ tipo: "error", texto: "Revisa los campos marcados." });
      return;
    }

    const payload: AnuncioRequest = {
      titulo: form.titulo.trim(),
      entidad: form.entidad.trim() || undefined,
      descripcion: form.descripcion.trim() || undefined,
      imagenUrl: form.imagenUrl,
      enlaceUrl: form.enlaceUrl.trim() || undefined,
      activo: form.activo,
      orden: form.orden ? Number(form.orden) : undefined,
      fechaInicio: form.fechaInicio || undefined,
      fechaFin: form.fechaFin || undefined,
    };

    setGuardando(true);

    try {
      if (editandoId) {
        await adminAnunciosService.actualizar(editandoId, payload);
        setAlerta({ tipo: "exito", texto: "Anuncio actualizado correctamente." });
      } else {
        await adminAnunciosService.crear(payload);
        setAlerta({ tipo: "exito", texto: "Anuncio creado correctamente." });
      }

      await cargar();
      cerrarModal();
    } catch (err: any) {
      if (err?.fieldErrors) setErrores(err.fieldErrors);
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo guardar el anuncio.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarActivo = async (anuncio: Anuncio) => {
    setProcesando(anuncio.id);
    setAlerta(null);

    try {
      const actualizado = await adminAnunciosService.cambiarActivo(
        anuncio.id,
        !anuncio.activo
      );

      setAnuncios((previos) =>
        previos.map((item) => (item.id === actualizado.id ? actualizado : item))
      );

      setAlerta({
        tipo: "exito",
        texto: actualizado.activo
          ? "Anuncio activado. Se mostrará en el carrusel si está vigente."
          : "Anuncio desactivado. Ya no se muestra en el landing.",
      });
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo cambiar el estado del anuncio.",
      });
    } finally {
      setProcesando(null);
    }
  };

  const mover = async (anuncio: Anuncio, direccion: "SUBIR" | "BAJAR") => {
    setProcesando(anuncio.id);
    setAlerta(null);

    try {
      const lista = await adminAnunciosService.mover(anuncio.id, direccion);
      setAnuncios(lista);
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo reordenar el anuncio.",
      });
    } finally {
      setProcesando(null);
    }
  };

  const eliminar = async (anuncio: Anuncio) => {
    const confirmado = window.confirm(
      `¿Eliminar el anuncio "${anuncio.titulo}"? Esta acción no se puede deshacer.`
    );

    if (!confirmado) return;

    setProcesando(anuncio.id);
    setAlerta(null);

    try {
      await adminAnunciosService.eliminar(anuncio.id);
      setAnuncios((previos) => previos.filter((item) => item.id !== anuncio.id));
      setAlerta({ tipo: "exito", texto: "Anuncio eliminado correctamente." });
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo eliminar el anuncio.",
      });
    } finally {
      setProcesando(null);
    }
  };

  const tarjetas = [
    { label: "Total", valor: resumen.total, color: "bg-blush text-primary" },
    { label: "Activos", valor: resumen.activos, color: "bg-[#EAF5EF] text-success" },
    { label: "En el carrusel", valor: resumen.vigentes, color: "bg-[#FFF7DB] text-[#8B6F00]" },
    { label: "Programados", valor: resumen.programados, color: "bg-line text-ink-muted" },
  ];

  if (cargando) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
        <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-ink-muted">Cargando anuncios…</p>
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
          <h1 className="font-display text-[30px] font-bold text-ink">Anuncios</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Publicidad que aparece en el carrusel del inicio. Si no hay anuncios vigentes,
            el landing muestra al bailarín destacado.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} /> Nuevo anuncio
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
            <p
              className={`mt-1 inline-block rounded px-1.5 font-display text-2xl font-bold ${tarjeta.color}`}
            >
              {tarjeta.valor}
            </p>
          </div>
        ))}
      </div>

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
                onChange={(evento) => setTexto(evento.target.value)}
                placeholder="Título o entidad"
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
              onChange={(evento) => setFiltroEstado(evento.target.value)}
              className="w-full cursor-pointer rounded-btn border border-line bg-cream px-3 py-2 text-[13px] outline-none focus:border-primary"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </section>

      {filtrados.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
          <Megaphone className="mx-auto mb-3 text-ink-muted" size={34} />
          <p className="mb-1 text-sm text-ink-muted">
            Todavía no hay anuncios publicados.
          </p>
          <p className="text-xs text-ink-muted">
            Crea el primero y aparecerá en el carrusel del inicio.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-sm2">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-cream text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Anuncio</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((anuncio, posicion) => (
                <tr
                  key={anuncio.id}
                  className={`border-t border-line align-top ${
                    anuncio.activo ? "" : "bg-cream/60"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-11 shrink-0 overflow-hidden rounded border border-line bg-cream">
                        {anuncio.imagenUrl ? (
                          <img
                            src={resolverImagen(anuncio.imagenUrl)}
                            alt={anuncio.titulo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-ink-muted">
                            <ImagePlus size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`font-medium ${
                            anuncio.activo ? "text-ink" : "text-ink-muted"
                          }`}
                        >
                          {anuncio.titulo}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {anuncio.entidad || "Sin entidad"}
                        </p>
                        {anuncio.enlaceUrl && (
                          <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-primary">
                            {esExterno(anuncio.enlaceUrl)
                              ? anuncio.enlaceUrl
                              : `Ruta interna ${anuncio.enlaceUrl}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-ink-muted">
                    <span className="inline-flex items-center gap-1 text-[12px]">
                      <CalendarDays size={13} />
                      {anuncio.fechaInicio || anuncio.fechaFin
                        ? `${formatearFecha(anuncio.fechaInicio) || "Inicio libre"} — ${
                            formatearFecha(anuncio.fechaFin) || "Sin fin"
                          }`
                        : "Sin límite"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-5 text-center text-ink-muted">
                        {anuncio.orden}
                      </span>
                      <button
                        onClick={() => mover(anuncio, "SUBIR")}
                        disabled={procesando === anuncio.id || posicion === 0}
                        className="rounded border border-line p-1 text-ink-muted transition hover:border-primary hover:text-primary disabled:opacity-40"
                        aria-label="Subir"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => mover(anuncio, "BAJAR")}
                        disabled={
                          procesando === anuncio.id || posicion === filtrados.length - 1
                        }
                        className="rounded border border-line p-1 text-ink-muted transition hover:border-primary hover:text-primary disabled:opacity-40"
                        aria-label="Bajar"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          anuncio.activo
                            ? "bg-[#EAF5EF] text-success"
                            : "bg-line text-ink-muted"
                        }`}
                      >
                        {anuncio.activo ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        {anuncio.activo ? "Activo" : "Inactivo"}
                      </span>

                      {anuncio.activo && (
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide ${
                            anuncio.vigente ? "text-primary" : "text-ink-muted"
                          }`}
                        >
                          {anuncio.vigente ? "En el carrusel" : "Fuera de fechas"}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirEditar(anuncio)}
                        className="rounded border border-line p-1.5 text-ink-muted transition hover:border-primary hover:text-primary"
                        aria-label="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => cambiarActivo(anuncio)}
                        disabled={procesando === anuncio.id}
                        className={`rounded border border-line p-1.5 transition disabled:opacity-50 ${
                          anuncio.activo
                            ? "text-ink-muted hover:border-danger hover:text-danger"
                            : "text-ink-muted hover:border-success hover:text-success"
                        }`}
                        aria-label={anuncio.activo ? "Desactivar" : "Activar"}
                      >
                        {procesando === anuncio.id ? (
                          <span className="block h-[15px] w-[15px] animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                        ) : (
                          <Power size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => eliminar(anuncio)}
                        disabled={procesando === anuncio.id}
                        className="rounded border border-line p-1.5 text-ink-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
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

      {modalAbierto && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="anuncio-modal-titulo"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) cerrarModal();
          }}
        >
          <div className="my-auto w-full max-w-3xl overflow-hidden rounded-[20px] border border-line bg-surface shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="anuncio-modal-titulo"
                  className="font-display text-lg font-bold text-ink sm:text-xl"
                >
                  {editandoId ? "Editar anuncio" : "Nuevo anuncio"}
                </h2>
                <p className="text-[12px] text-ink-muted">
                  Sube el flyer y define a dónde lleva el clic.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-primary hover:text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="max-h-[calc(100vh-14rem)] overflow-y-auto px-5 py-5 sm:px-6">
                {alerta && (
                  <div
                    className={`mb-4 rounded-btn border-l-[3px] px-3.5 py-3 text-[13px] ${
                      alerta.tipo === "error"
                        ? "border-danger bg-blush text-danger"
                        : "border-success bg-[#EAF5EF] text-success"
                    }`}
                  >
                    {alerta.texto}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">
                      Imagen del anuncio <span className="text-primary">*</span>
                    </label>

                    <div
                      onClick={() => inputArchivo.current?.click()}
                      onDragOver={(evento) => {
                        evento.preventDefault();
                        setArrastrando(true);
                      }}
                      onDragLeave={() => setArrastrando(false)}
                      onDrop={alSoltarArchivo}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(evento) => {
                        if (evento.key === "Enter" || evento.key === " ") {
                          evento.preventDefault();
                          inputArchivo.current?.click();
                        }
                      }}
                      className={`relative flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border-2 border-dashed text-center transition ${
                        arrastrando
                          ? "border-primary bg-blush"
                          : errores.imagenUrl
                          ? "border-danger bg-blush/60"
                          : "border-line bg-cream hover:border-primary"
                      }`}
                    >
                      {form.imagenUrl ? (
                        <>
                          <img
                            src={resolverImagen(form.imagenUrl)}
                            alt="Vista previa del anuncio"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-[11px] font-semibold text-white">
                            Cambiar imagen
                          </span>
                        </>
                      ) : subiendo ? (
                        <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                      ) : (
                        <div className="px-4">
                          <UploadCloud className="mx-auto mb-2 text-ink-muted" size={26} />
                          <p className="text-[12px] font-semibold text-ink">
                            Sube el flyer
                          </p>
                          <p className="mt-1 text-[11px] text-ink-muted">
                            Arrastra aquí o haz clic. JPG, PNG o WEBP (máx. 5 MB).
                          </p>
                        </div>
                      )}

                      {subiendo && form.imagenUrl && (
                        <span className="absolute inset-0 grid place-items-center bg-black/45">
                          <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        </span>
                      )}
                    </div>

                    <input
                      ref={inputArchivo}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(evento) => {
                        const archivo = evento.target.files?.[0];
                        if (archivo) subirArchivo(archivo);
                        evento.target.value = "";
                      }}
                    />

                    {errores.imagenUrl && (
                      <p className="mt-1 text-xs text-danger">{errores.imagenUrl}</p>
                    )}

                    <p className="mt-2 text-[11px] leading-snug text-ink-muted">
                      Recomendado: 800 × 1000 px (vertical 4:5).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[13px] font-medium text-ink">
                        Título <span className="text-primary">*</span>
                      </label>
                      <input
                        name="titulo"
                        value={form.titulo}
                        onChange={handleChange}
                        placeholder="Ej. Temporada de clases 2026"
                        className={`${inputBase} ${errores.titulo ? "border-danger" : ""}`}
                      />
                      {errores.titulo && (
                        <p className="mt-1 text-xs text-danger">{errores.titulo}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink">
                        Entidad
                      </label>
                      <input
                        name="entidad"
                        value={form.entidad}
                        onChange={handleChange}
                        placeholder="Academia, tienda, marca…"
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink">
                        Orden
                      </label>
                      <input
                        name="orden"
                        type="number"
                        min={0}
                        value={form.orden}
                        onChange={handleChange}
                        placeholder="Automático"
                        className={`${inputBase} ${errores.orden ? "border-danger" : ""}`}
                      />
                      {errores.orden && (
                        <p className="mt-1 text-xs text-danger">{errores.orden}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[13px] font-medium text-ink">
                        Enlace al hacer clic
                      </label>
                      <input
                        name="enlaceUrl"
                        value={form.enlaceUrl}
                        onChange={handleChange}
                        placeholder="https://academia.com o /concursos"
                        className={`${inputBase} ${
                          errores.enlaceUrl ? "border-danger" : ""
                        }`}
                      />
                      {errores.enlaceUrl ? (
                        <p className="mt-1 text-xs text-danger">{errores.enlaceUrl}</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-ink-muted">
                          Déjalo vacío si el flyer no debe ser clicable.
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[13px] font-medium text-ink">
                        Descripción interna
                      </label>
                      <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Solo visible en el panel (opcional)"
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink">
                        Mostrar desde
                      </label>
                      <input
                        name="fechaInicio"
                        type="date"
                        value={form.fechaInicio}
                        onChange={handleChange}
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink">
                        Mostrar hasta
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
                      <label className="flex w-fit cursor-pointer items-center gap-2 text-[13px] font-medium text-ink">
                        <input
                          type="checkbox"
                          name="activo"
                          checked={form.activo}
                          onChange={handleChange}
                          className="h-4 w-4 accent-primary"
                        />
                        Publicar en el carrusel
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-btn border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:border-primary hover:text-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || subiendo}
                  className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {guardando && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  )}
                  {guardando
                    ? "Guardando…"
                    : editandoId
                    ? "Guardar cambios"
                    : "Crear anuncio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
