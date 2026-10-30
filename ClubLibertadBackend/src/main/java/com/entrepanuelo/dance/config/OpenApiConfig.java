package com.entrepanuelo.dance.config;



import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI entrePanuelosOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Entre Pañuelos API")
                        .description("API REST para la gestión de concursos de marinera y trayectoria competitiva")
                        .version("v0.1.0")
                        .contact(new Contact().name("Equipo Entre Pañuelos")));
    }
}