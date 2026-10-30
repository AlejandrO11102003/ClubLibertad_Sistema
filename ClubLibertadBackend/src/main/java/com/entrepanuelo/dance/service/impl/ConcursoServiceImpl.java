package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.concurso.ConcursoCategoriaRequest;
import com.entrepanuelo.dance.dto.concurso.ConcursoRequest;
import com.entrepanuelo.dance.dto.concurso.ConcursoResponse;
import com.entrepanuelo.dance.entity.Categoria;
import com.entrepanuelo.dance.entity.Concurso;
import com.entrepanuelo.dance.entity.ConcursoCategoria;
import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.CategoriaRepository;
import com.entrepanuelo.dance.repository.ConcursoRepository;
import com.entrepanuelo.dance.service.ConcursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConcursoServiceImpl implements ConcursoService {

    private final ConcursoRepository concursoRepository;
    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ConcursoResponse> listarPublicos() {
        return concursoRepository
                .findByEstadoInOrderByFechaInicioAsc(
                        List.of(EstadoConcurso.PUBLICADO, EstadoConcurso.CERRADO))
                .stream()
                .map(ConcursoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ConcursoResponse obtenerPublico(Long id) {
        Concurso concurso = buscarConcurso(id);
        if (concurso.getEstado() == EstadoConcurso.BORRADOR) {
            throw new ResourceNotFoundException("Concurso no encontrado");
        }
        return ConcursoResponse.from(concurso);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConcursoResponse> listarTodos() {
        return concursoRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ConcursoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ConcursoResponse obtener(Long id) {
        return ConcursoResponse.from(buscarConcurso(id));
    }

    @Override
    @Transactional
    public ConcursoResponse crear(ConcursoRequest request) {
        Concurso concurso = new Concurso();
        aplicarDatos(concurso, request);
        return ConcursoResponse.from(concursoRepository.save(concurso));
    }

    @Override
    @Transactional
    public ConcursoResponse actualizar(Long id, ConcursoRequest request) {
        Concurso concurso = buscarConcurso(id);
        aplicarDatos(concurso, request);
        return ConcursoResponse.from(concursoRepository.save(concurso));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Concurso concurso = buscarConcurso(id);
        concursoRepository.delete(concurso);
    }

    private void aplicarDatos(Concurso concurso, ConcursoRequest request) {
        if (request.getFechaFin() != null
                && request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new BusinessException(
                    "La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        concurso.setNombre(request.getNombre().trim());
        concurso.setBannerUrl(limpiar(request.getBannerUrl()));
        concurso.setFechaInicio(request.getFechaInicio());
        concurso.setFechaFin(request.getFechaFin());
        concurso.setLugar(request.getLugar().trim());

        if (request.getEstado() != null) {
            concurso.setEstado(request.getEstado());
        } else if (concurso.getEstado() == null) {
            concurso.setEstado(EstadoConcurso.BORRADOR);
        }

        // Actualizar en sitio las categorías que se conservan para evitar
        // conflictos con la restricción única (id_concurso, id_categoria).
        Map<Long, ConcursoCategoria> existentes = concurso.getCategorias().stream()
                .collect(Collectors.toMap(
                        cc -> cc.getCategoria().getId(),
                        cc -> cc
                ));

        Set<Long> categoriasSolicitadas = new HashSet<>();

        for (ConcursoCategoriaRequest item : request.getCategorias()) {
            if (!categoriasSolicitadas.add(item.getCategoriaId())) {
                throw new BusinessException("No se puede repetir una categoría en el concurso");
            }

            ConcursoCategoria asignacion = existentes.get(item.getCategoriaId());

            if (asignacion != null) {
                asignacion.setCupo(item.getCupo());
                asignacion.setPrecio(item.getPrecio());
                continue;
            }

            Categoria categoria = categoriaRepository.findById(item.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Categoría no encontrada: " + item.getCategoriaId()));

            if (!Boolean.TRUE.equals(categoria.getActiva())
                    && !existentes.containsKey(item.getCategoriaId())) {
                throw new BusinessException(
                        "La categoría \"" + categoria.getNombre() + "\" está inactiva");
            }

            asignacion = ConcursoCategoria.builder()
                    .categoria(categoria)
                    .cupo(item.getCupo())
                    .precio(item.getPrecio())
                    .build();

            concurso.addCategoria(asignacion);
        }

        concurso.getCategorias().removeIf(
                cc -> !categoriasSolicitadas.contains(cc.getCategoria().getId()));
    }

    private Concurso buscarConcurso(Long id) {
        return concursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concurso no encontrado"));
    }

    private String limpiar(String valor) {
        if (valor == null) {
            return null;
        }
        String limpio = valor.trim();
        return limpio.isEmpty() ? null : limpio;
    }
}
