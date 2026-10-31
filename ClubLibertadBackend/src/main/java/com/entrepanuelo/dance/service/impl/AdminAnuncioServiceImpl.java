package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.anuncio.AnuncioRequest;
import com.entrepanuelo.dance.dto.anuncio.AnuncioResponse;
import com.entrepanuelo.dance.dto.anuncio.ImagenSubidaResponse;
import com.entrepanuelo.dance.dto.anuncio.MoverAnuncioRequest;
import com.entrepanuelo.dance.entity.Anuncio;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.AnuncioRepository;
import com.entrepanuelo.dance.service.AdminAnuncioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminAnuncioServiceImpl implements AdminAnuncioService {

    private static final Pattern ENLACE_EXTERNO = Pattern.compile("^https?://.+", Pattern.CASE_INSENSITIVE);

    private final AnuncioRepository anuncioRepository;
    private final ImagenAnuncioService imagenAnuncioService;

    @Override
    @Transactional(readOnly = true)
    public List<AnuncioResponse> listarTodos() {
        LocalDate hoy = LocalDate.now();

        return anuncioRepository.findAllByOrderByOrdenAscIdAsc()
                .stream()
                .map(anuncio -> AnuncioResponse.from(anuncio, hoy))
                .toList();
    }

    @Override
    @Transactional
    public AnuncioResponse crear(AnuncioRequest request) {
        Anuncio anuncio = Anuncio.builder()
                .titulo(request.getTitulo().trim())
                .entidad(limpiar(request.getEntidad()))
                .descripcion(limpiar(request.getDescripcion()))
                .imagenUrl(limpiar(request.getImagenUrl()))
                .enlaceUrl(normalizarEnlace(request.getEnlaceUrl()))
                .activo(request.getActivo() == null || request.getActivo())
                .orden(request.getOrden() != null ? request.getOrden() : siguienteOrden())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .build();

        return response(anuncioRepository.save(anuncio));
    }

    @Override
    @Transactional
    public AnuncioResponse actualizar(Long id, AnuncioRequest request) {
        Anuncio anuncio = buscar(id);
        String imagenAnterior = anuncio.getImagenUrl();
        String imagenNueva = limpiar(request.getImagenUrl());

        anuncio.setTitulo(request.getTitulo().trim());
        anuncio.setEntidad(limpiar(request.getEntidad()));
        anuncio.setDescripcion(limpiar(request.getDescripcion()));
        anuncio.setImagenUrl(imagenNueva);
        anuncio.setEnlaceUrl(normalizarEnlace(request.getEnlaceUrl()));
        anuncio.setFechaInicio(request.getFechaInicio());
        anuncio.setFechaFin(request.getFechaFin());

        if (request.getActivo() != null) {
            anuncio.setActivo(request.getActivo());
        }

        if (request.getOrden() != null) {
            anuncio.setOrden(request.getOrden());
        }

        Anuncio guardado = anuncioRepository.save(anuncio);

        if (imagenAnterior != null && !imagenAnterior.equals(imagenNueva)
                && anuncioRepository.countByImagenUrl(imagenAnterior) == 0) {
            imagenAnuncioService.eliminar(imagenAnterior);
        }

        return response(guardado);
    }

    @Override
    @Transactional
    public AnuncioResponse cambiarActivo(Long id, boolean activo) {
        Anuncio anuncio = buscar(id);
        anuncio.setActivo(activo);
        return response(anuncioRepository.save(anuncio));
    }

    @Override
    @Transactional
    public List<AnuncioResponse> mover(Long id, MoverAnuncioRequest.Direccion direccion) {
        List<Anuncio> anuncios = new ArrayList<>(anuncioRepository.findAllByOrderByOrdenAscIdAsc());
        int actual = -1;

        for (int i = 0; i < anuncios.size(); i++) {
            if (anuncios.get(i).getId().equals(id)) {
                actual = i;
                break;
            }
        }

        if (actual == -1) {
            throw new ResourceNotFoundException("Anuncio no encontrado");
        }

        int destino = direccion == MoverAnuncioRequest.Direccion.SUBIR ? actual - 1 : actual + 1;

        if (destino < 0 || destino >= anuncios.size()) {
            return listarTodos();
        }

        Anuncio movimiento = anuncios.remove(actual);
        anuncios.add(destino, movimiento);

        for (int i = 0; i < anuncios.size(); i++) {
            anuncios.get(i).setOrden(i);
        }

        anuncioRepository.saveAll(anuncios);

        return listarTodos();
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Anuncio anuncio = buscar(id);
        String imagen = anuncio.getImagenUrl();
        boolean imagenCompartida = imagen != null
                && anuncioRepository.countByImagenUrlAndIdNot(imagen, id) > 0;

        anuncioRepository.delete(anuncio);

        if (imagen != null && !imagenCompartida) {
            imagenAnuncioService.eliminar(imagen);
        }
    }

    @Override
    public ImagenSubidaResponse subirImagen(MultipartFile archivo) {
        return imagenAnuncioService.guardar(archivo);
    }

    private Anuncio buscar(Long id) {
        return anuncioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anuncio no encontrado"));
    }

    private AnuncioResponse response(Anuncio anuncio) {
        return AnuncioResponse.from(anuncio, LocalDate.now());
    }

    private int siguienteOrden() {
        return anuncioRepository.findAllByOrderByOrdenAscIdAsc()
                .stream()
                .map(Anuncio::getOrden)
                .filter(orden -> orden != null)
                .max(Integer::compareTo)
                .map(orden -> orden + 1)
                .orElse(0);
    }

    private String limpiar(String valor) {
        if (valor == null) return null;
        String limpio = valor.trim();
        return limpio.isEmpty() ? null : limpio;
    }

    private String normalizarEnlace(String valor) {
        String limpio = limpiar(valor);

        if (limpio == null) {
            return null;
        }

        if (limpio.startsWith("/") || ENLACE_EXTERNO.matcher(limpio).matches()) {
            return limpio;
        }

        throw new BusinessException("El enlace debe empezar con http://, https:// o /");
    }
}
