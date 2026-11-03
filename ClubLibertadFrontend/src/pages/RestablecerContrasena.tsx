import { FormEvent, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { authService } from "../services/api";

export default function RestablecerContrasena() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMensaje("");
    if (!token) return setError("El enlace de recuperación no contiene un token.");
    if (password !== confirmacion) return setError("Las contraseñas no coinciden.");
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return setError("Usa al menos 8 caracteres, una mayúscula, un número y un símbolo.");
    }

    setCargando(true);
    try {
      await authService.resetPassword({ token, password });
      setMensaje("Contraseña actualizada. Ya puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err?.message || "El enlace no es válido o ya expiró.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl text-ink">Nueva contraseña</h1>
        <p className="mb-6 text-sm text-ink-muted">Crea una contraseña segura para tu cuenta.</p>
        {error && <div className="mb-4 flex gap-2 rounded-btn bg-blush p-3 text-sm text-danger"><AlertTriangle size={17} />{error}</div>}
        {mensaje && <div className="mb-4 flex gap-2 rounded-btn bg-[#EAF5EF] p-3 text-sm text-success"><CheckCircle2 size={17} />{mensaje}</div>}
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">Nueva contraseña
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-ink-muted" size={17} />
              <input className="w-full rounded-btn border border-line bg-cream p-3 pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </label>
          <label className="block text-sm font-medium">Repetir contraseña
            <input className="mt-1 w-full rounded-btn border border-line bg-cream p-3" type="password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} />
          </label>
          <button disabled={cargando} className="w-full rounded-btn bg-primary p-3 font-semibold text-white disabled:opacity-70">
            {cargando ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>
        <Link to="/login" className="mt-5 block text-center text-sm font-semibold text-primary">Volver a iniciar sesión</Link>
      </section>
    </main>
  );
}
