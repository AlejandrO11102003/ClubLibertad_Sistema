package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.auth.AuthResponse;
import com.entrepanuelo.dance.dto.auth.LoginRequest;
import com.entrepanuelo.dance.dto.auth.RegisterRequest;
import com.entrepanuelo.dance.dto.auth.UsuarioResponse;
import com.entrepanuelo.dance.entity.Perfil;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.security.JwtService;
import com.entrepanuelo.dance.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ============================================================
    // RF-01: Registro
    // ============================================================
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest req) {

        // Validar DNI único
        TipoDocumento tipoDocumento = req.getTipoDocumento() == null
                ? TipoDocumento.DNI
                : req.getTipoDocumento();

        if (usuarioRepository.existsByTipoDocumentoAndDni(tipoDocumento, req.getDni())) {
            throw new BusinessException("El documento ya está registrado");
        }

        // Crear Usuario
        Usuario usuario = Usuario.builder()
                .dni(req.getDni())
                .tipoDocumento(tipoDocumento)
                .anioNacimiento(req.getAnioNacimiento())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .rol(Rol.BAILARIN)
                .activo(true)
                .build();

        // Crear Perfil
        Perfil perfil = Perfil.builder()
                .usuario(usuario)
                .nombre(req.getNombre())
                .apellido(req.getApellido())
                .ciudad(req.getCiudad())
                .email(req.getEmail())
                .telefono(req.getTelefono())
                .genero(req.getGenero())
                .categoria(req.getCategoria())
                .academiaActual(req.getAcademiaActual())
                .build();

        usuario.setPerfil(perfil);

        Usuario saved = usuarioRepository.save(usuario);

        // Generar token
        String token = jwtService.generateToken(saved);

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .expiraEn(jwtService.getExpirationMs())
                .rol(saved.getRol())
                .usuario(UsuarioResponse.from(saved))
                .build();
    }

    // ============================================================
    // RF-01: Login
    // ============================================================
    @Override
    public AuthResponse login(LoginRequest req) {
        TipoDocumento tipoDocumento = req.getTipoDocumento() == null
                ? TipoDocumento.DNI
                : req.getTipoDocumento();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            identity(tipoDocumento, req.getDni()), req.getPassword())
            );
        } catch (DisabledException e) {
            throw new BusinessException("La cuenta está desactivada. Contacta al administrador.");
        } catch (BadCredentialsException e) {
            throw new BusinessException("DNI o contraseña incorrectos");
        }

        Usuario usuario = usuarioRepository.findByTipoDocumentoAndDni(tipoDocumento, req.getDni())
                .orElseThrow(() -> new BusinessException("DNI o contraseña incorrectos"));

        String token = jwtService.generateToken(usuario);

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .expiraEn(jwtService.getExpirationMs())
                .rol(usuario.getRol())
                .usuario(UsuarioResponse.from(usuario))
                .build();
    }

    // ============================================================
    // ECU-02: datos de la sesión actual
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse me(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return UsuarioResponse.from(usuario);
    }

    private String identity(TipoDocumento tipoDocumento, String documento) {
        return tipoDocumento.name() + ":" + documento;
    }
}
