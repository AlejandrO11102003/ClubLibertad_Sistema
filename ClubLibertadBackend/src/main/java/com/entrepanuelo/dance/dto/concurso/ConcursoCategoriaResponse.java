package com.entrepanuelo.dance.dto.concurso;

import com.entrepanuelo.dance.entity.ConcursoCategoria;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcursoCategoriaResponse {

    private Long id;
    private Long categoriaId;
    private String nombre;
    private Integer edadMin;
    private Integer edadMax;
    private String genero;
    private Integer cupo;
    private BigDecimal precio;

    public static ConcursoCategoriaResponse from(ConcursoCategoria cc) {
        return ConcursoCategoriaResponse.builder()
                .id(cc.getId())
                .categoriaId(cc.getCategoria().getId())
                .nombre(cc.getCategoria().getNombre())
                .edadMin(cc.getCategoria().getEdadMin())
                .edadMax(cc.getCategoria().getEdadMax())
                .genero(cc.getCategoria().getGenero())
                .cupo(cc.getCupo())
                .precio(cc.getPrecio())
                .build();
    }
}
