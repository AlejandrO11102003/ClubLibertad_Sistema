package com.entrepanuelo.dance.dto.anuncio;

import com.entrepanuelo.dance.entity.Anuncio;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnuncioResponse {

    private Long id;
    private String titulo;
    private String entidad;
    private String descripcion;
    private String imagenUrl;
    private String enlaceUrl;
    private Boolean activo;
    private Integer orden;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean vigente;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AnuncioResponse from(Anuncio anuncio, LocalDate hoy) {
        return AnuncioResponse.builder()
                .id(anuncio.getId())
                .titulo(anuncio.getTitulo())
                .entidad(anuncio.getEntidad())
                .descripcion(anuncio.getDescripcion())
                .imagenUrl(anuncio.getImagenUrl())
                .enlaceUrl(anuncio.getEnlaceUrl())
                .activo(anuncio.getActivo())
                .orden(anuncio.getOrden())
                .fechaInicio(anuncio.getFechaInicio())
                .fechaFin(anuncio.getFechaFin())
                .vigente(Boolean.TRUE.equals(anuncio.getActivo()) && anuncio.esVigente(hoy))
                .createdAt(anuncio.getCreatedAt())
                .updatedAt(anuncio.getUpdatedAt())
                .build();
    }
}
