package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Resultado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultadoRepository extends JpaRepository<Resultado, Long> {

    Optional<Resultado> findByConcurso_IdAndCategoria_IdAndInscripcion_Id(
            Long concursoId,
            Long categoriaId,
            Long inscripcionId
    );

    List<Resultado> findByConcurso_IdOrderByCategoria_NombreAscPosicionAsc(Long concursoId);

    List<Resultado> findByConcurso_IdAndPublicadoTrueOrderByCategoria_NombreAscPosicionAsc(
            Long concursoId);

    long countByPublicadoTrue();

    @Query("""
            select count(distinct r) from Resultado r
            where r.inscripcion.solicitante.id = :usuarioId
               or r.inscripcion.pareja.id = :usuarioId
            """)
    long contarPorUsuario(@Param("usuarioId") Long usuarioId);

    @Query("""
            select r from Resultado r
            where r.publicado = true
              and (r.inscripcion.solicitante.id = :usuarioId
                or r.inscripcion.pareja.id = :usuarioId)
            order by r.concurso.fechaInicio desc, r.categoria.nombre asc, r.posicion asc
            """)
    List<Resultado> listarPublicadosPorUsuario(@Param("usuarioId") Long usuarioId);
}
