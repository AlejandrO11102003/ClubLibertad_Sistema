package com.entrepanuelo.dance.dto.anuncio;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivarAnuncioRequest {

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean activo;
}
