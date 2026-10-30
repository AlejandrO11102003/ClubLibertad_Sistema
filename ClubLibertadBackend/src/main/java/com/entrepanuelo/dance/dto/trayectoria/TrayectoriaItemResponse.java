package com.entrepanuelo.dance.dto.trayectoria;

import com.entrepanuelo.dance.entity.Resultado;
import com.entrepanuelo.dance.entity.Usuario;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrayectoriaItemResponse {

    private Long concursoId;
    private String concursoNombre;
    private LocalDate fechaInicio;
    private Long categoriaId;
    private String categoriaNombre;
    private Integer posicion;
    private BigDecimal puntaje;
    private Long parejaId;
    private String parejaNombre;

    public static TrayectoriaItemResponse from(Resultado r, Long usuarioId) {
        Usuario pareja = r.getInscripcion().getSolicitante().getId().equals(usuarioId)
                ? r.getInscripcion().getPareja()
                : r.getInscripcion().getSolicitante();

        return TrayectoriaItemResponse.builder()
                .concursoId(r.getConcurso().getId())
                .concursoNombre(r.getConcurso().getNombre())
                .fechaInicio(r.getConcurso().getFechaInicio())
                .categoriaId(r.getCategoria().getId())
                .categoriaNombre(r.getCategoria().getNombre())
                .posicion(r.getPosicion())
                .puntaje(r.getPuntaje())
                .parejaId(pareja.getId())
                .parejaNombre(nombreCompleto(pareja))
                .build();
    }

    private static String nombreCompleto(Usuario u) {
        if (u.getPerfil() == null) {
            return "Bailarín";
        }

        String nombre = u.getPerfil().getNombre() != null ? u.getPerfil().getNombre() : "";
        String apellido = u.getPerfil().getApellido() != null ? u.getPerfil().getApellido() : "";
        String completo = (nombre + " " + apellido).trim();

        return completo.isEmpty() ? "Bailarín" : completo;
    }
}
