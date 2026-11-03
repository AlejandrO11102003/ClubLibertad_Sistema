package com.entrepanuelo.dance.dto.admirador;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdmiradorResponse {
    long totalAdmiradores;
    boolean admiradoPorUsuario;
}
