package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.admin.AdminBailarinResponse;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.InscripcionRepository;
import com.entrepanuelo.dance.repository.ResultadoRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.AdminBailarinService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminBailarinServiceImpl implements AdminBailarinService {

    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final ResultadoRepository resultadoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminBailarinResponse> listar(String texto, Boolean activo, String categoria) {
        String filtro = normalizar(texto);
        String categoriaFiltro = normalizar(categoria);

        return usuarioRepository.findByRolOrderByCreatedAtDesc(Rol.BAILARIN)
                .stream()
                .filter(u -> activo == null || activo.equals(u.getActivo()))
                .filter(u -> coincideTexto(u, filtro))
                .filter(u -> coincideCategoria(u, categoriaFiltro))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminBailarinResponse obtener(Long id) {
        return toResponse(buscarBailarin(id));
    }

    @Override
    @Transactional
    public AdminBailarinResponse cambiarActivo(String dniAdmin, Long id, boolean activo) {
        Usuario admin = usuarioRepository.findByDni(dniAdmin)
                .orElseThrow(() -> new ResourceNotFoundException("Administrador no encontrado"));

        if (admin.getId().equals(id)) {
            throw new BusinessException("No puedes desactivar tu propia cuenta");
        }

        Usuario bailarin = buscarBailarin(id);
        bailarin.setActivo(activo);

        return toResponse(usuarioRepository.save(bailarin));
    }

    private AdminBailarinResponse toResponse(Usuario usuario) {
        long inscripciones = inscripcionRepository
                .countBySolicitante_IdOrPareja_Id(usuario.getId(), usuario.getId());
        long resultados = resultadoRepository.contarPorUsuario(usuario.getId());

        return AdminBailarinResponse.from(usuario, inscripciones, resultados);
    }

    private Usuario buscarBailarin(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bailarín no encontrado"));

        if (usuario.getRol() != Rol.BAILARIN) {
            throw new ResourceNotFoundException("Bailarín no encontrado");
        }

        return usuario;
    }

    private boolean coincideTexto(Usuario usuario, String filtro) {
        if (filtro.isBlank()) return true;

        String nombre = usuario.getPerfil() != null ? usuario.getPerfil().getNombre() : null;
        String apellido = usuario.getPerfil() != null ? usuario.getPerfil().getApellido() : null;
        String ciudad = usuario.getPerfil() != null ? usuario.getPerfil().getCiudad() : null;

        return normalizar(nombre).contains(filtro)
                || normalizar(apellido).contains(filtro)
                || normalizar(ciudad).contains(filtro);
    }

    private boolean coincideCategoria(Usuario usuario, String categoria) {
        if (categoria.isBlank()) return true;

        String actual = usuario.getPerfil() != null
                ? usuario.getPerfil().getCategoria()
                : null;

        return actual != null && normalizar(actual).equals(categoria);
    }

    private String normalizar(String valor) {
        if (valor == null) return "";

        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}
