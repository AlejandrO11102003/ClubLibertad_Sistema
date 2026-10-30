package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.inscripcion.InscripcionRequest;
import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.service.InscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscripciones")
@RequiredArgsConstructor
@Tag(name = "Inscripciones", description = "Solicitudes de inscripción con pareja")
public class InscripcionController {

    private final InscripcionService inscripcionService;

    @PostMapping
    @Operation(summary = "Enviar una solicitud de inscripción a una pareja")
    public ResponseEntity<ApiResponse<InscripcionResponse>> crear(
            @Valid @RequestBody InscripcionRequest request,
            Authentication authentication) {

        InscripcionResponse inscripcion =
                inscripcionService.crear(authentication.getName(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Solicitud enviada correctamente", inscripcion));
    }

    @GetMapping("/mias")
    @Operation(summary = "Listar las inscripciones del usuario autenticado")
    public ResponseEntity<ApiResponse<List<InscripcionResponse>>> mias(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Inscripciones obtenidas correctamente",
                inscripcionService.listarMias(authentication.getName())));
    }

    @GetMapping("/pendientes")
    @Operation(summary = "Listar las solicitudes pendientes de respuesta")
    public ResponseEntity<ApiResponse<List<InscripcionResponse>>> pendientes(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Solicitudes pendientes obtenidas correctamente",
                inscripcionService.listarPendientes(authentication.getName())));
    }

    @PostMapping("/{id}/aceptar")
    @Operation(summary = "Aceptar una solicitud de pareja")
    public ResponseEntity<ApiResponse<InscripcionResponse>> aceptar(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Solicitud aceptada correctamente",
                inscripcionService.aceptar(authentication.getName(), id)));
    }

    @PostMapping("/{id}/rechazar")
    @Operation(summary = "Rechazar una solicitud de pareja")
    public ResponseEntity<ApiResponse<InscripcionResponse>> rechazar(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Solicitud rechazada correctamente",
                inscripcionService.rechazar(authentication.getName(), id)));
    }
}
