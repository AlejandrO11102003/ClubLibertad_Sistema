package com.entrepanuelo.dance.dto.credencial;

import com.entrepanuelo.dance.entity.Usuario;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CredencialBailarinResponse {

    private String nombre;
    private String apellido;
    private String dni;          // ← enmascarado
    private String ciudad;
    private String fotografiaUrl;

    public static CredencialBailarinResponse from(Usuario u) {
        String dniMask = u.getDni() != null
                ? "****" + u.getDni().substring(4)
                : null;

        return CredencialBailarinResponse.builder()
                .nombre(u.getPerfil() != null ? u.getPerfil().getNombre() : null)
                .apellido(u.getPerfil() != null ? u.getPerfil().getApellido() : null)
                .dni(dniMask)
                .ciudad(u.getPerfil() != null ? u.getPerfil().getCiudad() : null)
                .fotografiaUrl(u.getPerfil() != null ? u.getPerfil().getFotografiaUrl() : null)
                .build();
    }
}
