package com.entrepanuelo.dance.repository;

import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByDni(String dni);

    boolean existsByDni(String dni);

    Optional<Usuario> findByTipoDocumentoAndDni(TipoDocumento tipoDocumento, String dni);

    boolean existsByTipoDocumentoAndDni(TipoDocumento tipoDocumento, String dni);

    Optional<Usuario> findFirstByPerfil_EmailIgnoreCase(String email);

    long countByRol(Rol rol);

    List<Usuario> findByRolOrderByCreatedAtDesc(Rol rol);

    @Query("""
            select u from Usuario u left join u.perfil p
            where u.rol = :rol and u.activo = true
            order by coalesce(p.nivelEstrellas, 0) desc,
                     coalesce(p.totalPrimeros, 0) desc,
                     u.id asc
            """)
    List<Usuario> listarDestacados(@Param("rol") Rol rol, Pageable pageable);
}