package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.inscripcion.InscripcionRequest;
import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;

import java.util.List;

public interface InscripcionService {

    InscripcionResponse crear(String dni, InscripcionRequest request);

    List<InscripcionResponse> listarMias(String dni);

    List<InscripcionResponse> listarPendientes(String dni);

    InscripcionResponse aceptar(String dni, Long id);

    InscripcionResponse rechazar(String dni, Long id);
}
