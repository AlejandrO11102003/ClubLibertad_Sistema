package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.resultado.ImportacionResponse;
import com.entrepanuelo.dance.dto.resultado.ResultadoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResultadoService {

    ImportacionResponse importar(String dniAdmin, Long concursoId, MultipartFile archivo);

    List<ImportacionResponse> listarImportaciones(String dniAdmin);

    List<ResultadoResponse> listarResultados(String dniAdmin, Long concursoId);

    List<ResultadoResponse> listarPublicosPorConcurso(Long concursoId);

    List<ResultadoResponse> listarMios(String dni);

    byte[] generarPlantilla(String dniAdmin, Long concursoId);
}
