package com.entrepanuelo.dance.dto.inscripcion;

import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscripcionRequest {

    @NotNull(message = "El concurso es obligatorio")
    private Long concursoId;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;

    @Builder.Default
    private TipoDocumento parejaTipoDocumento = TipoDocumento.DNI;

    @NotBlank(message = "El número de documento de la pareja es obligatorio")
    @Pattern(regexp = "^[A-Za-z0-9]{6,20}$", message = "El número de documento no es válido")
    private String parejaDni;
}
