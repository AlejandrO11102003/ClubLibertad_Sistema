package com.entrepanuelo.dance.dto.trayectoria;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilPublicoResponse {

    private Long usuarioId;
    private String nombre;
    private String apellido;
    private String ciudad;
    private String fotografiaUrl;
    private String categoria;
    private String academiaActual;
    private Integer anioInicio;
    private String marineraFavorita;
    private String biografia;

    private BigDecimal nivelEstrellas;
    private boolean nivelPendiente;
    private int totalConcursos;
    private int totalParticipaciones;
    private int totalPrimeros;
    private int totalSegundos;
    private int totalTerceros;
    private BigDecimal promedioPosicion;
    private Integer mejorPosicion;

    private List<LogroResponse> logros;
    private List<TrayectoriaItemResponse> trayectoria;
}
