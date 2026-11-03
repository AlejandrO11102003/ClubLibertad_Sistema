package com.entrepanuelo.dance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admiradores",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_admiradores_relacion",
                columnNames = {"id_admirador_usuario", "id_admirado_usuario"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admirador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_admirador")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_admirador_usuario", nullable = false)
    private Usuario admirador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_admirado_usuario", nullable = false)
    private Usuario admirado;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
