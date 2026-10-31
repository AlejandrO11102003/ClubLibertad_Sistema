package com.entrepanuelo.dance.dto.anuncio;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoverAnuncioRequest {

    public enum Direccion {
        SUBIR,
        BAJAR
    }

    @NotNull(message = "La dirección es obligatoria")
    private Direccion direccion;
}
