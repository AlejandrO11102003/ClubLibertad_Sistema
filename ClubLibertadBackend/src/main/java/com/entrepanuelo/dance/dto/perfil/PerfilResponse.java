package com.entrepanuelo.dance.dto.perfil;

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
public class PerfilResponse {

    private Long id;
    private Long usuarioId;
    private String dni;          // ← enmascarado (****1234)
    private TipoDocumento tipoDocumento;
    private Integer anioNacimiento;
    private Rol rol;

    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String ciudad;
    private String nacionalidad;
    private String genero;
    private String categoria;
    private String academiaActual;
    private Integer anioInicio;
    private String marineraFavorita;
    private String biografia;
    private String fotografiaUrl;

    public static PerfilResponse from(Usuario u, Perfil p) {
        String dniMask = u.getDni() != null
                ? "****" + u.getDni().substring(4)
                : null;

        return PerfilResponse.builder()
                .id(p != null ? p.getId() : null)
                .usuarioId(u.getId())
                .dni(dniMask)
                .tipoDocumento(u.getTipoDocumento())
                .anioNacimiento(u.getAnioNacimiento())
                .rol(u.getRol())
                .nombre(p != null ? p.getNombre() : null)
                .apellido(p != null ? p.getApellido() : null)
                .email(p != null ? p.getEmail() : null)
                .telefono(p != null ? p.getTelefono() : null)
                .ciudad(p != null ? p.getCiudad() : null)
                .nacionalidad(p != null ? p.getNacionalidad() : null)
                .genero(p != null ? p.getGenero() : null)
                .categoria(p != null ? p.getCategoria() : null)
                .academiaActual(p != null ? p.getAcademiaActual() : null)
                .anioInicio(p != null ? p.getAnioInicio() : null)
                .marineraFavorita(p != null ? p.getMarineraFavorita() : null)
                .biografia(p != null ? p.getBiografia() : null)
                .fotografiaUrl(p != null ? p.getFotografiaUrl() : null)
                .build();
    }
}
