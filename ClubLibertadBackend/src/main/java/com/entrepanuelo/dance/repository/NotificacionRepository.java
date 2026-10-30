package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByDestinatario_IdOrderByCreatedAtDesc(Long destinatarioId);

    long countByDestinatario_IdAndLeidaFalse(Long destinatarioId);

    Optional<Notificacion> findByIdAndDestinatario_Id(Long id, Long destinatarioId);

    @Modifying
    @Query("""
            update Notificacion n
            set n.leida = true
            where n.destinatario.id = :usuarioId and n.leida = false
            """)
    int marcarTodasLeidas(@Param("usuarioId") Long usuarioId);
}
