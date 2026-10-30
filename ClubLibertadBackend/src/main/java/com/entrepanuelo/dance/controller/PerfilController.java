package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.perfil.PerfilRequest;
import com.entrepanuelo.dance.dto.perfil.PerfilResponse;
import com.entrepanuelo.dance.service.PerfilService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfil")
@RequiredArgsConstructor
@Tag(name = "Perfil", description = "Consulta y actualización del perfil del bailarín")
public class PerfilController {

    private final PerfilService perfilService;

    @GetMapping
    @Operation(summary = "Obtener el perfil del usuario autenticado")
    public ResponseEntity<ApiResponse<PerfilResponse>> obtener(Authentication authentication) {
        PerfilResponse perfil = perfilService.obtener(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Perfil obtenido correctamente", perfil));
    }

    @PutMapping
    @Operation(summary = "Actualizar el perfil del usuario autenticado")
    public ResponseEntity<ApiResponse<PerfilResponse>> actualizar(
            @Valid @RequestBody PerfilRequest request,
            Authentication authentication) {

        PerfilResponse perfil = perfilService.actualizar(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Perfil actualizado correctamente", perfil));
    }
}
