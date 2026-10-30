package com.entrepanuelo.dance.dto.auth;

import com.entrepanuelo.dance.entity.enums.Rol;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String tipo;         // "Bearer"
    private Long expiraEn;       // ms
    private Rol rol;
    private UsuarioResponse usuario;
}