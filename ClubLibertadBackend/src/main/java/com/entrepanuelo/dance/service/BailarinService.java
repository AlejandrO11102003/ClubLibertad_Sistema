package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.inscripcion.BailarinBusquedaResponse;
import com.entrepanuelo.dance.dto.inscripcion.BailarinDestacadoResponse;

import java.util.List;

public interface BailarinService {

    BailarinBusquedaResponse buscarPorDni(String dniActual, String dniBuscado);

    List<BailarinDestacadoResponse> listarDestacados(int limite);
}
