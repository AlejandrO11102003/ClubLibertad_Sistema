package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.InscripcionRepository;
import com.entrepanuelo.dance.service.AdminInscripcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminInscripcionServiceImpl implements AdminInscripcionService {

    private final InscripcionRepository inscripcionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InscripcionResponse> listar(Long concursoId, Long categoriaId,
                                            EstadoInscripcion estado, String texto) {
        List<Inscripcion> inscripciones =
                inscripcionRepository.listarAdmin(concursoId, categoriaId, estado);

        String filtro = normalizar(texto);
        if (filtro.isBlank()) {
            return inscripciones.stream().map(InscripcionResponse::from).toList();
        }

        return inscripciones.stream()
                .filter(i -> coincide(i, filtro))
                .map(InscripcionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InscripcionResponse obtener(Long id) {
        Inscripcion inscripcion = inscripcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada"));

        return InscripcionResponse.from(inscripcion);
    }

    private boolean coincide(Inscripcion inscripcion, String filtro) {
        return normalizar(inscripcion.getSolicitante().getPerfil() != null
                        ? inscripcion.getSolicitante().getPerfil().getNombre()
                        : null).contains(filtro)
                || normalizar(inscripcion.getSolicitante().getPerfil() != null
                        ? inscripcion.getSolicitante().getPerfil().getApellido()
                        : null).contains(filtro)
                || normalizar(inscripcion.getPareja().getPerfil() != null
                        ? inscripcion.getPareja().getPerfil().getNombre()
                        : null).contains(filtro)
                || normalizar(inscripcion.getPareja().getPerfil() != null
                        ? inscripcion.getPareja().getPerfil().getApellido()
                        : null).contains(filtro)
                || normalizar(inscripcion.getConcurso().getNombre()).contains(filtro)
                || normalizar(inscripcion.getCategoria().getNombre()).contains(filtro);
    }

    private String normalizar(String valor) {
        if (valor == null) return "";

        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}
