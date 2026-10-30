package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {

    @Query("""
            select i from Inscripcion i
            where i.solicitante.id = :usuarioId or i.pareja.id = :usuarioId
            order by i.fechaSolicitud desc
            """)
    List<Inscripcion> listarPorUsuario(@Param("usuarioId") Long usuarioId);

    List<Inscripcion> findByPareja_IdAndEstadoOrderByFechaSolicitudDesc(
            Long parejaId,
            EstadoInscripcion estado
    );

    long countByEstado(EstadoInscripcion estado);

    List<Inscripcion> findTop5ByOrderByFechaSolicitudDesc();

    long countBySolicitante_IdOrPareja_Id(Long solicitanteId, Long parejaId);

    @Query("""
            select count(i) from Inscripcion i
            where i.concurso.id = :concursoId
              and i.categoria.id = :categoriaId
              and (i.solicitante.id = :usuarioId or i.pareja.id = :usuarioId)
              and i.estado in :estados
            """)
    long contarActivas(
            @Param("concursoId") Long concursoId,
            @Param("categoriaId") Long categoriaId,
            @Param("usuarioId") Long usuarioId,
            @Param("estados") Collection<EstadoInscripcion> estados
    );

    @Query("""
            select i from Inscripcion i
            where i.concurso.id = :concursoId
              and i.categoria.id = :categoriaId
              and i.estado = :estado
              and (
                    (i.solicitante.dni = :dni1 and i.pareja.dni = :dni2)
                 or (i.solicitante.dni = :dni2 and i.pareja.dni = :dni1)
              )
            """)
    Optional<Inscripcion> buscarConfirmadaPorPareja(
            @Param("concursoId") Long concursoId,
            @Param("categoriaId") Long categoriaId,
            @Param("dni1") String dni1,
            @Param("dni2") String dni2,
            @Param("estado") EstadoInscripcion estado
    );

    @Query("""
            select i from Inscripcion i
            where (:concursoId is null or i.concurso.id = :concursoId)
              and (:categoriaId is null or i.categoria.id = :categoriaId)
              and (:estado is null or i.estado = :estado)
            order by i.fechaSolicitud desc
            """)
    List<Inscripcion> listarAdmin(
            @Param("concursoId") Long concursoId,
            @Param("categoriaId") Long categoriaId,
            @Param("estado") EstadoInscripcion estado
    );
}
