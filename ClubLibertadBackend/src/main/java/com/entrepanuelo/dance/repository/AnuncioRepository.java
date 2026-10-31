package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Anuncio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnuncioRepository extends JpaRepository<Anuncio, Long> {

    List<Anuncio> findAllByOrderByOrdenAscIdAsc();

    @Query("""
            SELECT a FROM Anuncio a
            WHERE a.activo = true
              AND (a.fechaInicio IS NULL OR a.fechaInicio <= :hoy)
              AND (a.fechaFin IS NULL OR a.fechaFin >= :hoy)
            ORDER BY a.orden ASC, a.id ASC
            """)
    List<Anuncio> findVigentes(@Param("hoy") LocalDate hoy);

    long countByActivoTrue();

    long countByActivoFalse();

    long countByImagenUrl(String imagenUrl);

    long countByImagenUrlAndIdNot(String imagenUrl, Long id);
}
