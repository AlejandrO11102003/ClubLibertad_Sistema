import { qrcodegen } from "../vendor/qrcodegen";

export type NivelCorreccion = "LOW" | "MEDIUM" | "QUARTILE" | "HIGH";

export interface QrGenerado {
  /** Tamaño total en módulos, incluyendo el margen blanco. */
  size: number;
  /** Trazado SVG con todos los módulos oscuros, en unidades de módulo. */
  path: string;
}

/**
 * Genera un código QR (modo texto/bytes) y devuelve el trazado SVG.
 * No requiere conexión ni librerías externas en tiempo de ejecución.
 */
export function generarQr(
  texto: string,
  opciones: { borde?: number; correccion?: NivelCorreccion } = {}
): QrGenerado {
  const borde = opciones.borde ?? 3;

  const niveles: Record<NivelCorreccion, qrcodegen.QrCode.Ecc> = {
    LOW: qrcodegen.QrCode.Ecc.LOW,
    MEDIUM: qrcodegen.QrCode.Ecc.MEDIUM,
    QUARTILE: qrcodegen.QrCode.Ecc.QUARTILE,
    HIGH: qrcodegen.QrCode.Ecc.HIGH,
  };

  const qr = qrcodegen.QrCode.encodeText(
    texto,
    niveles[opciones.correccion ?? "MEDIUM"]
  );

  const size = qr.size + borde * 2;
  const partes: string[] = [];

  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        partes.push(`M${x + borde},${y + borde}h1v1h-1z`);
      }
    }
  }

  return { size, path: partes.join("") };
}

/** Contenido que se codifica dentro del QR de una credencial. */
export function contenidoQrCredencial(datos: {
  codigo: string;
  concursoNombre: string;
  categoriaNombre: string;
  solicitante: string;
  pareja: string;
}): string {
  return [
    "ENTRE PAÑUELOS - CREDENCIAL OFICIAL",
    `Codigo: ${datos.codigo}`,
    `Concurso: ${datos.concursoNombre}`,
    `Categoria: ${datos.categoriaNombre}`,
    `Pareja: ${datos.solicitante} y ${datos.pareja}`,
  ].join("\n");
}
