package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.perfil.PerfilRequest;
import com.entrepanuelo.dance.dto.perfil.PerfilResponse;
import com.entrepanuelo.dance.entity.Perfil;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.PerfilService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PerfilServiceImpl implements PerfilService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public PerfilResponse obtener(String dni) {
        Usuario usuario = buscarUsuario(dni);
        return PerfilResponse.from(usuario, usuario.getPerfil());
    }

    @Override
    @Transactional
    public PerfilResponse actualizar(String dni, PerfilRequest req) {
        Usuario usuario = buscarUsuario(dni);

        Perfil perfil = usuario.getPerfil();
        if (perfil == null) {
            perfil = Perfil.builder().usuario(usuario).build();
            usuario.setPerfil(perfil);
        }

        perfil.setNombre(req.getNombre());
        perfil.setApellido(req.getApellido());
        perfil.setEmail(req.getEmail());
        perfil.setTelefono(req.getTelefono());
        perfil.setCiudad(req.getCiudad());
        perfil.setGenero(req.getGenero());
        perfil.setCategoria(req.getCategoria());
        perfil.setAcademiaActual(req.getAcademiaActual());
        perfil.setAnioInicio(req.getAnioInicio());
        perfil.setMarineraFavorita(req.getMarineraFavorita());
        perfil.setBiografia(req.getBiografia());
        perfil.setFotografiaUrl(req.getFotografiaUrl());

        Usuario saved = usuarioRepository.save(usuario);
        return PerfilResponse.from(saved, saved.getPerfil());
    }

    private Usuario buscarUsuario(String dni) {
        return usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
