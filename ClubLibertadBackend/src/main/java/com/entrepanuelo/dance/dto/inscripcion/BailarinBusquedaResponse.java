package com.entrepanuelo.dance.dto.inscripcion;

import com.entrepanuelo.dance.entity.Usuario;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BailarinBusquedaResponse {

    private String dni;          // ← enmascarado
    private String nombre;
    private String apellido;
    private String categoria;
    private String ciudad;
    private String fotografiaUrl;

    public static BailarinBusquedaResponse from(Usuario u) {
        String dniMask = u.getDni() != null
                ? "****" + u.getDni().substring(4)
                : null;

        return BailarinBusquedaResponse.builder()
                .dni(dniMask)
                .nombre(u.getPerfil() != null ? u.getPerfil().getNombre() : null)
                .apellido(u.getPerfil() != null ? u.getPerfil().getApellido() : null)
                .categoria(u.getPerfil() != null ? u.getPerfil().getCategoria() : null)
                .ciudad(u.getPerfil() != null ? u.getPerfil().getCiudad() : null)
                .fotografiaUrl(u.getPerfil() != null ? u.getPerfil().getFotografiaUrl() : null)
                .build();
    }
}
