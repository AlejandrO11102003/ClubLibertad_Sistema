package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Admirador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdmiradorRepository extends JpaRepository<Admirador, Long> {

    long countByAdmirado_Id(Long usuarioId);

    boolean existsByAdmirador_IdAndAdmirado_Id(Long admiradorId, Long admiradoId);

    void deleteByAdmirador_IdAndAdmirado_Id(Long admiradorId, Long admiradoId);
}
