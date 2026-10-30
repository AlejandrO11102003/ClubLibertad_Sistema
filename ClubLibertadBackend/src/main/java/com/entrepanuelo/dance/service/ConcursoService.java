package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.concurso.ConcursoRequest;
import com.entrepanuelo.dance.dto.concurso.ConcursoResponse;

import java.util.List;

public interface ConcursoService {

    List<ConcursoResponse> listarPublicos();

    ConcursoResponse obtenerPublico(Long id);

    List<ConcursoResponse> listarTodos();

    ConcursoResponse obtener(Long id);

    ConcursoResponse crear(ConcursoRequest request);

    ConcursoResponse actualizar(Long id, ConcursoRequest request);

    void eliminar(Long id);
}
