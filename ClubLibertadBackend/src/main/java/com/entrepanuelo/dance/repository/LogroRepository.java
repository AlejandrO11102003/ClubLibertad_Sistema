package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Logro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogroRepository extends JpaRepository<Logro, Long> {

    List<Logro> findByUsuario_IdOrderByFechaDesc(Long usuarioId);

    @Modifying
    @Query("delete from Logro l where l.usuario.id = :usuarioId")
    void eliminarPorUsuario(@Param("usuarioId") Long usuarioId);
}
