import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Printer,
  Share2,
} from "lucide-react";
import { Credencial as CredencialData, credencialesService } from "../services/api";

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function FotoBailarin({
  nombre,
  apellido,
  foto,
}: {
  nombre?: string;
  apellido?: string;
  foto?: string;
}) {
  const iniciales = `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase() || "EP";

  return (
    <div className="flex flex-col items-center">
      {foto ? (
        <img
          src={foto}
          alt={`${nombre || ""} ${apellido || ""}`}
          className="h-24 w-24 rounded-full border-[3px] border-accent object-cover sm:h-28 sm:w-28"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-accent bg-primary text-2xl font-semibold text-white sm:h-28 sm:w-28">
          {iniciales}
        </div>
      )}

      <p className="mt-2 text-center text-sm font-bold text-ink">
        {nombre} {apellido}
      </p>
    </div>
  );
}

export default function CredencialPage() {
  const { inscripcionId } = useParams<{ inscripcionId: string }>();

  const [credencial, setCredencial] = useState<CredencialData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const data = await credencialesService.obtener(inscripcionId || "");
        if (activo) setCredencial(data);
      } catch (err: any) {
        if (activo) setError(err?.message || "No se pudo cargar la credencial.");
      } finally {
        if (activo) setCargando(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [inscripcionId]);

  const compartir = async () => {
    const url = window.location.href;
    const titulo = credencial ? `Credencial ${credencial.codigo}` : "Mi credencial";

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
        return;
      } catch {
        // el usuario canceló o no está disponible
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // sin acceso al portapapeles
    }
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <header className="border-b border-line bg-surface print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            to="/credencial"
            className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary no-underline"
          >
            <ArrowLeft size={18} /> ENTRE PAÑUELOS
          </Link>
          <Link to="/inscripciones" className="text-[13px] font-semibold text-primary no-underline">
            Mis inscripciones
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:p-0">
        {cargando ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2 print:hidden">
            <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-ink-muted">Generando credencial…</p>
          </div>
        ) : error || !credencial ? (
          <div className="rounded-card border border-line bg-surface p-10 text-center shadow-sm2 print:hidden">
            <p className="mb-3 text-sm text-ink-muted">
              {error || "Credencial no disponible."}
            </p>
            <Link to="/credencial" className="text-sm font-semibold text-primary">
              Volver a mis credenciales
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end gap-2 print:hidden">
              <button
                onClick={compartir}
                className="inline-flex items-center gap-1.5 rounded-btn border border-line px-3.5 py-2 text-[13px] font-medium text-ink-muted transition hover:border-primary hover:text-primary"
              >
                <Share2 size={16} /> {copiado ? "Enlace copiado" : "Compartir"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-btn bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-primary-hover"
              >
                <Printer size={16} /> Imprimir
              </button>
            </div>

            <article className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-lg print:rounded-none print:border-2 print:border-ink print:shadow-none">
              <div className="bg-[linear-gradient(135deg,#A3152E_0%,#5E0C1B_60%,#3F0812_100%)] px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80">
                      Entre Pañuelos
                    </p>
                    <h1 className="mt-1 font-display text-2xl font-bold">Credencial Oficial</h1>
                    <p className="mt-1 text-[12px] opacity-90">{credencial.concursoNombre}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider opacity-75">Código</p>
                    <p className="font-mono text-sm font-semibold">{credencial.codigo}</p>
                  </div>
                </div>
              </div>

              <div className="border-b border-line bg-cream px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <p className="text-ink-muted">
                    Categoría: <strong className="text-ink">{credencial.categoriaNombre}</strong>
                  </p>
                  <p className="text-ink-muted">
                    {formatearFecha(credencial.fechaInicio)}
                    {credencial.fechaFin ? ` - ${formatearFecha(credencial.fechaFin)}` : ""}
                  </p>
                  <p className="text-ink-muted">{credencial.concursoLugar}</p>
                </div>
              </div>

              <div className="px-6 py-7">
                <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
                  <FotoBailarin
                    nombre={credencial.solicitante.nombre}
                    apellido={credencial.solicitante.apellido}
                    foto={credencial.solicitante.fotografiaUrl}
                  />

                  <div className="flex flex-col items-center">
                    <span className="font-display text-3xl text-accent">&</span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                      Pareja de baile
                    </span>
                  </div>

                  <FotoBailarin
                    nombre={credencial.pareja.nombre}
                    apellido={credencial.pareja.apellido}
                    foto={credencial.pareja.fotografiaUrl}
                  />
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 border-t border-line pt-5 text-[12px] sm:grid-cols-2">
                  <p className="text-ink-muted">
                    DNI: <strong className="text-ink">{credencial.solicitante.dni}</strong>
                  </p>
                  <p className="text-ink-muted sm:text-right">
                    DNI: <strong className="text-ink">{credencial.pareja.dni}</strong>
                  </p>
                  <p className="text-ink-muted">
                    Ciudad: <strong className="text-ink">{credencial.solicitante.ciudad || "—"}</strong>
                  </p>
                  <p className="text-ink-muted sm:text-right">
                    Ciudad: <strong className="text-ink">{credencial.pareja.ciudad || "—"}</strong>
                  </p>
                </div>

                {credencial.completa ? (
                  <div className="mt-6 flex items-center justify-center gap-2 rounded-btn bg-[#EAF5EF] px-4 py-3 text-[12px] font-medium text-success">
                    <CheckCircle2 size={16} /> Credencial completa y lista para presentar.
                  </div>
                ) : (
                  <div className="mt-6 flex items-start gap-2 rounded-btn bg-[#FFF4E0] px-4 py-3 text-[12px] text-[#9A6B00]">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>
                      Falta la foto de: <strong>{credencial.faltantes.join(", ")}</strong>.
                      La credencial se muestra con iniciales hasta completar la fotografía.
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-line bg-cream px-6 py-3 text-center text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                Documento generado por Entre Pañuelos · {credencial.codigo}
              </div>
            </article>
          </>
        )}
      </main>
    </div>
  );
}
