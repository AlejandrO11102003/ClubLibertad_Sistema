package com.entrepanuelo.dance.entity;

import com.entrepanuelo.dance.entity.enums.EstadoImportacion;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "importaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Importacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_importacion")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "archivo", nullable = false, length = 255)
    private String archivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoImportacion estado;

    @Column(name = "filas_validas", nullable = false)
    private Integer filasValidas;

    @Column(name = "filas_invalidas", nullable = false)
    private Integer filasInvalidas;

    @Column(name = "detalle_errores", columnDefinition = "TEXT")
    private String detalleErrores;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
