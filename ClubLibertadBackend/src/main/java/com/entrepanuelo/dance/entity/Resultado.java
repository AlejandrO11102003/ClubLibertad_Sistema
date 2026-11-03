package com.entrepanuelo.dance.entity;

import com.entrepanuelo.dance.entity.enums.EtapaResultado;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "resultados",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_resultado_inscripcion",
        columnNames = {"id_concurso", "id_categoria", "id_inscripcion"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resultado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resultado")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_concurso", nullable = false)
    private Concurso concurso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_inscripcion", nullable = false)
    private Inscripcion inscripcion;

    @Column(name = "posicion")
    private Integer posicion;

    @Enumerated(EnumType.STRING)
    @Column(name = "etapa", nullable = false, length = 20)
    private EtapaResultado etapa;

    @Column(name = "puntaje", precision = 10, scale = 2)
    private BigDecimal puntaje;

    @Builder.Default
    @Column(name = "publicado", nullable = false)
    private Boolean publicado = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
