package com.entrepanuelo.dance.dto.concurso;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcursoCategoriaRequest {

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;

    @Min(value = 0, message = "El cupo no puede ser negativo")
    private Integer cupo;

    @DecimalMin(value = "0.0", message = "El precio no puede ser negativo")
    private BigDecimal precio;
}
