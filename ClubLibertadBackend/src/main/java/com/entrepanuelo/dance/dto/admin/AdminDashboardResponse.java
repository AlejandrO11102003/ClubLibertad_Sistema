package com.entrepanuelo.dance.dto.admin;

import com.entrepanuelo.dance.dto.concurso.ConcursoResponse;
import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.dto.resultado.ImportacionResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long bailarinesRegistrados;
    private long concursosTotal;
    private long concursosPublicados;
    private long concursosCerrados;
    private long inscripcionesTotal;
    private long inscripcionesPendientes;
    private long inscripcionesConfirmadas;
    private long resultadosPublicados;
    private long categoriasTotal;

    private List<InscripcionResponse> inscripcionesRecientes;
    private List<ConcursoResponse> proximosConcursos;
    private List<ImportacionResponse> ultimasImportaciones;
}
