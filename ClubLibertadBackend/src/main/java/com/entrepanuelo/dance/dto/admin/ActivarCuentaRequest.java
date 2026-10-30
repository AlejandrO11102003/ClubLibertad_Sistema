package com.entrepanuelo.dance.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivarCuentaRequest {

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean activo;
}
