package com.entrepanuelo.dance.dto.concurso;

import com.entrepanuelo.dance.entity.Concurso;
import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcursoResponse {

    private Long id;
    private String nombre;
    private String bannerUrl;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String lugar;
    private EstadoConcurso estado;
    private List<ConcursoCategoriaResponse> categorias;
    private LocalDateTime createdAt;

    public static ConcursoResponse from(Concurso c) {
        return ConcursoResponse.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .bannerUrl(c.getBannerUrl())
                .fechaInicio(c.getFechaInicio())
                .fechaFin(c.getFechaFin())
                .lugar(c.getLugar())
                .estado(c.getEstado())
                .categorias(c.getCategorias().stream()
                        .map(ConcursoCategoriaResponse::from)
                        .toList())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
