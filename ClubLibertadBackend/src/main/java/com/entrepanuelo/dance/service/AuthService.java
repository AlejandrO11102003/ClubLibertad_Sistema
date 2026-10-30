package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.auth.AuthResponse;
import com.entrepanuelo.dance.dto.auth.LoginRequest;
import com.entrepanuelo.dance.dto.auth.RegisterRequest;
import com.entrepanuelo.dance.dto.auth.UsuarioResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UsuarioResponse me(String dni);
}