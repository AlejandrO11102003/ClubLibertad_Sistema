import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  LogIn,
  Sparkles,
} from "lucide-react";
import { authService, TipoDocumento } from "../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

const validarDocumento = (tipo: TipoDocumento, v: string) =>
  tipo === "DNI" ? /^\d{8}$/.test(v) : /^[A-Za-z0-9]{6,20}$/.test(v);

const inputBase =
  "w-full rounded-btn border-[1.5px] bg-cream py-[13px] pl-11 pr-11 text-sm text-ink outline-none transition placeholder:text-[#A8A199] focus:bg-white focus:shadow-[0_0_0_3px_rgba(155,27,48,0.10)]";

export default function Login() {
  const navigate = useNavigate();

  const [dni, setDni] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>("DNI");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [errorDni, setErrorDni] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState<Alerta>(null);
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);

  const onChangeDni = (e: ChangeEvent<HTMLInputElement>) => {
    const value = tipoDocumento === "DNI"
      ? e.target.value.replace(/\D/g, "").slice(0, 8)
      : e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 20).toUpperCase();
    setDni(value);
    setErrorDni(false);
    setAlerta(null);
  };

  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorPassword(false);
    setAlerta(null);
  };

  const onBlurDni = () =>
    setErrorDni(dni.trim() !== "" && !validarDocumento(tipoDocumento, dni.trim()));
  const onBlurPassword = () => setErrorPassword(password !== "" && password.length < 6);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dniLimpio = dni.trim();

    const dniMal = !validarDocumento(tipoDocumento, dniLimpio);
    const passMal = password.length < 6;
    setErrorDni(dniMal);
    setErrorPassword(passMal);

    if (dniMal || passMal) {
      setAlerta({ tipo: "error", texto: "Revisa los campos marcados en rojo." });
      return;
    }

    setCargando(true);
    setAlerta(null);

    try {
      const data = await authService.login({
        tipoDocumento,
        dni: dniLimpio,
        password,
      });

      authService.guardarSesion(data, recordarme);

      const rol = (
        data.rol ||
        data.role ||
        data.usuario?.rol ||
        (Array.isArray(data.roles) ? data.roles[0] : "") ||
        ""
      ).toUpperCase();

      const esAdmin = rol.includes("ADMIN");
      const nombreUsuario = data.nombre || data.usuario?.nombre || (esAdmin ? "administrador" : "bailarín");

      setAlerta({
        tipo: "exito",
        texto: `¡Bienvenido, ${nombreUsuario}! Redirigiendo…`,
      });

      setTimeout(() => {
        navigate(esAdmin ? "/admin" : "/panel");
      }, 1000);
    } catch (err: any) {
      const mensaje =
        err?.message ||
        err?.data?.mensaje ||
        err?.data?.message ||
        "No fue posible iniciar sesión. Verifica tu conexión o credenciales.";
      setAlerta({ tipo: "error", texto: mensaje });
    } finally {
      setCargando(false);
    }
  };

  const solicitarRecuperacion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dniLimpio = dni.trim();
    if (!validarDocumento(tipoDocumento, dniLimpio)) {
      setErrorDni(true);
      setAlerta({ tipo: "error", texto: "Primero ingresa un documento válido." });
      return;
    }

    setEnviandoRecuperacion(true);
    try {
      const email = await authService.forgotPassword({
        tipoDocumento,
        dni: dniLimpio,
      });
      setAlerta({
        tipo: "exito",
        texto: email
          ? `Enviamos el enlace de recuperación al correo ${email}.`
          : "Si el documento tiene un correo registrado, recibirás un enlace de recuperación.",
      });
      setMostrarRecuperacion(false);
    } catch (err: any) {
      setAlerta({ tipo: "error", texto: err?.message || "No se pudo procesar la solicitud." });
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 overflow-x-hidden md:grid-cols-2">
      {/* ------------------------- Panel izquierdo: branding ------------------------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#A3152E_0%,#5E0C1B_55%,#3F0812_100%)] p-12 text-white md:flex">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,.10) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(201,162,39,.30) 0%, transparent 50%)",
          }}
        />
        <img
          src="/Logooficial.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -right-10 w-[340px] opacity-10 [filter:invert(1)]"
        />

        <div className="relative z-10 flex h-full flex-col">
          <Link to="/" className="mb-auto flex items-center gap-3 text-white no-underline">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
              <img
                src="/Logooficial.png"
                alt="Logo Entre Pañuelos"
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-display text-2xl font-bold tracking-wide">
              ENTRE <span className="text-accent">PAÑUELOS</span>
            </span>
          </Link>

          <div className="my-auto py-10">
            <h1 className="mb-4 text-[44px] leading-[1.15] text-white">
              Bienvenido de vuelta a la <em className="not-italic text-accent">pista</em>.
            </h1>
            <p className="mb-7 max-w-[420px] text-[15px] leading-relaxed opacity-90">
              Ingresa con tu DNI para acceder a tu trayectoria, tus logros y tus admiradores. La marinera te
              espera.
            </p>

            <blockquote className="max-w-[420px] rounded-lg border-l-[3px] border-accent bg-white/[0.08] px-5 py-4 backdrop-blur-md">
              <p className="mb-2 text-[13.5px] italic leading-normal">
                "La marinera no se baila con los pies, se baila con el alma."
              </p>
              <span className="text-xs opacity-70">— Dicho popular trujillano</span>
            </blockquote>
          </div>
        </div>

        <div className="relative z-10 text-xs opacity-60">
          © {new Date().getFullYear()} Entre Pañuelos · Plataforma de Marinera
        </div>
      </aside>

      {/* ------------------------- Panel derecho: formulario ------------------------- */}
      <main className="flex items-center justify-center bg-white px-5 py-8 md:px-8 md:py-12">
        <div className="w-full max-w-[420px]">
          <Link
            to="/"
            className="mb-8 flex items-center justify-center gap-3 font-display text-[22px] font-bold text-primary no-underline md:hidden"
          >
            <img
              src="/Logooficial.png"
              alt="Logo Entre Pañuelos"
              className="h-11 w-11 object-contain"
            />
            <span>ENTRE PAÑUELOS</span>
          </Link>

          <div className="mb-8">
            <h2 className="mb-2 text-[30px] text-ink">Iniciar sesión</h2>
            <p className="text-sm leading-normal text-ink-muted">
              ¿Aún no tienes cuenta?{" "}
              <Link to="/registro" className="font-semibold text-primary no-underline hover:underline">
                Regístrate como bailarín
              </Link>
            </p>
          </div>

          {/* Aviso solo bailarines */}
          <div className="mb-[22px] flex items-start gap-2.5 rounded-btn border border-dashed border-accent bg-[#FFFCF2] px-3.5 py-3 text-[12.5px] leading-normal text-ink-muted">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-accent" />
            <div>
              <strong className="mb-0.5 block text-ink">Acceso exclusivo para bailarines</strong>
              Ingresa con el DNI con el que te registraste. Solo bailarines pueden admirar y competir.
            </div>
          </div>

          {/* Alertas */}
          {alerta && (
            <div
              role="alert"
              className={`mb-5 flex items-start gap-2.5 rounded-btn border-l-[3px] px-3.5 py-3 text-[13px] leading-snug ${
                alerta.tipo === "error"
                  ? "border-danger bg-blush text-danger"
                  : "border-success bg-[#EAF5EF] text-success"
              }`}
            >
              {alerta.tipo === "error" ? (
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              )}
              <span>{alerta.texto}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            {/* Documento */}
            <div className="mb-[18px]">
              <label htmlFor="tipoDocumento" className="mb-1.5 block text-[13px] font-medium">
                Tipo de documento <span className="text-primary">*</span>
              </label>
              <select
                id="tipoDocumento"
                value={tipoDocumento}
                onChange={(e) => {
                  setTipoDocumento(e.target.value as TipoDocumento);
                  setDni("");
                  setErrorDni(false);
                }}
                className={`${inputBase} mb-2 border-line focus:border-primary`}
              >
                <option value="DNI">DNI</option>
                <option value="CE">Carné de Extranjería</option>
              </select>
              <label htmlFor="dni" className="mb-1.5 block text-[13px] font-medium">
                Número de documento <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <IdCard
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted opacity-70"
                />
                <input
                  id="dni"
                  type="text"
                  inputMode={tipoDocumento === "DNI" ? "numeric" : "text"}
                  maxLength={tipoDocumento === "DNI" ? 8 : 20}
                  autoComplete="username"
                  placeholder={tipoDocumento === "DNI" ? "12345678" : "ABC123456"}
                  value={dni}
                  onChange={onChangeDni}
                  onBlur={onBlurDni}
                  className={`${inputBase} ${
                    errorDni ? "border-danger !bg-[#FEF6F5]" : "border-line focus:border-primary"
                  }`}
                />
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-muted">
                {tipoDocumento === "DNI"
                  ? "8 dígitos, sin puntos ni espacios."
                  : "Entre 6 y 20 caracteres alfanuméricos."}
              </p>
              {errorDni && (
                <p className="mt-1.5 text-xs text-danger">
                  {tipoDocumento === "DNI"
                    ? "El DNI debe tener exactamente 8 dígitos numéricos."
                    : "El Carné de Extranjería debe tener entre 6 y 20 caracteres alfanuméricos."}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="mb-[18px]">
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">
                Contraseña <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Lock
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted opacity-70"
                />
                <input
                  id="password"
                  type={verPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={onChangePassword}
                  onBlur={onBlurPassword}
                  className={`${inputBase} ${
                    errorPassword ? "border-danger !bg-[#FEF6F5]" : "border-line focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[15px] text-ink-muted opacity-55 hover:bg-cream hover:opacity-100"
                >
                  {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errorPassword && (
                <p className="mt-1.5 text-xs text-danger">La contraseña debe tener al menos 6 caracteres.</p>
              )}
            </div>

            {/* Recordarme / olvidé */}
            <div className="mb-[22px] flex items-center justify-between text-[13px]">
              <label className="flex cursor-pointer select-none items-center gap-2 text-ink-muted">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                <span>Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => setMostrarRecuperacion(true)}
                className="font-medium text-primary no-underline hover:underline cursor-pointer bg-transparent border-0 p-0 text-[13px]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-btn bg-primary p-3.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(155,27,48,0.25)] transition enabled:hover:-translate-y-px enabled:hover:bg-primary-hover enabled:hover:shadow-[0_4px_14px_rgba(155,27,48,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {cargando ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              ) : (
                <LogIn size={18} />
              )}
              <span>{cargando ? "Ingresando…" : "Ingresar"}</span>
            </button>
          </form>

          {mostrarRecuperacion && (
            <div className="mb-5 rounded-btn border border-line bg-cream p-4">
              <p className="mb-3 text-sm font-semibold text-ink">Recuperar contraseña</p>
              <p className="mb-3 text-xs leading-relaxed text-ink-muted">
                Usaremos el correo asociado a tu documento. Nunca puedes reemplazarlo por otro correo desde aquí.
              </p>
              <form onSubmit={solicitarRecuperacion} className="flex gap-2">
                <button
                  type="submit"
                  disabled={enviandoRecuperacion}
                  className="w-full rounded-btn bg-primary px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-70"
                >
                  {enviandoRecuperacion ? "Enviando…" : `Enviar al correo asociado`}
                </button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-[13px] leading-relaxed text-ink-muted">
            Al iniciar sesión aceptas nuestros{" "}
            <button
              type="button"
              className="font-semibold text-primary no-underline hover:underline cursor-pointer bg-transparent border-0 p-0 text-[13px]"
            >
              Términos
            </button>{" "}
            y{" "}
            <button
              type="button"
              className="font-semibold text-primary no-underline hover:underline cursor-pointer bg-transparent border-0 p-0 text-[13px]"
            >
              Política de privacidad
            </button>
            .
          </p>

          <p className="mt-5 border-t border-line pt-4 text-center text-[13px] text-ink-muted">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold text-primary no-underline hover:underline">
              Regístrate aquí como bailarín
            </Link>
          </p>

          
        </div>
      </main>
    </div>
  );
}