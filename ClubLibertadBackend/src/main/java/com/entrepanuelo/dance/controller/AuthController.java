package com.entrepanuelo.dance.controller;



import com.entrepanuelo.dance.dto.ApiResponse;
import com.entrepanuelo.dance.dto.auth.AuthResponse;
import com.entrepanuelo.dance.dto.auth.LoginRequest;
import com.entrepanuelo.dance.dto.auth.RegisterRequest;
import com.entrepanuelo.dance.dto.auth.UsuarioResponse;
import com.entrepanuelo.dance.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro y login con DNI + contraseña")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo bailarín")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registro exitoso", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión con DNI y contraseña")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Sesión iniciada correctamente", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener los datos del usuario autenticado")
    public ResponseEntity<ApiResponse<UsuarioResponse>> me(Authentication authentication) {
        UsuarioResponse usuario = authService.me(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Sesión vigente", usuario));
    }
}
