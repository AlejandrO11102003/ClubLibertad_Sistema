package com.entrepanuelo.dance.dto.concurso;

import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcursoRequest {

    @NotBlank(message = "El nombre del concurso es obligatorio")
    @Size(max = 200, message = "El nombre es demasiado largo")
    private String nombre;

    @Size(max = 500, message = "La URL del banner es demasiado larga")
    private String bannerUrl;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @NotBlank(message = "El lugar es obligatorio")
    @Size(max = 200, message = "El lugar es demasiado largo")
    private String lugar;

    private EstadoConcurso estado;

    @NotEmpty(message = "Debe registrar al menos una categoría")
    private List<@Valid ConcursoCategoriaRequest> categorias;

    @AssertTrue(message = "La fecha de fin no puede ser anterior a la fecha de inicio")
    public boolean isRangoFechasValido() {
        return fechaFin == null || fechaInicio == null || !fechaFin.isBefore(fechaInicio);
    }
}
