package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.anuncio.AnuncioResponse;
import com.entrepanuelo.dance.entity.Anuncio;
import com.entrepanuelo.dance.repository.AnuncioRepository;
import com.entrepanuelo.dance.service.AnuncioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnuncioServiceImpl implements AnuncioService {

    private final AnuncioRepository anuncioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AnuncioResponse> listarVigentes() {
        LocalDate hoy = LocalDate.now();

        return anuncioRepository.findVigentes(hoy)
                .stream()
                .map(anuncio -> AnuncioResponse.from(anuncio, hoy))
                .toList();
    }
}
