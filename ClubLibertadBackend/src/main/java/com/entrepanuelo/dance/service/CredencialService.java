package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.credencial.CredencialResponse;

import java.util.List;

public interface CredencialService {

    List<CredencialResponse> listar(String dni);

    CredencialResponse obtener(String dni, Long inscripcionId);
}
