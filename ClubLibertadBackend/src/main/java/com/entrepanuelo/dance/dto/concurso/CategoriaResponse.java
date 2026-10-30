package com.entrepanuelo.dance.dto.concurso;

import com.entrepanuelo.dance.entity.Categoria;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaResponse {

    private Long id;
    private String nombre;
    private Integer edadMin;
    private Integer edadMax;
    private String genero;
    private Boolean activa;

    public static CategoriaResponse from(Categoria c) {
        return CategoriaResponse.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .edadMin(c.getEdadMin())
                .edadMax(c.getEdadMax())
                .genero(c.getGenero())
                .activa(c.getActiva())
                .build();
    }
}
