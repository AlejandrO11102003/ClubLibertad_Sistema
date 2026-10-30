package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.admin.CategoriaRequest;
import com.entrepanuelo.dance.dto.concurso.CategoriaResponse;
import com.entrepanuelo.dance.entity.Categoria;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.CategoriaRepository;
import com.entrepanuelo.dance.service.AdminCategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCategoriaServiceImpl implements AdminCategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(CategoriaResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombre = request.getNombre().trim();

        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new BusinessException("Ya existe una categoría con ese nombre");
        }

        Categoria categoria = Categoria.builder()
                .nombre(nombre)
                .edadMin(request.getEdadMin())
                .edadMax(request.getEdadMax())
                .genero(limpiar(request.getGenero()))
                .activa(request.getActiva() == null || request.getActiva())
                .build();

        return CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    @Override
    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscar(id);
        String nombre = request.getNombre().trim();

        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new BusinessException("Ya existe una categoría con ese nombre");
        }

        categoria.setNombre(nombre);
        categoria.setEdadMin(request.getEdadMin());
        categoria.setEdadMax(request.getEdadMax());
        categoria.setGenero(limpiar(request.getGenero()));

        if (request.getActiva() != null) {
            categoria.setActiva(request.getActiva());
        }

        return CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    @Override
    @Transactional
    public CategoriaResponse cambiarActiva(Long id, boolean activa) {
        Categoria categoria = buscar(id);
        categoria.setActiva(activa);
        return CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    private Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
    }

    private String limpiar(String valor) {
        if (valor == null) return null;
        String limpio = valor.trim();
        return limpio.isEmpty() ? null : limpio;
    }
}
