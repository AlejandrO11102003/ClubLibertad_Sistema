package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.admirador.AdmiradorResponse;

public interface AdmiradorService {

    AdmiradorResponse estado(Long admiradoId, String admiradorDni);

    AdmiradorResponse admirar(Long admiradoId, String admiradorDni);

    AdmiradorResponse dejarDeAdmirar(Long admiradoId, String admiradorDni);
}
