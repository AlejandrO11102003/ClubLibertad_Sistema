package com.entrepanuelo.dance.dto.credencial;

import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CredencialResponse {

    private Long inscripcionId;
    private String codigo;
    private Long concursoId;
    private String concursoNombre;
    private String concursoLugar;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String categoriaNombre;
    private EstadoInscripcion estadoInscripcion;
    private boolean completa;
    private List<String> faltantes;
    private CredencialBailarinResponse solicitante;
    private CredencialBailarinResponse pareja;

    public static CredencialResponse from(Inscripcion i) {
        List<String> faltantes = new ArrayList<>();
        agregarSiFaltaFoto(faltantes, i.getSolicitante());
        agregarSiFaltaFoto(faltantes, i.getPareja());

        String codigo = "EP-" + i.getConcurso().getFechaInicio().getYear()
                + "-" + String.format("%05d", i.getId());

        return CredencialResponse.builder()
                .inscripcionId(i.getId())
                .codigo(codigo)
                .concursoId(i.getConcurso().getId())
                .concursoNombre(i.getConcurso().getNombre())
                .concursoLugar(i.getConcurso().getLugar())
                .fechaInicio(i.getConcurso().getFechaInicio())
                .fechaFin(i.getConcurso().getFechaFin())
                .categoriaNombre(i.getCategoria().getNombre())
                .estadoInscripcion(i.getEstado())
                .completa(faltantes.isEmpty())
                .faltantes(faltantes)
                .solicitante(CredencialBailarinResponse.from(i.getSolicitante()))
                .pareja(CredencialBailarinResponse.from(i.getPareja()))
                .build();
    }

    private static void agregarSiFaltaFoto(List<String> faltantes, Usuario u) {
        boolean sinFoto = u.getPerfil() == null
                || u.getPerfil().getFotografiaUrl() == null
                || u.getPerfil().getFotografiaUrl().isBlank();

        if (sinFoto) {
            String nombre = u.getPerfil() != null && u.getPerfil().getNombre() != null
                    ? u.getPerfil().getNombre()
                    : "Bailarín";
            faltantes.add(nombre);
        }
    }
}
