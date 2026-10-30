package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.perfil.PerfilRequest;
import com.entrepanuelo.dance.dto.perfil.PerfilResponse;

public interface PerfilService {

    PerfilResponse obtener(String dni);

    PerfilResponse actualizar(String dni, PerfilRequest request);
}
