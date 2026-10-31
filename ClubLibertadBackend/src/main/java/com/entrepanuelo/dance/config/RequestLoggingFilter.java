package com.entrepanuelo.dance.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        long inicio = System.nanoTime();

        try {
            filterChain.doFilter(request, response);
        } finally {
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();
            String usuario = authentication != null && authentication.isAuthenticated()
                    ? enmascararIdentidad(authentication.getName())
                    : "anonimo";
            long duracionMs = (System.nanoTime() - inicio) / 1_000_000;

            log.info("HTTP {} {} -> {} ({} ms, usuario={})",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duracionMs,
                    usuario);
        }
    }

    private String enmascararIdentidad(String identidad) {
        if (identidad == null || identidad.length() <= 4) {
            return "autenticado";
        }
        return identidad.substring(0, 2)
                + "***"
                + identidad.substring(identidad.length() - 2);
    }
}
