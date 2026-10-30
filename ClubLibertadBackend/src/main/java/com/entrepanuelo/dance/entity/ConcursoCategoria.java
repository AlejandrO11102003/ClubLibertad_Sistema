package com.entrepanuelo.dance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "concurso_categorias",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_cc_concurso_categoria",
        columnNames = {"id_concurso", "id_categoria"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConcursoCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_concurso_categoria")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_concurso", nullable = false)
    private Concurso concurso;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @Column(name = "cupo")
    private Integer cupo;

    @Column(name = "precio", precision = 10, scale = 2)
    private BigDecimal precio;
}
