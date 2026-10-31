package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.anuncio.ImagenSubidaResponse;
import com.entrepanuelo.dance.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

/**
 * Guarda los flyers de los anuncios en disco y devuelve la URL pública
 * servida por {@link com.entrepanuelo.dance.config.WebConfig}.
 */
@Service
@Slf4j
public class ImagenAnuncioService {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final String CARPETA = "anuncios";
    private static final String PREFIJO_URL = "/uploads/anuncios/";

    private final Path carpeta;

    public ImagenAnuncioService(@Value("${app.uploads.dir:./uploads}") String directorio) {
        this.carpeta = Paths.get(directorio, CARPETA).toAbsolutePath().normalize();
    }

    public ImagenSubidaResponse guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BusinessException("Selecciona una imagen para el anuncio");
        }

        if (archivo.getSize() > MAX_BYTES) {
            throw new BusinessException("La imagen no puede superar los 5 MB");
        }

        String extension = detectarExtension(archivo);

        if (extension == null) {
            throw new BusinessException("Formato no permitido. Usa una imagen JPG, PNG o WEBP");
        }

        String nombre = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        try {
            Files.createDirectories(carpeta);

            try (InputStream entrada = archivo.getInputStream()) {
                Files.copy(entrada, carpeta.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            log.error("No se pudo guardar la imagen del anuncio", ex);
            throw new BusinessException("No se pudo guardar la imagen. Inténtalo nuevamente.");
        }

        return ImagenSubidaResponse.builder()
                .url(PREFIJO_URL + nombre)
                .build();
    }

    public void eliminar(String url) {
        if (url == null || !url.startsWith(PREFIJO_URL)) {
            return;
        }

        String nombre = url.substring(PREFIJO_URL.length());

        if (nombre.isBlank() || nombre.contains("/") || nombre.contains("\\") || nombre.contains("..")) {
            return;
        }

        try {
            Files.deleteIfExists(carpeta.resolve(nombre));
        } catch (IOException ex) {
            log.warn("No se pudo eliminar la imagen {} del anuncio", nombre, ex);
        }
    }

    /**
     * Valida el contenido real del archivo (firma binaria), no solo su extensión.
     */
    private String detectarExtension(MultipartFile archivo) {
        byte[] cabecera = new byte[12];

        try (InputStream entrada = archivo.getInputStream()) {
            int leidos = entrada.read(cabecera);

            if (leidos < 12) {
                return null;
            }
        } catch (IOException ex) {
            return null;
        }

        if (esJpeg(cabecera)) {
            return "jpg";
        }

        if (esPng(cabecera)) {
            return "png";
        }

        if (esWebp(cabecera)) {
            return "webp";
        }

        return null;
    }

    private boolean esJpeg(byte[] cabecera) {
        return (cabecera[0] & 0xFF) == 0xFF
                && (cabecera[1] & 0xFF) == 0xD8
                && (cabecera[2] & 0xFF) == 0xFF;
    }

    private boolean esPng(byte[] cabecera) {
        return (cabecera[0] & 0xFF) == 0x89
                && cabecera[1] == 'P'
                && cabecera[2] == 'N'
                && cabecera[3] == 'G'
                && (cabecera[4] & 0xFF) == 0x0D
                && (cabecera[5] & 0xFF) == 0x0A
                && (cabecera[6] & 0xFF) == 0x1A
                && (cabecera[7] & 0xFF) == 0x0A;
    }

    private boolean esWebp(byte[] cabecera) {
        String riff = new String(cabecera, 0, 4, java.nio.charset.StandardCharsets.US_ASCII);
        String webp = new String(cabecera, 8, 4, java.nio.charset.StandardCharsets.US_ASCII);
        return "RIFF".equals(riff.toUpperCase(Locale.ROOT))
                && "WEBP".equals(webp.toUpperCase(Locale.ROOT));
    }
}
