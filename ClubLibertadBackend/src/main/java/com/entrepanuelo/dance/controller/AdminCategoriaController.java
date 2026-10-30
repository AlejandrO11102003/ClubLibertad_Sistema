package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.admin.ActivarCategoriaRequest;
import com.entrepanuelo.dance.dto.admin.CategoriaRequest;
import com.entrepanuelo.dance.dto.concurso.CategoriaResponse;
import com.entrepanuelo.dance.service.AdminCategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categorias")
@RequiredArgsConstructor
@Tag(name = "Administración de categorías", description = "CRUD y activación de categorías")
public class AdminCategoriaController {

    private final AdminCategoriaService adminCategoriaService;

    @GetMapping
    @Operation(summary = "Listar todas las categorías, incluidas las inactivas")
    public ResponseEntity<ApiResponse<List<CategoriaResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(
                "Categorías obtenidas correctamente",
                adminCategoriaService.listarTodas()));
    }

    @PostMapping
    @Operation(summary = "Crear una categoría")
    public ResponseEntity<ApiResponse<CategoriaResponse>> crear(
            @Valid @RequestBody CategoriaRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Categoría creada correctamente",
                        adminCategoriaService.crear(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una categoría")
    public ResponseEntity<ApiResponse<CategoriaResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Categoría actualizada correctamente",
                adminCategoriaService.actualizar(id, request)));
    }

    @PatchMapping("/{id}/activa")
    @Operation(summary = "Activar o desactivar una categoría")
    public ResponseEntity<ApiResponse<CategoriaResponse>> cambiarActiva(
            @PathVariable Long id,
            @Valid @RequestBody ActivarCategoriaRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                request.getActiva()
                        ? "Categoría activada correctamente"
                        : "Categoría desactivada correctamente",
                adminCategoriaService.cambiarActiva(id, request.getActiva())));
    }
}
