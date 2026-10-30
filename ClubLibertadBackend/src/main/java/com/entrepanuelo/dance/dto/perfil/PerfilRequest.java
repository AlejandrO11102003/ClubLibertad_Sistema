package com.entrepanuelo.dance.dto.perfil;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilRequest {

    @Size(max = 100, message = "Nombre demasiado largo")
    private String nombre;

    @Size(max = 100, message = "Apellido demasiado largo")
    private String apellido;

    @Email(message = "Correo electrónico inválido")
    @Size(max = 150, message = "Correo demasiado largo")
    private String email;

    @Pattern(regexp = "^$|^[0-9]{9}$", message = "El teléfono debe tener 9 dígitos")
    private String telefono;

    @Size(max = 100, message = "Ciudad demasiado larga")
    private String ciudad;

    @Size(max = 20, message = "Género inválido")
    private String genero;

    @Size(max = 50, message = "Categoría inválida")
    private String categoria;

    @Size(max = 200, message = "Academia demasiado larga")
    private String academiaActual;

    @Min(value = 1900, message = "Año de inicio inválido")
    @Max(value = 2100, message = "Año de inicio inválido")
    private Integer anioInicio;

    @Size(max = 100, message = "Marinera favorita demasiado larga")
    private String marineraFavorita;

    @Size(max = 1000, message = "Biografía demasiado larga")
    private String biografia;

    @Size(max = 500, message = "URL de fotografía demasiado larga")
    private String fotografiaUrl;
}
