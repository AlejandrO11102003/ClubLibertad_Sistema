import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Anuncio, resolverImagen } from "../../services/api";

const DURACION_MS = 6000;

interface Props {
  anuncios: Anuncio[];
}

const esEnlaceExterno = (enlace?: string) =>
  Boolean(enlace && /^https?:\/\//i.test(enlace));

export default function AnuncioCarrusel({ anuncios }: Props) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [fallidas, setFallidas] = useState<Record<number, boolean>>({});
  const inicioToque = useRef<number | null>(null);
  const total = anuncios.length;

  const ir = useCallback(
    (destino: number) => {
      if (total === 0) return;
      setIndice(((destino % total) + total) % total);
    },
    [total]
  );

  useEffect(() => {
    setIndice(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || pausado) return;

    const sinMovimiento =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (sinMovimiento) return;

    const temporizador = window.setInterval(() => {
      if (document.hidden) return;
      setIndice((actual) => (actual + 1) % total);
    }, DURACION_MS);

    return () => window.clearInterval(temporizador);
  }, [total, pausado]);

  if (total === 0) return null;

  const alPresionarTecla = (evento: React.KeyboardEvent<HTMLDivElement>) => {
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      ir(indice + 1);
    }

    if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      ir(indice - 1);
    }
  };

  const alTerminarToque = (evento: React.TouchEvent<HTMLDivElement>) => {
    if (inicioToque.current === null) return;

    const distancia = evento.changedTouches[0].clientX - inicioToque.current;
    inicioToque.current = null;

    if (Math.abs(distancia) < 45) return;
    ir(indice + (distancia < 0 ? 1 : -1));
  };

  return (
    <div
      className="ad-carousel"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Publicidad"
      tabIndex={0}
      onKeyDown={alPresionarTecla}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onTouchStart={(evento) => {
        inicioToque.current = evento.touches[0].clientX;
        setPausado(true);
      }}
      onTouchEnd={(evento) => {
        alTerminarToque(evento);
        setPausado(false);
      }}
    >
      <div className="ad-viewport">
        {anuncios.map((anuncio, posicion) => {
          const activa = posicion === indice;
          const imagenVisible = !fallidas[anuncio.id];
          const iniciales =
            `${anuncio.entidad?.[0] || anuncio.titulo?.[0] || "P"}`.toUpperCase();

          const contenido = (
            <>
              {imagenVisible ? (
                <img
                  src={resolverImagen(anuncio.imagenUrl)}
                  alt={anuncio.titulo}
                  loading={posicion === 0 ? "eager" : "lazy"}
                  onError={() =>
                    setFallidas((previas) => ({ ...previas, [anuncio.id]: true }))
                  }
                />
              ) : (
                <div className="ad-fallback" aria-hidden="true">
                  <span>{iniciales}</span>
                </div>
              )}

              <span className="ad-tag">Publicidad</span>

              <div className="ad-overlay">
                {anuncio.entidad && <p className="ad-entity">{anuncio.entidad}</p>}
                <h3 className="ad-title">{anuncio.titulo}</h3>

                {anuncio.enlaceUrl && (
                  <span className="ad-cta">
                    Ver más <ArrowRight size={14} />
                  </span>
                )}
              </div>
            </>
          );

          return (
            <div
              key={anuncio.id}
              className={`ad-slide ${activa ? "is-active" : ""}`}
              aria-hidden={!activa}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${posicion + 1} de ${total}`}
            >
              {anuncio.enlaceUrl ? (
                esEnlaceExterno(anuncio.enlaceUrl) ? (
                  <a
                    className="ad-link"
                    href={anuncio.enlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={activa ? 0 : -1}
                  >
                    {contenido}
                  </a>
                ) : (
                  <Link
                    className="ad-link"
                    to={anuncio.enlaceUrl}
                    tabIndex={activa ? 0 : -1}
                  >
                    {contenido}
                  </Link>
                )
              ) : (
                <div className="ad-link">{contenido}</div>
              )}
            </div>
          );
        })}

        {total > 1 && (
          <>
            <button
              type="button"
              className="ad-arrow ad-arrow-prev"
              onClick={() => ir(indice - 1)}
              aria-label="Anuncio anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="ad-arrow ad-arrow-next"
              onClick={() => ir(indice + 1)}
              aria-label="Anuncio siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="ad-dots" role="tablist" aria-label="Seleccionar anuncio">
          {anuncios.map((anuncio, posicion) => (
            <button
              key={anuncio.id}
              type="button"
              role="tab"
              aria-selected={posicion === indice}
              aria-label={`Ir al anuncio ${posicion + 1}`}
              className={`ad-dot ${posicion === indice ? "is-active" : ""}`}
              onClick={() => ir(posicion)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
