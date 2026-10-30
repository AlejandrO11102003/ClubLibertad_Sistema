package com.entrepanuelo.dance.dto.admin;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaRequest {

    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 100, message = "El nombre es demasiado largo")
    private String nombre;

    @Min(value = 0, message = "La edad mínima no es válida")
    @Max(value = 120, message = "La edad mínima no es válida")
    private Integer edadMin;

    @Min(value = 0, message = "La edad máxima no es válida")
    @Max(value = 120, message = "La edad máxima no es válida")
    private Integer edadMax;

    @Size(max = 20, message = "El género es demasiado largo")
    private String genero;

    private Boolean activa;

    @AssertTrue(message = "La edad mínima no puede ser mayor que la edad máxima")
    public boolean isRangoEdadesValido() {
        return edadMin == null || edadMax == null || edadMin <= edadMax;
    }
}
