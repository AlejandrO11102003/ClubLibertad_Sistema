package com.entrepanuelo.dance.dto.resultado;

import com.entrepanuelo.dance.entity.Resultado;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.EtapaResultado;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultadoResponse {

    private Long id;
    private Long concursoId;
    private String concursoNombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Long categoriaId;
    private String categoriaNombre;
    private Long inscripcionId;
    private Long solicitanteId;
    private String solicitanteNombre;
    private Long parejaId;
    private String parejaNombre;
    private Integer posicion;
    private EtapaResultado etapa;
    private BigDecimal puntaje;
    private Boolean publicado;

    public static ResultadoResponse from(Resultado r) {
        return ResultadoResponse.builder()
                .id(r.getId())
                .concursoId(r.getConcurso().getId())
                .concursoNombre(r.getConcurso().getNombre())
                .fechaInicio(r.getConcurso().getFechaInicio())
                .fechaFin(r.getConcurso().getFechaFin())
                .categoriaId(r.getCategoria().getId())
                .categoriaNombre(r.getCategoria().getNombre())
                .inscripcionId(r.getInscripcion().getId())
                .solicitanteId(r.getInscripcion().getSolicitante().getId())
                .solicitanteNombre(nombreCompleto(r.getInscripcion().getSolicitante()))
                .parejaId(r.getInscripcion().getPareja().getId())
                .parejaNombre(nombreCompleto(r.getInscripcion().getPareja()))
                .posicion(r.getPosicion())
                .etapa(r.getEtapa())
                .puntaje(r.getPuntaje())
                .publicado(r.getPublicado())
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
