package com.entrepanuelo.dance.dto.resultado;

import com.entrepanuelo.dance.entity.Importacion;
import com.entrepanuelo.dance.entity.enums.EstadoImportacion;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportacionResponse {

    private Long id;
    private String archivo;
    private EstadoImportacion estado;
    private Integer filasValidas;
    private Integer filasInvalidas;
    private List<String> errores;
    private LocalDateTime createdAt;

    public static ImportacionResponse from(Importacion i) {
        List<String> errores = i.getDetalleErrores() == null || i.getDetalleErrores().isBlank()
                ? List.of()
                : Arrays.stream(i.getDetalleErrores().split("\\R"))
                        .filter(linea -> !linea.isBlank())
                        .toList();

        return ImportacionResponse.builder()
                .id(i.getId())
                .archivo(i.getArchivo())
                .estado(i.getEstado())
                .filasValidas(i.getFilasValidas())
                .filasInvalidas(i.getFilasInvalidas())
                .errores(errores)
                .createdAt(i.getCreatedAt())
                .build();
    }
}
