package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.admirador.AdmiradorResponse;
import com.entrepanuelo.dance.entity.Admirador;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.AdmiradorRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.AdmiradorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdmiradorServiceImpl implements AdmiradorService {

    private final AdmiradorRepository admiradorRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public AdmiradorResponse estado(Long admiradoId, String admiradorDni) {
        Usuario admirado = buscarUsuario(admiradoId);
        Usuario admirador = buscarUsuario(admiradorDni);
        return respuesta(admirador, admirado);
    }

    @Override
    @Transactional
    public AdmiradorResponse admirar(Long admiradoId, String admiradorDni) {
        Usuario admirado = buscarUsuario(admiradoId);
        Usuario admirador = buscarUsuario(admiradorDni);
        if (admirador.getId().equals(admirado.getId())) {
            throw new BusinessException("No puedes admirarte a ti mismo");
        }
        if (!admiradorRepository.existsByAdmirador_IdAndAdmirado_Id(
                admirador.getId(), admirado.getId())) {
            admiradorRepository.save(Admirador.builder()
                    .admirador(admirador)
                    .admirado(admirado)
                    .createdAt(LocalDateTime.now())
                    .build());
        }
        return respuesta(admirador, admirado);
    }

    @Override
    @Transactional
    public AdmiradorResponse dejarDeAdmirar(Long admiradoId, String admiradorDni) {
        Usuario admirado = buscarUsuario(admiradoId);
        Usuario admirador = buscarUsuario(admiradorDni);
        admiradorRepository.deleteByAdmirador_IdAndAdmirado_Id(
                admirador.getId(), admirado.getId());
        return respuesta(admirador, admirado);
    }

    private AdmiradorResponse respuesta(Usuario admirador, Usuario admirado) {
        return AdmiradorResponse.builder()
                .totalAdmiradores(admiradorRepository.countByAdmirado_Id(admirado.getId()))
                .admiradoPorUsuario(admiradorRepository.existsByAdmirador_IdAndAdmirado_Id(
                        admirador.getId(), admirado.getId()))
                .build();
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bailarín no encontrado"));
    }

    private Usuario buscarUsuario(String dni) {
        return usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
