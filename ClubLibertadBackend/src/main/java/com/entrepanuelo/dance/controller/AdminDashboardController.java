package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.admin.AdminDashboardResponse;
import com.entrepanuelo.dance.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Panel de administración", description = "Métricas y actividad reciente")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    @Operation(summary = "Obtener las métricas del dashboard administrativo")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> obtener(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Dashboard obtenido correctamente",
                adminDashboardService.obtener(authentication.getName())));
    }
}
