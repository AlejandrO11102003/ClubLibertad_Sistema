package com.entrepanuelo.dance.dto.auth;

import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ForgotPasswordRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipoDocumento = TipoDocumento.DNI;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(min = 6, max = 20, message = "El número de documento debe tener entre 6 y 20 caracteres")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "El número de documento solo puede contener letras y números")
    private String dni;
}
