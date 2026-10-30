import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Credencial } from "../../services/api";

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
          className="h-20 w-20 rounded-full border-[3px] border-accent object-cover sm:h-24 sm:w-24"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-accent bg-primary text-xl font-semibold text-white sm:h-24 sm:w-24">
          {iniciales}
        </div>
      )}

      <p className="mt-2 text-center text-sm font-bold text-ink">
        {nombre} {apellido}
      </p>
    </div>
  );
}

interface Props {
  credencial: Credencial;
  className?: string;
}

export default function CredencialDocumento({ credencial, className = "" }: Props) {
  return (
    <article
      className={`overflow-hidden rounded-[18px] border border-line bg-surface shadow-lg print:rounded-none print:border-2 print:border-ink print:shadow-none ${className}`}
    >
      <div className="bg-[linear-gradient(135deg,#A3152E_0%,#5E0C1B_60%,#3F0812_100%)] px-6 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80">
              Entre Pañuelos
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">Credencial Oficial</h2>
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

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
          <FotoBailarin
            nombre={credencial.solicitante.nombre}
            apellido={credencial.solicitante.apellido}
            foto={credencial.solicitante.fotografiaUrl}
          />

          <div className="flex flex-col items-center">
            <span className="font-display text-3xl text-accent">&amp;</span>
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

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-line pt-4 text-[12px] sm:grid-cols-2">
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
          <div className="mt-5 flex items-center justify-center gap-2 rounded-btn bg-[#EAF5EF] px-4 py-3 text-[12px] font-medium text-success">
            <CheckCircle2 size={16} /> Credencial completa y lista para presentar.
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-2 rounded-btn bg-[#FFF4E0] px-4 py-3 text-[12px] text-[#9A6B00]">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              Falta la foto de: <strong>{credencial.faltantes.join(", ")}</strong>. La credencial
              se muestra con iniciales hasta completar la fotografía.
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-line bg-cream px-6 py-3 text-center text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        Documento generado por Entre Pañuelos · {credencial.codigo}
      </div>
    </article>
  );
}
