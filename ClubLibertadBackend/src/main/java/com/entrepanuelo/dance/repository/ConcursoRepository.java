package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Concurso;
import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface ConcursoRepository extends JpaRepository<Concurso, Long> {

    List<Concurso> findByEstadoInOrderByFechaInicioAsc(Collection<EstadoConcurso> estados);

    List<Concurso> findAllByOrderByCreatedAtDesc();

    long countByEstado(EstadoConcurso estado);

    List<Concurso> findTop5ByEstadoAndFechaInicioGreaterThanEqualOrderByFechaInicioAsc(
            EstadoConcurso estado,
            LocalDate fecha
    );
}
