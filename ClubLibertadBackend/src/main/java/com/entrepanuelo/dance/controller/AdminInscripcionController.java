package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import com.entrepanuelo.dance.service.AdminInscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inscripciones")
@RequiredArgsConstructor
@Tag(name = "Administración de inscripciones", description = "Supervisión de inscripciones")
public class AdminInscripcionController {

    private final AdminInscripcionService adminInscripcionService;

    @GetMapping
    @Operation(summary = "Listar inscripciones con filtros")
    public ResponseEntity<ApiResponse<List<InscripcionResponse>>> listar(
            @RequestParam(required = false) Long concursoId,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) EstadoInscripcion estado,
            @RequestParam(required = false) String texto) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Inscripciones obtenidas correctamente",
                adminInscripcionService.listar(concursoId, categoriaId, estado, texto)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una inscripción por su id")
    public ResponseEntity<ApiResponse<InscripcionResponse>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Inscripción obtenida correctamente",
                adminInscripcionService.obtener(id)));
    }

    @GetMapping("/{concursoId}/exportar")
    @Operation(summary = "Exportar inscripciones de un concurso a Excel")
    public ResponseEntity<byte[]> exportar(@PathVariable Long concursoId) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"inscripciones-concurso-" + concursoId + ".xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(adminInscripcionService.exportar(concursoId));
    }
}
