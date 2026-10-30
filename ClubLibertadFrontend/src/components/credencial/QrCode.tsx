import { useMemo } from "react";
import { generarQr, NivelCorreccion } from "../../utils/qr";

interface Props {
  valor: string;
  /** Tamaño en píxeles del lado del QR. */
  tamano?: number;
  correccion?: NivelCorreccion;
  className?: string;
  etiqueta?: string;
}

export default function QrCode({
  valor,
  tamano = 168,
  correccion = "MEDIUM",
  className = "",
  etiqueta = "Código QR de la credencial",
}: Props) {
  const qr = useMemo(() => {
    try {
      return generarQr(valor, { correccion });
    } catch {
      return null;
    }
  }, [valor, correccion]);

  if (!qr) return null;

  return (
    <svg
      viewBox={`0 0 ${qr.size} ${qr.size}`}
      width={tamano}
      height={tamano}
      role="img"
      aria-label={etiqueta}
      className={className}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      <title>{etiqueta}</title>
      <rect width={qr.size} height={qr.size} fill="#ffffff" />
      <path d={qr.path} fill="#111111" shapeRendering="crispEdges" />
    </svg>
  );
}
