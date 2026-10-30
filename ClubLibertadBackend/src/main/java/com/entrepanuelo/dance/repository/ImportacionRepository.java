package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Importacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportacionRepository extends JpaRepository<Importacion, Long> {

    List<Importacion> findTop20ByOrderByCreatedAtDesc();

    List<Importacion> findTop5ByOrderByCreatedAtDesc();
}
