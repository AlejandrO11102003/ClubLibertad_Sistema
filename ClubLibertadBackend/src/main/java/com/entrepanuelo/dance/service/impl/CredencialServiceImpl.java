package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.credencial.CredencialResponse;
import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ForbiddenException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.InscripcionRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.CredencialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CredencialServiceImpl implements CredencialService {

    private final InscripcionRepository inscripcionRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CredencialResponse> listar(String dni) {
        Usuario usuario = buscarUsuario(dni);

        return inscripcionRepository.listarPorUsuario(usuario.getId())
                .stream()
                .filter(i -> i.getEstado() == EstadoInscripcion.CONFIRMADA)
                .map(CredencialResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CredencialResponse obtener(String dni, Long inscripcionId) {
        Usuario usuario = buscarUsuario(dni);

        Inscripcion inscripcion = inscripcionRepository.findById(inscripcionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada"));

        boolean participa = inscripcion.getSolicitante().getId().equals(usuario.getId())
                || inscripcion.getPareja().getId().equals(usuario.getId());

        if (!participa) {
            throw new ForbiddenException("No tienes acceso a esta credencial");
        }

        if (inscripcion.getEstado() != EstadoInscripcion.CONFIRMADA) {
            throw new BusinessException(
                    "La credencial solo está disponible para inscripciones confirmadas");
        }

        return CredencialResponse.from(inscripcion);
    }

    private Usuario buscarUsuario(String dni) {
        return usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
