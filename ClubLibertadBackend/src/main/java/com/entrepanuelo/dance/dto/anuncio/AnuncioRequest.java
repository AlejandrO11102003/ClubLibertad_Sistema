package com.entrepanuelo.dance.dto.anuncio;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnuncioRequest {

    @NotBlank(message = "El título del anuncio es obligatorio")
    @Size(max = 120, message = "El título es demasiado largo")
    private String titulo;

    @Size(max = 120, message = "El nombre de la entidad es demasiado largo")
    private String entidad;

    @Size(max = 300, message = "La descripción es demasiado larga")
    private String descripcion;

    @NotBlank(message = "La imagen del anuncio es obligatoria")
    @Size(max = 500, message = "La URL de la imagen es demasiado larga")
    private String imagenUrl;

    @Size(max = 500, message = "El enlace es demasiado largo")
    private String enlaceUrl;

    private Boolean activo;

    @Min(value = 0, message = "El orden no puede ser negativo")
    private Integer orden;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @AssertTrue(message = "La fecha de fin no puede ser anterior a la fecha de inicio")
    public boolean isRangoFechasValido() {
        return fechaInicio == null || fechaFin == null || !fechaFin.isBefore(fechaInicio);
    }
}
