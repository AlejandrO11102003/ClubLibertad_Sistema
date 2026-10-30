package com.entrepanuelo.dance.entity;




import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "perfiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_perfil")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "nombre", length = 100)
    private String nombre;

    @Column(name = "apellido", length = 100)
    private String apellido;

    @Column(name = "fotografia_url", length = 500)
    private String fotografiaUrl;

    @Column(name = "ciudad", length = 100)
    private String ciudad;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "genero", length = 20)
    private String genero;

    @Column(name = "categoria", length = 50)
    private String categoria;

    @Column(name = "anio_inicio")
    private Integer anioInicio;

    @Column(name = "academia_actual", length = 200)
    private String academiaActual;

    @Column(name = "marinera_favorita", length = 100)
    private String marineraFavorita;

    @Column(name = "biografia", length = 1000)
    private String biografia;

    @Column(name = "nivel_estrellas", precision = 2, scale = 1)
    private java.math.BigDecimal nivelEstrellas;

    @Column(name = "nivel_calculado_en")
    private LocalDateTime nivelCalculadoEn;

    @Builder.Default
    @Column(name = "total_concursos", nullable = false)
    private Integer totalConcursos = 0;

    @Builder.Default
    @Column(name = "total_participaciones", nullable = false)
    private Integer totalParticipaciones = 0;

    @Builder.Default
    @Column(name = "total_primeros", nullable = false)
    private Integer totalPrimeros = 0;

    @Column(name = "promedio_posicion", precision = 5, scale = 2)
    private java.math.BigDecimal promedioPosicion;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}