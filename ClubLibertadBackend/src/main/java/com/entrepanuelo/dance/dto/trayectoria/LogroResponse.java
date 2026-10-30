package com.entrepanuelo.dance.dto.trayectoria;

import com.entrepanuelo.dance.entity.Logro;
import com.entrepanuelo.dance.entity.enums.TipoLogro;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogroResponse {

    private Long id;
    private TipoLogro tipo;
    private String descripcion;
    private Long concursoId;
    private String concursoNombre;
    private Long categoriaId;
    private String categoriaNombre;
    private LocalDate fecha;

    public static LogroResponse from(Logro l) {
        return LogroResponse.builder()
                .id(l.getId())
                .tipo(l.getTipo())
                .descripcion(l.getDescripcion())
                .concursoId(l.getConcurso().getId())
                .concursoNombre(l.getConcurso().getNombre())
                .categoriaId(l.getCategoria().getId())
                .categoriaNombre(l.getCategoria().getNombre())
                .fecha(l.getFecha())
                .build();
    }
}
