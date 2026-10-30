package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.concurso.CategoriaResponse;
import com.entrepanuelo.dance.repository.CategoriaRepository;
import com.entrepanuelo.dance.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findByActivaTrueOrderByNombreAsc()
                .stream()
                .map(CategoriaResponse::from)
                .toList();
    }
}
