package com.entrepanuelo.dance.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Expone los archivos subidos (flyers de anuncios) en /uploads/**.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final Path carpetaUploads;

    public WebConfig(@Value("${app.uploads.dir:./uploads}") String directorio) {
        this.carpetaUploads = Paths.get(directorio).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String ubicacion = carpetaUploads.toUri().toString();

        if (!ubicacion.endsWith("/")) {
            ubicacion = ubicacion + "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(ubicacion)
                .setCachePeriod(3600);
    }
}
