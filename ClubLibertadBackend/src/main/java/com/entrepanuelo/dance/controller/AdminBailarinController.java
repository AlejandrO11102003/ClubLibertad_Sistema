package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.admin.ActivarCuentaRequest;
import com.entrepanuelo.dance.dto.admin.AdminBailarinResponse;
import com.entrepanuelo.dance.service.AdminBailarinService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bailarines")
@RequiredArgsConstructor
@Tag(name = "Administración de bailarines", description = "Consulta y activación de cuentas")
public class AdminBailarinController {

    private final AdminBailarinService adminBailarinService;

    @GetMapping
    @Operation(summary = "Listar bailarines con filtros")
    public ResponseEntity<ApiResponse<List<AdminBailarinResponse>>> listar(
            @RequestParam(required = false) String texto,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String categoria) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Bailarines obtenidos correctamente",
                adminBailarinService.listar(texto, activo, categoria)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un bailarín por su id")
    public ResponseEntity<ApiResponse<AdminBailarinResponse>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Bailarín obtenido correctamente",
                adminBailarinService.obtener(id)));
    }

    @PatchMapping("/{id}/activo")
    @Operation(summary = "Activar o desactivar la cuenta de un bailarín")
    public ResponseEntity<ApiResponse<AdminBailarinResponse>> cambiarActivo(
            @PathVariable Long id,
            @Valid @RequestBody ActivarCuentaRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                request.getActivo() ? "Cuenta activada correctamente" : "Cuenta desactivada correctamente",
                adminBailarinService.cambiarActivo(
                        authentication.getName(), id, request.getActivo())));
    }
}
