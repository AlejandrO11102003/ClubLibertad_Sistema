import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Share2 } from "lucide-react";
import { Credencial as CredencialData, credencialesService } from "../services/api";
import CredencialDocumento from "../components/credencial/CredencialDocumento";

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

            <CredencialDocumento credencial={credencial} />
          </>
        )}
      </main>
    </div>
  );
}
