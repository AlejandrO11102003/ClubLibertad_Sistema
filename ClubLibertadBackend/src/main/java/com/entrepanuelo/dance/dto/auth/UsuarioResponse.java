package com.entrepanuelo.dance.dto.auth;


import com.entrepanuelo.dance.entity.Perfil;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponse {

    private Long id;
    private String dni;          // ← enmascarado (****1234)
    private TipoDocumento tipoDocumento;
    private Integer anioNacimiento;
    private Rol rol;

    // Datos del perfil privado
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String ciudad;
    private String genero;
    private String categoria;
    private String academiaActual;
    private Integer anioInicio;
    private String marineraFavorita;
    private String biografia;
    private String fotografiaUrl;

    public static UsuarioResponse from(Usuario u) {
        String dniMask = u.getDni() != null
                ? "****" + u.getDni().substring(4)
                : null;

        UsuarioResponseBuilder b = UsuarioResponse.builder()
                .id(u.getId())
                .dni(dniMask)
                .tipoDocumento(u.getTipoDocumento())
                .anioNacimiento(u.getAnioNacimiento())
                .rol(u.getRol());

        Perfil p = u.getPerfil();
        if (p != null) {
            b.nombre(p.getNombre())
             .apellido(p.getApellido())
             .email(p.getEmail())
             .telefono(p.getTelefono())
             .ciudad(p.getCiudad())
             .genero(p.getGenero())
             .categoria(p.getCategoria())
             .academiaActual(p.getAcademiaActual())
             .anioInicio(p.getAnioInicio())
             .marineraFavorita(p.getMarineraFavorita())
             .biografia(p.getBiografia())
             .fotografiaUrl(p.getFotografiaUrl());
        }

        return b.build();
    }
}
