import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Search, UserCheck } from "lucide-react";
import {
  BailarinBusqueda,
  Concurso,
  bailarinesService,
  concursosService,
  inscripcionesService,
} from "../services/api";

type Alerta = { tipo: "error" | "exito"; texto: string } | null;

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

export default function SolicitarInscripcion() {
  const { concursoId } = useParams<{ concursoId: string }>();

  const [concurso, setConcurso] = useState<Concurso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoriaId, setCategoriaId] = useState("");
  const [parejaDni, setParejaDni] = useState("");
  const [pareja, setPareja] = useState<BailarinBusqueda | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [errorPareja, setErrorPareja] = useState<string | null>(null);

  const [enviando, setEnviando] = useState(false);
  const [alerta, setAlerta] = useState<Alerta>(null);
  const [enviada, setEnviada] = useState(false);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await concursosService.obtener(concursoId || "");
        if (!activo) return;
        setConcurso(data);
        if (data.categorias.length > 0) {
          setCategoriaId(String(data.categorias[0].categoriaId));
        }
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudo cargar el concurso.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [concursoId]);

  const buscarPareja = async () => {
    setErrorPareja(null);
    setPareja(null);

    if (!/^\d{8}$/.test(parejaDni.trim())) {
      setErrorPareja("El DNI debe tener exactamente 8 dígitos.");
      return;
    }

    setBuscando(true);

    try {
      const data = await bailarinesService.buscarPorDni(parejaDni.trim());
      setPareja(data);
    } catch (err: any) {
      setErrorPareja(err?.message || "No se encontró a la pareja.");
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAlerta(null);

    if (!categoriaId) {
      setAlerta({ tipo: "error", texto: "Selecciona una categoría." });
      return;
    }

    if (!pareja) {
      setAlerta({ tipo: "error", texto: "Busca y confirma a tu pareja por DNI." });
      return;
    }

    setEnviando(true);

    try {
      await inscripcionesService.crear({
        concursoId: Number(concursoId),
        categoriaId: Number(categoriaId),
        parejaDni: parejaDni.trim(),
      });

      setEnviada(true);
      setAlerta({
        tipo: "exito",
        texto: "Solicitud enviada. Tu pareja debe aceptarla para confirmar la inscripción.",
      });
    } catch (err: any) {
      setAlerta({
        tipo: "error",
        texto: err?.message || "No se pudo enviar la solicitud.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const categoriaSeleccionada = concurso?.categorias.find(
    (c) => String(c.categoriaId) === categoriaId
  );

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            to={concurso ? `/concursos/${concurso.id}` : "/concursos"}
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS
          </Link>
          <Link to="/inscripciones" className="text-[13px] font-semibold text-primary no-underline">
            Mis inscripciones
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Cargando concurso…</p>
          </div>
        ) : error || !concurso ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2">
            <p className="mb-3 text-sm text-ink-muted">{error || "Concurso no encontrado."}</p>
            <Link to="/concursos" className="text-sm font-semibold text-primary">
              Volver al listado
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="font-display text-[30px] font-bold text-ink">Solicitar inscripción</h1>
              <p className="mt-1 text-sm text-ink-muted">
                {concurso.nombre} · {concurso.lugar} · {formatearFecha(concurso.fechaInicio)}
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

            {concurso.estado !== "PUBLICADO" && (
              <div className="mb-5 rounded-btn border-l-[3px] border-danger bg-blush px-3.5 py-3 text-[13px] text-danger">
                Este concurso ya no está abierto para inscripciones.
              </div>
            )}

            {enviada ? (
              <div className="rounded-card border border-success/30 bg-surface p-8 text-center shadow-sm2">
                <CheckCircle2 className="mx-auto mb-3 text-success" size={42} />
                <h2 className="font-display text-xl font-bold text-ink">Solicitud enviada</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
                  Tu pareja recibirá una notificación y deberá aceptar la solicitud para
                  confirmar la inscripción.
                </p>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    to="/inscripciones"
                    className="rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-primary-hover"
                  >
                    Ver mis inscripciones
                  </Link>
                  <Link
                    to="/concursos"
                    className="rounded-btn border border-line px-5 py-2.5 text-sm font-medium text-ink-muted no-underline hover:border-primary hover:text-primary"
                  >
                    Seguir explorando
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
                  <h2 className="mb-1 font-display text-lg font-bold text-ink">
                    1. Elige la categoría
                  </h2>
                  <p className="mb-4 text-[13px] text-ink-muted">
                    Solo puedes tener una inscripción activa por categoría.
                  </p>

                  {concurso.categorias.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                      Este concurso no tiene categorías disponibles.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {concurso.categorias.map((cat) => (
                        <label
                          key={cat.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-btn border p-3 transition ${
                            String(cat.categoriaId) === categoriaId
                              ? "border-primary bg-blush/40"
                              : "border-line bg-cream hover:border-primary/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="categoria"
                            value={cat.categoriaId}
                            checked={String(cat.categoriaId) === categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            className="mt-1 h-4 w-4 accent-primary"
                          />
                          <span>
                            <strong className="block text-sm text-ink">{cat.nombre}</strong>
                            <span className="text-[11px] text-ink-muted">
                              {cat.cupo != null ? `Cupo: ${cat.cupo}` : "Sin límite de cupo"}
                              {cat.precio != null ? ` · S/ ${Number(cat.precio).toFixed(2)}` : ""}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
                  <h2 className="mb-1 font-display text-lg font-bold text-ink">
                    2. Busca a tu pareja
                  </h2>
                  <p className="mb-4 text-[13px] text-ink-muted">
                    Ingresa el DNI del bailarín con quien quieres competir.
                  </p>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={parejaDni}
                      onChange={(e) => {
                        setParejaDni(e.target.value.replace(/\D/g, "").slice(0, 8));
                        setPareja(null);
                        setErrorPareja(null);
                      }}
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="DNI de tu pareja"
                      className={`${inputBase} ${
                        errorPareja ? "border-danger" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={buscarPareja}
                      disabled={buscando || parejaDni.length !== 8}
                      className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {buscando ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      ) : (
                        <Search size={16} />
                      )}
                      Buscar
                    </button>
                  </div>

                  {errorPareja && (
                    <p className="mt-2 text-xs text-danger">{errorPareja}</p>
                  )}

                  {pareja && (
                    <div className="mt-4 flex items-center gap-3 rounded-btn border border-success/40 bg-[#EAF5EF] p-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                        {(pareja.nombre?.[0] || "") + (pareja.apellido?.[0] || "")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                          <UserCheck size={15} className="text-success" />
                          {pareja.nombre} {pareja.apellido}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          DNI {pareja.dni}
                          {pareja.categoria ? ` · ${pareja.categoria}` : ""}
                          {pareja.ciudad ? ` · ${pareja.ciudad}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPareja(null);
                          setParejaDni("");
                        }}
                        className="text-xs font-semibold text-primary"
                      >
                        Cambiar
                      </button>
                    </div>
                  )}
                </section>

                <section className="rounded-card border border-line bg-surface p-5 shadow-sm2">
                  <h2 className="mb-3 font-display text-lg font-bold text-ink">Resumen</h2>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between border-b border-line pb-2">
                      <span className="text-ink-muted">Concurso</span>
                      <span className="font-medium text-ink">{concurso.nombre}</span>
                    </p>
                    <p className="flex justify-between border-b border-line pb-2">
                      <span className="text-ink-muted">Categoría</span>
                      <span className="font-medium text-ink">
                        {categoriaSeleccionada?.nombre || "Sin seleccionar"}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-ink-muted">Pareja</span>
                      <span className="font-medium text-ink">
                        {pareja ? `${pareja.nombre} ${pareja.apellido}` : "Sin confirmar"}
                      </span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      enviando || !pareja || !categoriaId || concurso.estado !== "PUBLICADO"
                    }
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enviando && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    )}
                    {enviando ? "Enviando solicitud…" : "Enviar solicitud a mi pareja"}
                  </button>
                </section>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
