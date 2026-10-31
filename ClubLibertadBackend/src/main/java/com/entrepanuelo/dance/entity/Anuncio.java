package com.entrepanuelo.dance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "anuncios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_anuncio")
    private Long id;

    @Column(name = "titulo", nullable = false, length = 120)
    private String titulo;

    @Column(name = "entidad", length = 120)
    private String entidad;

    @Column(name = "descripcion", length = 300)
    private String descripcion;

    @Column(name = "imagen_url", nullable = false, length = 500)
    private String imagenUrl;

    @Column(name = "enlace_url", length = 500)
    private String enlaceUrl;

    @Builder.Default
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Builder.Default
    @Column(name = "orden", nullable = false)
    private Integer orden = 0;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Transient
    public boolean esVigente(LocalDate hoy) {
        boolean despuesDelInicio = fechaInicio == null || !fechaInicio.isAfter(hoy);
        boolean antesDelFin = fechaFin == null || !fechaFin.isBefore(hoy);
        return despuesDelInicio && antesDelFin;
    }
}
