package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.anuncio.AnuncioRequest;
import com.entrepanuelo.dance.dto.anuncio.AnuncioResponse;
import com.entrepanuelo.dance.dto.anuncio.ImagenSubidaResponse;
import com.entrepanuelo.dance.dto.anuncio.MoverAnuncioRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminAnuncioService {

    List<AnuncioResponse> listarTodos();

    AnuncioResponse crear(AnuncioRequest request);

    AnuncioResponse actualizar(Long id, AnuncioRequest request);

    AnuncioResponse cambiarActivo(Long id, boolean activo);

    List<AnuncioResponse> mover(Long id, MoverAnuncioRequest.Direccion direccion);

    void eliminar(Long id);

    ImagenSubidaResponse subirImagen(MultipartFile archivo);
}
