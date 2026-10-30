package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.trayectoria.PerfilPublicoResponse;
import com.entrepanuelo.dance.service.TrayectoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trayectoria")
@RequiredArgsConstructor
@Tag(name = "Trayectoria", description = "Trayectoria y nivel competitivo del bailarín")
public class TrayectoriaController {

    private final TrayectoriaService trayectoriaService;

    @GetMapping("/mia")
    @Operation(summary = "Obtener mi trayectoria y nivel competitivo")
    public ResponseEntity<ApiResponse<PerfilPublicoResponse>> mia(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Trayectoria obtenida correctamente",
                trayectoriaService.obtenerMia(authentication.getName())));
    }
}
