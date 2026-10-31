package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.anuncio.AnuncioResponse;
import com.entrepanuelo.dance.service.AnuncioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/anuncios")
@RequiredArgsConstructor
@Tag(name = "Anuncios", description = "Publicidad mostrada en el landing")
public class AnuncioController {

    private final AnuncioService anuncioService;

    @GetMapping
    @Operation(summary = "Listar anuncios activos y vigentes para el carrusel")
    public ResponseEntity<ApiResponse<List<AnuncioResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(
                "Anuncios obtenidos correctamente",
                anuncioService.listarVigentes()));
    }
}
