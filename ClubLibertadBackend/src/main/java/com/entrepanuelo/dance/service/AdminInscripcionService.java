package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;

import java.util.List;

public interface AdminInscripcionService {

    List<InscripcionResponse> listar(Long concursoId, Long categoriaId,
                                     EstadoInscripcion estado, String texto);

    InscripcionResponse obtener(Long id);

    byte[] exportar(Long concursoId);
}
