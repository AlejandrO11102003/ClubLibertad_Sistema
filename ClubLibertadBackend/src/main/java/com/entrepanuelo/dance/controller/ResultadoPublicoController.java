package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.resultado.ResultadoResponse;
import com.entrepanuelo.dance.service.ResultadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Resultados", description = "Consulta de resultados publicados")
public class ResultadoPublicoController {

    private final ResultadoService resultadoService;

    @GetMapping("/concursos/{concursoId}/resultados")
    @Operation(summary = "Consultar los resultados publicados de un concurso")
    public ResponseEntity<ApiResponse<List<ResultadoResponse>>> porConcurso(
            @PathVariable Long concursoId) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Resultados obtenidos correctamente",
                resultadoService.listarPublicosPorConcurso(concursoId)));
    }

    @GetMapping("/resultados/mios")
    @Operation(summary = "Consultar el historial de resultados del usuario autenticado")
    public ResponseEntity<ApiResponse<List<ResultadoResponse>>> mios(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Historial obtenido correctamente",
                resultadoService.listarMios(authentication.getName())));
    }
}
