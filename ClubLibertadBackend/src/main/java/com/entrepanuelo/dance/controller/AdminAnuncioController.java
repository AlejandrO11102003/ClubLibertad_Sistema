package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.anuncio.ActivarAnuncioRequest;
import com.entrepanuelo.dance.dto.anuncio.AnuncioRequest;
import com.entrepanuelo.dance.dto.anuncio.AnuncioResponse;
import com.entrepanuelo.dance.dto.anuncio.ImagenSubidaResponse;
import com.entrepanuelo.dance.dto.anuncio.MoverAnuncioRequest;
import com.entrepanuelo.dance.service.AdminAnuncioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/anuncios")
@RequiredArgsConstructor
@Tag(name = "Administración de anuncios", description = "CRUD y publicación de publicidad")
public class AdminAnuncioController {

    private final AdminAnuncioService adminAnuncioService;

    @GetMapping
    @Operation(summary = "Listar todos los anuncios, incluidos los inactivos")
    public ResponseEntity<ApiResponse<List<AnuncioResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(
                "Anuncios obtenidos correctamente",
                adminAnuncioService.listarTodos()));
    }

    @PostMapping
    @Operation(summary = "Crear un anuncio")
    public ResponseEntity<ApiResponse<AnuncioResponse>> crear(
            @Valid @RequestBody AnuncioRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Anuncio creado correctamente",
                        adminAnuncioService.crear(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un anuncio")
    public ResponseEntity<ApiResponse<AnuncioResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody AnuncioRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Anuncio actualizado correctamente",
                adminAnuncioService.actualizar(id, request)));
    }

    @PatchMapping("/{id}/activo")
    @Operation(summary = "Activar o desactivar un anuncio")
    public ResponseEntity<ApiResponse<AnuncioResponse>> cambiarActivo(
            @PathVariable Long id,
            @Valid @RequestBody ActivarAnuncioRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                request.getActivo()
                        ? "Anuncio activado correctamente"
                        : "Anuncio desactivado correctamente",
                adminAnuncioService.cambiarActivo(id, request.getActivo())));
    }

    @PatchMapping("/{id}/mover")
    @Operation(summary = "Mover un anuncio arriba o abajo en el carrusel")
    public ResponseEntity<ApiResponse<List<AnuncioResponse>>> mover(
            @PathVariable Long id,
            @Valid @RequestBody MoverAnuncioRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Orden actualizado correctamente",
                adminAnuncioService.mover(id, request.getDireccion())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un anuncio y su imagen")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        adminAnuncioService.eliminar(id);

        return ResponseEntity.ok(ApiResponse.ok("Anuncio eliminado correctamente", null));
    }

    @PostMapping(value = "/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir la imagen (flyer) de un anuncio")
    public ResponseEntity<ApiResponse<ImagenSubidaResponse>> subirImagen(
            @RequestPart("archivo") MultipartFile archivo) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Imagen subida correctamente",
                        adminAnuncioService.subirImagen(archivo)));
    }
}
