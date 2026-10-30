package com.entrepanuelo.dance.entity;

import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "concursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Concurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_concurso")
    private Long id;

    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(name = "lugar", nullable = false, length = 200)
    private String lugar;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoConcurso estado = EstadoConcurso.BORRADOR;

    @Builder.Default
    @OneToMany(mappedBy = "concurso", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ConcursoCategoria> categorias = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addCategoria(ConcursoCategoria categoria) {
        categoria.setConcurso(this);
        this.categorias.add(categoria);
    }
}
