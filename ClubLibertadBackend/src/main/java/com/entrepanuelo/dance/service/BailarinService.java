package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.inscripcion.BailarinBusquedaResponse;
import com.entrepanuelo.dance.dto.inscripcion.BailarinDestacadoResponse;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;

import java.util.List;

public interface BailarinService {

    BailarinBusquedaResponse buscarPorDni(
            String dniActual, TipoDocumento tipoDocumento, String dniBuscado);

    List<BailarinDestacadoResponse> listarDestacados(int limite);
}
