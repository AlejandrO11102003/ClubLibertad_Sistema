package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.auth.ForgotPasswordRequest;
import com.entrepanuelo.dance.dto.auth.ResetPasswordRequest;
import com.entrepanuelo.dance.entity.PasswordResetToken;
import com.entrepanuelo.dance.entity.Perfil;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.repository.PasswordResetTokenRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.password-reset.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.password-reset.expiration-minutes:30}")
    private long expirationMinutes;

    @Value("${app.password-reset.mail-enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Override
    @Transactional
    public String requestReset(ForgotPasswordRequest request) {
        TipoDocumento tipoDocumento = request.getTipoDocumento() == null
                ? TipoDocumento.DNI
                : request.getTipoDocumento();
        Usuario usuario = usuarioRepository
                .findByTipoDocumentoAndDni(tipoDocumento, request.getDni().trim())
                .orElse(null);

        if (usuario == null || usuario.getPerfil() == null
                || usuario.getPerfil().getEmail() == null
                || usuario.getPerfil().getEmail().isBlank()) {
            return null;
        }

        String rawToken = generateToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .usuario(usuario)
                .tokenHash(hash(rawToken))
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .createdAt(LocalDateTime.now())
                .build();
        tokenRepository.save(resetToken);

        String link = frontendUrl + "/restablecer-contrasena?token="
                + java.net.URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        sendOrLogResetLink(usuario.getPerfil(), link);
        return enmascararEmail(usuario.getPerfil().getEmail());
    }

    private String enmascararEmail(String email) {
        String limpio = email.trim();
        int arroba = limpio.indexOf('@');
        if (arroba <= 0) {
            return "***";
        }
        String usuario = limpio.substring(0, arroba);
        String dominio = limpio.substring(arroba);
        String visible = usuario.length() <= 2 ? usuario.substring(0, 1) : usuario.substring(0, 2);
        return visible + "***" + dominio;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository
                .findByTokenHashAndUsedAtIsNull(hash(request.getToken()))
                .filter(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new BusinessException("El enlace no es válido o ya expiró"));

        Usuario usuario = resetToken.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuarioRepository.save(usuario);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
    }

    private void sendOrLogResetLink(Perfil perfil, String link) {
        if (!mailEnabled) {
            log.warn("SMTP deshabilitado. Enlace de recuperación para pruebas: {}", link);
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || mailFrom.isBlank()) {
            throw new BusinessException("El servicio de correo no está configurado");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(perfil.getEmail());
        message.setSubject("Recuperación de contraseña - Entre Pañuelos");
        message.setText("Solicitaste cambiar tu contraseña. Abre este enlace:\n\n" + link
                + "\n\nEl enlace vence en " + expirationMinutes + " minutos.");
        mailSender.send(message);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte item : digest) {
                result.append(String.format("%02x", item));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No se pudo generar el token de recuperación", exception);
        }
    }
}
