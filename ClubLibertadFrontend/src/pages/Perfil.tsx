import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import {
  ApiError,
  Perfil as PerfilData,
  PerfilRequest,
  authService,
  perfilService,
} from "../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

const CATEGORIAS = [
  "Pre-Infante (hasta 6 años)",
  "Infante (7 a 9 años)",
  "Infantil (10 a 13 años)",
  "Junior (14 a 17 años)",
  "Juvenil (18 a 21 años)",
  "Adultos (22 a 34 años)",
  "Senior (35 a 49 años)",
  "Master (50 a 64 años)",
  "Oro (65 años a más)",
];

const inputBase =
  "w-full rounded-btn border-[1.5px] bg-cream py-[11px] px-3.5 text-sm text-ink outline-none transition placeholder:text-[#A8A199] focus:bg-white focus:shadow-[0_0_0_3px_rgba(155,27,48,0.10)]";

function aFormulario(p: PerfilData): PerfilRequest {
  return {
    nombre: p.nombre || "",
    apellido: p.apellido || "",
    email: p.email || "",
    telefono: p.telefono || "",
    ciudad: p.ciudad || "",
    genero: p.genero || "",
    categoria: p.categoria || "",
    academiaActual: p.academiaActual || "",
    anioInicio: p.anioInicio,
    marineraFavorita: p.marineraFavorita || "",
    biografia: p.biografia || "",
    fotografiaUrl: p.fotografiaUrl || "",
  };
}

export default function PerfilPage() {
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [form, setForm] = useState<PerfilRequest>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [alerta, setAlerta] = useState<Alerta>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await perfilService.obtener();
        if (!activo) return;
        setPerfil(data);
        setForm(aFormulario(data));
      } catch (err: any) {
        if (!activo) return;

        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          authService.cerrarSesion();
          navigate("/login", { replace: true });
          return;
        }

        setAlerta({
          tipo: "error",
          texto: err?.message || "No se pudo cargar el perfil.",
        });
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "anioInicio" ? (value ? Number(value) : undefined) : value,
    }));

    if (errores[name]) {
      setErrores((prev) => {
        const nuevos = { ...prev };
        delete nuevos[name];
        return nuevos;
      });
    }
    setAlerta(null);
  };

  const validar = () => {
    const err: Record<string, string> = {};

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      err.email = "Ingresa un correo electrónico válido.";
    }

    if (form.telefono && !/^[0-9]{9}$/.test(form.telefono)) {
      err.telefono = "El teléfono debe tener 9 dígitos.";
    }

    if (
      form.anioInicio !== undefined &&
      (form.anioInicio < 1900 || form.anioInicio > new Date().getFullYear())
    ) {
      err.anioInicio = "El año de inicio no es válido.";
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

    try {
      const data = await perfilService.actualizar({
        ...form,
        nombre: form.nombre?.trim(),
        apellido: form.apellido?.trim(),
        email: form.email?.trim(),
        telefono: form.telefono?.trim(),
        ciudad: form.ciudad?.trim(),
        academiaActual: form.academiaActual?.trim(),
        marineraFavorita: form.marineraFavorita?.trim(),
        biografia: form.biografia?.trim(),
      });

      setPerfil(data);
      setForm(aFormulario(data));
      setAlerta({ tipo: "exito", texto: "Perfil actualizado correctamente." });
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        authService.cerrarSesion();
        navigate("/login", { replace: true });
        return;
      }

      if (err?.fieldErrors) {
        setErrores(err.fieldErrors);
      }

      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo actualizar el perfil.",
      });
    } finally {
      setGuardando(false);
    }
  };

  const cerrarSesion = () => {
    authService.cerrarSesion();
    navigate("/login", { replace: true });
  };

  const iniciales = `${perfil?.nombre?.[0] || ""}${perfil?.apellido?.[0] || ""}`.toUpperCase() || "EP";

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS
          </Link>

          <button
            onClick={cerrarSesion}
            className="inline-flex items-center gap-1.5 rounded-btn border border-line px-3 py-2 text-[13px] font-medium text-ink-muted transition hover:border-primary hover:text-primary"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-[30px] font-bold text-ink">Mi Perfil</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Actualiza tus datos personales y deportivos. Tu DNI nunca se muestra completo.
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

        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando perfil…</p>
          </div>
        ) : !perfil ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="mb-3 text-sm text-ink-muted">No se pudo cargar el perfil.</p>
            <Link to="/login" className="text-sm font-semibold text-primary">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
            <aside className="h-fit rounded-card border border-line bg-surface p-6 text-center shadow-sm2">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-accent bg-primary text-2xl font-semibold text-white">
                {iniciales}
              </div>
              <h2 className="font-display text-lg font-bold text-ink">
                {perfil.nombre || "Sin nombre"} {perfil.apellido || ""}
              </h2>
              <p className="mt-1 text-xs text-ink-muted">DNI {perfil.dni}</p>

              <div className="mt-3 inline-flex rounded-full bg-blush px-3 py-1 text-[11px] font-semibold text-primary">
                {perfil.rol === "ADMIN" ? "Administrador" : "Bailarín"}
              </div>

              <Link
                to={`/bailarines/${perfil.usuarioId}`}
                className="mt-4 block rounded-btn border border-line px-3 py-2 text-[12px] font-semibold text-primary no-underline transition hover:border-primary hover:bg-blush/40"
              >
                Ver mi perfil público
              </Link>

              <div className="mt-5 space-y-2 border-t border-line pt-4 text-left text-[13px]">
                <p>
                  <span className="text-ink-muted">Categoría: </span>
                  {perfil.categoria || "Sin definir"}
                </p>
                <p>
                  <span className="text-ink-muted">Ciudad: </span>
                  {perfil.ciudad || "Sin definir"}
                </p>
                <p>
                  <span className="text-ink-muted">Academia: </span>
                  {perfil.academiaActual || "Independiente"}
                </p>
                <p>
                  <span className="text-ink-muted">Bailarín desde: </span>
                  {perfil.anioInicio || "—"}
                </p>
              </div>
            </aside>

            <section className="rounded-card border border-line bg-surface p-5 shadow-sm2 sm:p-6">
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Datos personales
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Nombres</label>
                    <input
                      name="nombre"
                      value={form.nombre || ""}
                      onChange={handleChange}
                      className={`${inputBase} ${
                        errores.nombre ? "border-danger" : "border-line focus:border-primary"
                      }`}
                    />
                    {errores.nombre && <p className="mt-1 text-xs text-danger">{errores.nombre}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Apellidos</label>
                    <input
                      name="apellido"
                      value={form.apellido || ""}
                      onChange={handleChange}
                      className={`${inputBase} ${
                        errores.apellido ? "border-danger" : "border-line focus:border-primary"
                      }`}
                    />
                    {errores.apellido && <p className="mt-1 text-xs text-danger">{errores.apellido}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">DNI</label>
                    <input
                      value={perfil.dni || ""}
                      readOnly
                      className={`${inputBase} cursor-not-allowed border-line bg-sand/60 text-ink-muted`}
                    />
                    <p className="mt-1 text-xs text-ink-muted">El DNI no se puede modificar.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Correo electrónico</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      className={`${inputBase} ${
                        errores.email ? "border-danger" : "border-line focus:border-primary"
                      }`}
                    />
                    {errores.email && <p className="mt-1 text-xs text-danger">{errores.email}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Teléfono / WhatsApp</label>
                    <input
                      name="telefono"
                      inputMode="numeric"
                      maxLength={9}
                      value={form.telefono || ""}
                      onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/\D/g, "").slice(0, 9);
                        setForm((prev) => ({ ...prev, telefono: soloNumeros }));
                        setErrores((prev) => {
                          const nuevos = { ...prev };
                          delete nuevos.telefono;
                          return nuevos;
                        });
                      }}
                      className={`${inputBase} ${
                        errores.telefono ? "border-danger" : "border-line focus:border-primary"
                      }`}
                    />
                    {errores.telefono && <p className="mt-1 text-xs text-danger">{errores.telefono}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Ciudad</label>
                    <input
                      name="ciudad"
                      value={form.ciudad || ""}
                      onChange={handleChange}
                      className={`${inputBase} border-line focus:border-primary`}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Género / Modalidad</label>
                    <select
                      name="genero"
                      value={form.genero || ""}
                      onChange={handleChange}
                      className={`${inputBase} cursor-pointer border-line focus:border-primary`}
                    >
                      <option value="">Sin definir</option>
                      <option value="Femenino">Femenino (Dama)</option>
                      <option value="Masculino">Masculino (Varón)</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Categoría</label>
                    <select
                      name="categoria"
                      value={form.categoria || ""}
                      onChange={handleChange}
                      className={`${inputBase} cursor-pointer border-line focus:border-primary`}
                    >
                      <option value="">Sin definir</option>
                      {CATEGORIAS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h3 className="mb-4 mt-7 text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Datos deportivos
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Academia o club</label>
                    <input
                      name="academiaActual"
                      value={form.academiaActual || ""}
                      onChange={handleChange}
                      className={`${inputBase} border-line focus:border-primary`}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Año de inicio</label>
                    <input
                      name="anioInicio"
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={form.anioInicio ?? ""}
                      onChange={handleChange}
                      className={`${inputBase} ${
                        errores.anioInicio ? "border-danger" : "border-line focus:border-primary"
                      }`}
                    />
                    {errores.anioInicio && (
                      <p className="mt-1 text-xs text-danger">{errores.anioInicio}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Marinera favorita</label>
                    <select
                      name="marineraFavorita"
                      value={form.marineraFavorita || ""}
                      onChange={handleChange}
                      className={`${inputBase} cursor-pointer border-line focus:border-primary`}
                    >
                      <option value="">Sin definir</option>
                      <option value="Norteña">Norteña</option>
                      <option value="Limeña">Limeña</option>
                      <option value="Puneña">Puneña</option>
                      <option value="Serrana">Serrana</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Foto de perfil (URL)</label>
                    <input
                      name="fotografiaUrl"
                      placeholder="https://..."
                      value={form.fotografiaUrl || ""}
                      onChange={handleChange}
                      className={`${inputBase} ${
                        errores.fotografiaUrl ? "border-danger" : "border-line focus:border-primary"
                      }`}
                    />
                    {errores.fotografiaUrl && (
                      <p className="mt-1 text-xs text-danger">{errores.fotografiaUrl}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[13px] font-medium text-ink">Biografía</label>
                    <textarea
                      name="biografia"
                      rows={4}
                      maxLength={1000}
                      value={form.biografia || ""}
                      onChange={handleChange}
                      className={`${inputBase} resize-y border-line focus:border-primary`}
                    />
                    <p className="mt-1 text-right text-xs text-ink-muted">
                      {(form.biografia || "").length}/1000
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(aFormulario(perfil));
                      setErrores({});
                      setAlerta(null);
                    }}
                    className="rounded-btn border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition hover:border-primary hover:text-primary"
                  >
                    Descartar cambios
                  </button>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {guardando && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    )}
                    {guardando ? "Guardando…" : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
