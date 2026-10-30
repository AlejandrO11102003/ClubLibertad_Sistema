import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, QrCode as QrIcon, X } from "lucide-react";
import { Credencial } from "../../services/api";
import { contenidoQrCredencial } from "../../utils/qr";
import CredencialDocumento from "./CredencialDocumento";
import QrCode from "./QrCode";

interface Props {
  credencial: Credencial;
  onClose: () => void;
}

export default function CredencialModal({ credencial, onClose }: Props) {
  const [copiado, setCopiado] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const urlCredencial = `${window.location.origin}/credencial/${credencial.inscripcionId}`;

  const valorQr = contenidoQrCredencial({
    codigo: credencial.codigo,
    concursoNombre: credencial.concursoNombre,
    categoriaNombre: credencial.categoriaNombre,
    solicitante: `${credencial.solicitante.nombre || ""} ${
      credencial.solicitante.apellido || ""
    }`.trim(),
    pareja: `${credencial.pareja.nombre || ""} ${credencial.pareja.apellido || ""}`.trim(),
  });

  useEffect(() => {
    const alPresionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alPresionarTecla);
    cerrarRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", alPresionarTecla);
    };
  }, [onClose]);

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlCredencial);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // sin acceso al portapapeles
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credencial-modal-titulo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div className="relative my-auto w-full max-w-5xl overflow-hidden rounded-[20px] border border-line bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush text-primary">
              <QrIcon size={19} />
            </span>
            <div>
              <h2
                id="credencial-modal-titulo"
                className="font-display text-lg font-bold text-ink sm:text-xl"
              >
                Mi credencial digital
              </h2>
              <p className="text-[12px] text-ink-muted">
                {credencial.concursoNombre} ·{" "}
                <span className="font-mono">{credencial.codigo}</span>
              </p>
            </div>
          </div>

          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar credencial"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-primary hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="order-2 lg:order-1">
              <CredencialDocumento credencial={credencial} className="shadow-sm2" />
            </div>

            <aside className="order-1 flex flex-col gap-4 lg:order-2">
              <div className="rounded-card border border-line bg-cream p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                  Código QR
                </p>

                <div className="mx-auto mt-3 w-fit rounded-xl border border-line bg-white p-2 shadow-sm2">
                  <QrCode
                    valor={valorQr}
                    tamano={190}
                    etiqueta={`Código QR de la credencial ${credencial.codigo}`}
                  />
                </div>

                <p className="mt-3 font-mono text-[13px] font-semibold tracking-wide text-ink">
                  {credencial.codigo}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                  Escanéalo para verificar el código, el concurso y la pareja.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="inline-flex items-center justify-center gap-2 rounded-btn border border-line px-3.5 py-2.5 text-[13px] font-medium text-ink-muted transition hover:border-primary hover:text-primary"
                >
                  {copiado ? <Check size={16} /> : <Copy size={16} />}
                  {copiado ? "Enlace copiado" : "Copiar enlace"}
                </button>

                <a
                  href={`/credencial/${credencial.inscripcionId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-white no-underline transition hover:bg-primary-hover"
                >
                  <ExternalLink size={16} /> Abrir página completa
                </a>
              </div>

              <p className="rounded-btn bg-cream px-3 py-2.5 text-[11px] leading-snug text-ink-muted">
                Presenta este QR junto con tu DNI el día del concurso.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
