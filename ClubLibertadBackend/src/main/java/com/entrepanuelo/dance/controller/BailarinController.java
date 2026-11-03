package com.entrepanuelo.dance.controller;

import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.inscripcion.BailarinBusquedaResponse;
import com.entrepanuelo.dance.dto.inscripcion.BailarinDestacadoResponse;
import com.entrepanuelo.dance.dto.trayectoria.PerfilPublicoResponse;
import com.entrepanuelo.dance.service.BailarinService;
import com.entrepanuelo.dance.service.TrayectoriaService;
import com.entrepanuelo.dance.dto.admirador.AdmiradorResponse;
import com.entrepanuelo.dance.service.AdmiradorService;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bailarines")
@RequiredArgsConstructor
@Tag(name = "Bailarines", description = "Búsqueda de pareja y perfil público")
public class BailarinController {

    private final BailarinService bailarinService;
    private final TrayectoriaService trayectoriaService;
    private final AdmiradorService admiradorService;

    @GetMapping("/buscar")
    @Operation(summary = "Buscar un bailarín por DNI para invitarlo como pareja")
    public ResponseEntity<ApiResponse<BailarinBusquedaResponse>> buscar(
            @RequestParam(defaultValue = "DNI") TipoDocumento tipoDocumento,
            @RequestParam String dni,
            Authentication authentication) {

        BailarinBusquedaResponse bailarin =
                bailarinService.buscarPorDni(authentication.getName(), tipoDocumento, dni);

        return ResponseEntity.ok(
                ApiResponse.ok("Bailarín encontrado", bailarin));
    }

    @GetMapping("/destacados")
    @Operation(summary = "Listar los bailarines destacados de la comunidad")
    public ResponseEntity<ApiResponse<List<BailarinDestacadoResponse>>> destacados(
            @RequestParam(defaultValue = "6") int limite) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Bailarines destacados obtenidos correctamente",
                bailarinService.listarDestacados(limite)));
    }

    @GetMapping("/{id}/perfil-publico")
    @Operation(summary = "Obtener el perfil público y la trayectoria de un bailarín")
    public ResponseEntity<ApiResponse<PerfilPublicoResponse>> perfilPublico(
            @PathVariable Long id, Authentication authentication) {
        PerfilPublicoResponse perfil = trayectoriaService.obtenerPublico(id);
        if (authentication != null) {
            AdmiradorResponse estado = admiradorService.estado(id, authentication.getName());
            perfil.setAdmiradoPorUsuario(estado.isAdmiradoPorUsuario());
        }

        return ResponseEntity.ok(ApiResponse.ok(
                "Perfil público obtenido correctamente",
                perfil));
    }

    @GetMapping("/{id}/admiradores")
    public ResponseEntity<ApiResponse<AdmiradorResponse>> estadoAdmiradores(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Estado de admiradores obtenido correctamente",
                admiradorService.estado(id, authentication.getName())));
    }

    @PostMapping("/{id}/admiradores")
    public ResponseEntity<ApiResponse<AdmiradorResponse>> admirar(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Perfil admirado correctamente",
                admiradorService.admirar(id, authentication.getName())));
    }

    @DeleteMapping("/{id}/admiradores")
    public ResponseEntity<ApiResponse<AdmiradorResponse>> dejarDeAdmirar(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Admiración retirada correctamente",
                admiradorService.dejarDeAdmirar(id, authentication.getName())));
    }
}
