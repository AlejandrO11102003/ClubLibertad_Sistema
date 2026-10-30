package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.concurso.ConcursoRequest;
import com.entrepanuelo.dance.dto.concurso.ConcursoResponse;
import com.entrepanuelo.dance.service.ConcursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/concursos")
@RequiredArgsConstructor
@Tag(name = "Administración de concursos", description = "CRUD de concursos para administradores")
public class AdminConcursoController {

    private final ConcursoService concursoService;

    @GetMapping
    @Operation(summary = "Listar todos los concursos, incluidos los borradores")
    public ResponseEntity<ApiResponse<List<ConcursoResponse>>> listar() {
        return ResponseEntity.ok(
                ApiResponse.ok("Concursos obtenidos correctamente", concursoService.listarTodos()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un concurso por su id")
    public ResponseEntity<ApiResponse<ConcursoResponse>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Concurso obtenido correctamente", concursoService.obtener(id)));
    }

    @PostMapping
    @Operation(summary = "Crear un concurso")
    public ResponseEntity<ApiResponse<ConcursoResponse>> crear(
            @Valid @RequestBody ConcursoRequest request) {

        ConcursoResponse concurso = concursoService.crear(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Concurso creado correctamente", concurso));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un concurso")
    public ResponseEntity<ApiResponse<ConcursoResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ConcursoRequest request) {

        ConcursoResponse concurso = concursoService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Concurso actualizado correctamente", concurso));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un concurso")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        concursoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Concurso eliminado correctamente", null));
    }
}
