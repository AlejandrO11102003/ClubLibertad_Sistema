package com.entrepanuelo.dance.dto.auth;

import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    @Builder.Default
    private TipoDocumento tipoDocumento = TipoDocumento.DNI;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(min = 6, max = 20, message = "El número de documento debe tener entre 6 y 20 caracteres")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "El número de documento solo puede contener letras y números")
    private String dni;

    @NotNull(message = "El año de nacimiento es obligatorio")
    @Min(value = 1900, message = "Año de nacimiento inválido")
    @Max(value = 2100, message = "Año de nacimiento inválido")
    private Integer anioNacimiento;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$",
        message = "La contraseña debe tener al menos una mayúscula, un número y un símbolo"
    )
    private String password;

    // Datos de perfil (opcionales al registrar)
    @Size(max = 100, message = "Nombre demasiado largo")
    private String nombre;

    @Size(max = 100, message = "Apellido demasiado largo")
    private String apellido;

    @Size(max = 100, message = "Ciudad demasiado larga")
    private String ciudad;

    @Email(message = "Correo electrónico inválido")
    @Size(max = 150, message = "Correo demasiado largo")
    private String email;

    @Pattern(regexp = "^$|^[0-9]{9}$", message = "El teléfono debe tener 9 dígitos")
    private String telefono;

    @Size(max = 20, message = "Género inválido")
    private String genero;

    @Size(max = 50, message = "Categoría inválida")
    private String categoria;

    @Size(max = 200, message = "Academia demasiado larga")
    private String academiaActual;
}