package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.concurso.ConcursoResponse;
import com.entrepanuelo.dance.service.ConcursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/concursos")
@RequiredArgsConstructor
@Tag(name = "Concursos", description = "Consulta pública de concursos publicados")
public class ConcursoController {

    private final ConcursoService concursoService;

    @GetMapping
    @Operation(summary = "Listar concursos publicados y cerrados")
    public ResponseEntity<ApiResponse<List<ConcursoResponse>>> listar() {
        return ResponseEntity.ok(
                ApiResponse.ok("Concursos obtenidos correctamente", concursoService.listarPublicos()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un concurso publicado por su id")
    public ResponseEntity<ApiResponse<ConcursoResponse>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Concurso obtenido correctamente", concursoService.obtenerPublico(id)));
    }
}
