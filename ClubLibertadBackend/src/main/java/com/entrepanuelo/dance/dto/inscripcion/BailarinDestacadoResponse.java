package com.entrepanuelo.dance.dto.inscripcion;

import com.entrepanuelo.dance.entity.Perfil;
import com.entrepanuelo.dance.entity.Usuario;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BailarinDestacadoResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String ciudad;
    private String categoria;
    private String fotografiaUrl;
    private BigDecimal nivelEstrellas;
    private Integer totalPrimeros;
    private Integer totalParticipaciones;

    public static BailarinDestacadoResponse from(Usuario u) {
        Perfil p = u.getPerfil();

        return BailarinDestacadoResponse.builder()
                .id(u.getId())
                .nombre(p != null ? p.getNombre() : null)
                .apellido(p != null ? p.getApellido() : null)
                .ciudad(p != null ? p.getCiudad() : null)
                .categoria(p != null ? p.getCategoria() : null)
                .fotografiaUrl(p != null ? p.getFotografiaUrl() : null)
                .nivelEstrellas(p != null ? p.getNivelEstrellas() : null)
                .totalPrimeros(p != null ? p.getTotalPrimeros() : 0)
                .totalParticipaciones(p != null ? p.getTotalParticipaciones() : 0)
                .build();
    }
}
