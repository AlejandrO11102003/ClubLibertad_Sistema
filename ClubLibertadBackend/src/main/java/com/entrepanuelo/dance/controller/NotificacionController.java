package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.inscripcion.NotificacionResponse;
import com.entrepanuelo.dance.service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Notificaciones internas del bailarín")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    @Operation(summary = "Listar las notificaciones del usuario autenticado")
    public ResponseEntity<ApiResponse<List<NotificacionResponse>>> listar(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Notificaciones obtenidas correctamente",
                notificacionService.listar(authentication.getName())));
    }

    @GetMapping("/no-leidas")
    @Operation(summary = "Contar las notificaciones no leídas")
    public ResponseEntity<ApiResponse<Long>> contarNoLeidas(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Conteo obtenido correctamente",
                notificacionService.contarNoLeidas(authentication.getName())));
    }

    @PatchMapping("/{id}/leer")
    @Operation(summary = "Marcar una notificación como leída")
    public ResponseEntity<ApiResponse<Void>> marcarLeida(
            @PathVariable Long id,
            Authentication authentication) {

        notificacionService.marcarLeida(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.ok("Notificación marcada como leída", null));
    }

    @PatchMapping("/leer-todas")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<ApiResponse<Void>> marcarTodas(Authentication authentication) {
        notificacionService.marcarTodasLeidas(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Notificaciones marcadas como leídas", null));
    }
}
