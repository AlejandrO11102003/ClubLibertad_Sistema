package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.admin.AdminDashboardResponse;
import com.entrepanuelo.dance.dto.concurso.ConcursoResponse;
import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.dto.resultado.ImportacionResponse;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.exception.ForbiddenException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.CategoriaRepository;
import com.entrepanuelo.dance.repository.ConcursoRepository;
import com.entrepanuelo.dance.repository.ImportacionRepository;
import com.entrepanuelo.dance.repository.InscripcionRepository;
import com.entrepanuelo.dance.repository.ResultadoRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UsuarioRepository usuarioRepository;
    private final ConcursoRepository concursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final ResultadoRepository resultadoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ImportacionRepository importacionRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse obtener(String dniAdmin) {
        validarAdmin(dniAdmin);

        return AdminDashboardResponse.builder()
                .bailarinesRegistrados(usuarioRepository.countByRol(Rol.BAILARIN))
                .concursosTotal(concursoRepository.count())
                .concursosPublicados(concursoRepository.countByEstado(EstadoConcurso.PUBLICADO))
                .concursosCerrados(concursoRepository.countByEstado(EstadoConcurso.CERRADO))
                .inscripcionesTotal(inscripcionRepository.count())
                .inscripcionesPendientes(
                        inscripcionRepository.countByEstado(EstadoInscripcion.PENDIENTE))
                .inscripcionesConfirmadas(
                        inscripcionRepository.countByEstado(EstadoInscripcion.CONFIRMADA))
                .resultadosPublicados(resultadoRepository.countByPublicadoTrue())
                .categoriasTotal(categoriaRepository.countByActivaTrue())
                .inscripcionesRecientes(
                        inscripcionRepository.findTop5ByOrderByFechaSolicitudDesc()
                                .stream()
                                .map(InscripcionResponse::from)
                                .toList())
                .proximosConcursos(
                        concursoRepository
                                .findTop5ByEstadoAndFechaInicioGreaterThanEqualOrderByFechaInicioAsc(
                                        EstadoConcurso.PUBLICADO, LocalDate.now())
                                .stream()
                                .map(ConcursoResponse::from)
                                .toList())
                .ultimasImportaciones(
                        importacionRepository.findTop5ByOrderByCreatedAtDesc()
                                .stream()
                                .map(ImportacionResponse::from)
                                .toList())
                .build();
    }

    private void validarAdmin(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (usuario.getRol() != Rol.ADMIN) {
            throw new ForbiddenException("Solo un administrador puede ver el dashboard");
        }
    }
}
