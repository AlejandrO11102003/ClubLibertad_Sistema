package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.credencial.CredencialResponse;
import com.entrepanuelo.dance.service.CredencialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credenciales")
@RequiredArgsConstructor
@Tag(name = "Credenciales", description = "Credencial digital de inscripciones confirmadas")
public class CredencialController {

    private final CredencialService credencialService;

    @GetMapping
    @Operation(summary = "Listar las credenciales de mis inscripciones confirmadas")
    public ResponseEntity<ApiResponse<List<CredencialResponse>>> listar(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Credenciales obtenidas correctamente",
                credencialService.listar(authentication.getName())));
    }

    @GetMapping("/{inscripcionId}")
    @Operation(summary = "Obtener la credencial de una inscripción confirmada")
    public ResponseEntity<ApiResponse<CredencialResponse>> obtener(
            @PathVariable Long inscripcionId,
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Credencial obtenida correctamente",
                credencialService.obtener(authentication.getName(), inscripcionId)));
    }
}
