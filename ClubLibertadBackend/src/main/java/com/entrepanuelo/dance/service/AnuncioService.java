package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.anuncio.AnuncioResponse;

import java.util.List;

public interface AnuncioService {

    List<AnuncioResponse> listarVigentes();
}
