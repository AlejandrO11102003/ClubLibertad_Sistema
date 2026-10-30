package com.entrepanuelo.dance.dto.inscripcion;

import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscripcionResponse {

    private Long id;
    private Long concursoId;
    private String concursoNombre;
    private Long categoriaId;
    private String categoriaNombre;
    private Long solicitanteId;
    private String solicitanteNombre;
    private Long parejaId;
    private String parejaNombre;
    private EstadoInscripcion estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaRespuesta;
    private LocalDateTime fechaVencimiento;

    public static InscripcionResponse from(Inscripcion i) {
        return InscripcionResponse.builder()
                .id(i.getId())
                .concursoId(i.getConcurso().getId())
                .concursoNombre(i.getConcurso().getNombre())
                .categoriaId(i.getCategoria().getId())
                .categoriaNombre(i.getCategoria().getNombre())
                .solicitanteId(i.getSolicitante().getId())
                .solicitanteNombre(nombreCompleto(i.getSolicitante()))
                .parejaId(i.getPareja().getId())
                .parejaNombre(nombreCompleto(i.getPareja()))
                .estado(i.getEstado())
                .fechaSolicitud(i.getFechaSolicitud())
                .fechaRespuesta(i.getFechaRespuesta())
                .fechaVencimiento(i.getFechaVencimiento())
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
