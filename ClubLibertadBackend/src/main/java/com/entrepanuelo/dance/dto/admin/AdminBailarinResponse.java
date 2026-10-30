package com.entrepanuelo.dance.dto.admin;

import com.entrepanuelo.dance.entity.Perfil;
import com.entrepanuelo.dance.entity.Usuario;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBailarinResponse {

    private Long id;
    private String dni;          // ← enmascarado
    private String nombre;
    private String apellido;
    private String ciudad;
    private String categoria;
    private String academiaActual;
    private BigDecimal nivelEstrellas;
    private Boolean activo;
    private long totalInscripciones;
    private long totalResultados;
    private LocalDateTime createdAt;

    public static AdminBailarinResponse from(Usuario u,
                                             long totalInscripciones,
                                             long totalResultados) {
        Perfil p = u.getPerfil();

        String dniMask = u.getDni() != null
                ? "****" + u.getDni().substring(4)
                : null;

        return AdminBailarinResponse.builder()
                .id(u.getId())
                .dni(dniMask)
                .nombre(p != null ? p.getNombre() : null)
                .apellido(p != null ? p.getApellido() : null)
                .ciudad(p != null ? p.getCiudad() : null)
                .categoria(p != null ? p.getCategoria() : null)
                .academiaActual(p != null ? p.getAcademiaActual() : null)
                .nivelEstrellas(p != null ? p.getNivelEstrellas() : null)
                .activo(u.getActivo())
                .totalInscripciones(totalInscripciones)
                .totalResultados(totalResultados)
                .createdAt(u.getCreatedAt())
                .build();
    }
}
