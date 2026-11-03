package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.resultado.ImportacionResponse;
import com.entrepanuelo.dance.dto.resultado.ResultadoResponse;
import com.entrepanuelo.dance.service.ResultadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/resultados")
@RequiredArgsConstructor
@Tag(name = "Administración de resultados", description = "Carga de resultados desde Excel")
public class AdminResultadoController {

    private final ResultadoService resultadoService;

    @PostMapping(value = "/importar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Importar resultados desde un archivo Excel")
    public ResponseEntity<ApiResponse<ImportacionResponse>> importar(
            @RequestParam Long concursoId,
            @RequestParam("archivo") MultipartFile archivo,
            Authentication authentication) {

        ImportacionResponse importacion = resultadoService.importar(
                authentication.getName(), concursoId, archivo);

        String mensaje = importacion.getFilasInvalidas() > 0
                ? "Resultados importados con observaciones"
                : "Resultados importados correctamente";

        return ResponseEntity.ok(ApiResponse.ok(mensaje, importacion));
    }

    @GetMapping("/importaciones")
    @Operation(summary = "Listar las últimas importaciones de resultados")
    public ResponseEntity<ApiResponse<List<ImportacionResponse>>> importaciones(
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Importaciones obtenidas correctamente",
                resultadoService.listarImportaciones(authentication.getName())));
    }

    @GetMapping
    @Operation(summary = "Listar los resultados de un concurso")
    public ResponseEntity<ApiResponse<List<ResultadoResponse>>> resultados(
            @RequestParam Long concursoId,
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Resultados obtenidos correctamente",
                resultadoService.listarResultados(authentication.getName(), concursoId)));
    }

    @GetMapping("/plantilla")
    @Operation(summary = "Descargar la plantilla Excel de resultados")
    public ResponseEntity<byte[]> plantilla(
            @RequestParam Long concursoId,
            Authentication authentication) {
        byte[] archivo = resultadoService.generarPlantilla(
                authentication.getName(), concursoId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"plantilla-resultados.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(archivo);
    }
}
