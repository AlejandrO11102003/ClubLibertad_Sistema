package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.admin.CategoriaRequest;
import com.entrepanuelo.dance.dto.concurso.CategoriaResponse;

import java.util.List;

public interface AdminCategoriaService {

    List<CategoriaResponse> listarTodas();

    CategoriaResponse crear(CategoriaRequest request);

    CategoriaResponse actualizar(Long id, CategoriaRequest request);

    CategoriaResponse cambiarActiva(Long id, boolean activa);
}
