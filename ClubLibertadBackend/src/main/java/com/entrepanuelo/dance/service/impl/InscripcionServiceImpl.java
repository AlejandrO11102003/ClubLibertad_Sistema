package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.inscripcion.InscripcionRequest;
import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.entity.Concurso;
import com.entrepanuelo.dance.entity.ConcursoCategoria;
import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import com.entrepanuelo.dance.entity.enums.TipoNotificacion;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ForbiddenException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.ConcursoRepository;
import com.entrepanuelo.dance.repository.InscripcionRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.InscripcionService;
import com.entrepanuelo.dance.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InscripcionServiceImpl implements InscripcionService {

    private static final List<EstadoInscripcion> ESTADOS_ACTIVOS =
            List.of(EstadoInscripcion.PENDIENTE, EstadoInscripcion.CONFIRMADA);

    private static final int DIAS_VIGENCIA_SOLICITUD = 7;

    private final InscripcionRepository inscripcionRepository;
    private final ConcursoRepository concursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;

    @Override
    @Transactional
    public InscripcionResponse crear(String dni, InscripcionRequest request) {
        Usuario solicitante = buscarUsuario(dni);

        Concurso concurso = concursoRepository.findById(request.getConcursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Concurso no encontrado"));

        if (concurso.getEstado() != EstadoConcurso.PUBLICADO) {
            throw new BusinessException("El concurso no está abierto para inscripciones");
        }

        ConcursoCategoria asignacion = concurso.getCategorias().stream()
                .filter(cc -> cc.getCategoria().getId().equals(request.getCategoriaId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        "La categoría seleccionada no pertenece al concurso"));

        if (solicitante.getDni().equals(request.getParejaDni())) {
            throw new BusinessException("No puedes invitarte a ti mismo como pareja");
        }

        TipoDocumento tipoDocumento = request.getParejaTipoDocumento() == null
                ? TipoDocumento.DNI
                : request.getParejaTipoDocumento();

        Usuario pareja = usuarioRepository.findByTipoDocumentoAndDni(
                        tipoDocumento, request.getParejaDni())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un bailarín registrado con ese DNI"));

        if (pareja.getRol() != Rol.BAILARIN) {
            throw new BusinessException("El usuario encontrado no es un bailarín");
        }

        if (!Boolean.TRUE.equals(pareja.getActivo())) {
            throw new BusinessException("La cuenta de la pareja no está activa");
        }

        validarSinInscripcionActiva(
                concurso.getId(), asignacion.getCategoria().getId(), solicitante.getId(),
                "Ya tienes una inscripción activa en esta categoría");

        validarSinInscripcionActiva(
                concurso.getId(), asignacion.getCategoria().getId(), pareja.getId(),
                "Tu pareja ya tiene una inscripción activa en esta categoría");

        LocalDateTime ahora = LocalDateTime.now();

        Inscripcion inscripcion = Inscripcion.builder()
                .concurso(concurso)
                .categoria(asignacion.getCategoria())
                .solicitante(solicitante)
                .pareja(pareja)
                .estado(EstadoInscripcion.PENDIENTE)
                .fechaSolicitud(ahora)
                .fechaVencimiento(ahora.plusDays(DIAS_VIGENCIA_SOLICITUD))
                .build();

        Inscripcion guardada = inscripcionRepository.save(inscripcion);

        notificacionService.crear(
                pareja,
                TipoNotificacion.SOLICITUD_PAREJA,
                nombreCompleto(solicitante) + " te invitó a participar en \""
                        + concurso.getNombre() + "\" (" + asignacion.getCategoria().getNombre() + ")",
                guardada.getId());

        return InscripcionResponse.from(guardada);
    }

    @Override
    @Transactional
    public List<InscripcionResponse> listarMias(String dni) {
        Usuario usuario = buscarUsuario(dni);
        List<Inscripcion> inscripciones =
                inscripcionRepository.listarPorUsuario(usuario.getId());

        actualizarVencidas(inscripciones);

        return inscripciones.stream()
                .map(InscripcionResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public List<InscripcionResponse> listarPendientes(String dni) {
        Usuario usuario = buscarUsuario(dni);
        List<Inscripcion> pendientes =
                inscripcionRepository.findByPareja_IdAndEstadoOrderByFechaSolicitudDesc(
                        usuario.getId(), EstadoInscripcion.PENDIENTE);

        actualizarVencidas(pendientes);

        return pendientes.stream()
                .filter(i -> i.getEstado() == EstadoInscripcion.PENDIENTE)
                .map(InscripcionResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public InscripcionResponse aceptar(String dni, Long id) {
        Inscripcion inscripcion = buscarInscripcion(id);
        Usuario usuario = buscarUsuario(dni);

        validarRespuesta(inscripcion, usuario);

        inscripcion.setEstado(EstadoInscripcion.CONFIRMADA);
        inscripcion.setFechaRespuesta(LocalDateTime.now());
        Inscripcion guardada = inscripcionRepository.save(inscripcion);

        notificacionService.crear(
                guardada.getSolicitante(),
                TipoNotificacion.SOLICITUD_ACEPTADA,
                nombreCompleto(usuario) + " aceptó tu solicitud para \""
                        + guardada.getConcurso().getNombre() + "\" ("
                        + guardada.getCategoria().getNombre() + ")",
                guardada.getId());

        return InscripcionResponse.from(guardada);
    }

    @Override
    @Transactional
    public InscripcionResponse rechazar(String dni, Long id) {
        Inscripcion inscripcion = buscarInscripcion(id);
        Usuario usuario = buscarUsuario(dni);

        validarRespuesta(inscripcion, usuario);

        inscripcion.setEstado(EstadoInscripcion.RECHAZADA);
        inscripcion.setFechaRespuesta(LocalDateTime.now());
        Inscripcion guardada = inscripcionRepository.save(inscripcion);

        notificacionService.crear(
                guardada.getSolicitante(),
                TipoNotificacion.SOLICITUD_RECHAZADA,
                nombreCompleto(usuario) + " rechazó tu solicitud para \""
                        + guardada.getConcurso().getNombre() + "\" ("
                        + guardada.getCategoria().getNombre() + ")",
                guardada.getId());

        return InscripcionResponse.from(guardada);
    }

    private void validarRespuesta(Inscripcion inscripcion, Usuario usuario) {
        if (!inscripcion.getPareja().getId().equals(usuario.getId())) {
            throw new ForbiddenException("Solo la pareja invitada puede responder esta solicitud");
        }

        if (inscripcion.getEstado() != EstadoInscripcion.PENDIENTE) {
            throw new BusinessException("La solicitud ya fue respondida");
        }

        if (inscripcion.getFechaVencimiento().isBefore(LocalDateTime.now())) {
            inscripcion.setEstado(EstadoInscripcion.VENCIDA);
            inscripcionRepository.save(inscripcion);
            throw new BusinessException("La solicitud venció y ya no puede responderse");
        }
    }

    private void validarSinInscripcionActiva(Long concursoId, Long categoriaId,
                                             Long usuarioId, String mensaje) {
        long activas = inscripcionRepository.contarActivas(
                concursoId, categoriaId, usuarioId, ESTADOS_ACTIVOS);

        if (activas > 0) {
            throw new BusinessException(mensaje);
        }
    }

    private void actualizarVencidas(List<Inscripcion> inscripciones) {
        LocalDateTime ahora = LocalDateTime.now();

        for (Inscripcion inscripcion : inscripciones) {
            if (inscripcion.getEstado() == EstadoInscripcion.PENDIENTE
                    && inscripcion.getFechaVencimiento().isBefore(ahora)) {
                inscripcion.setEstado(EstadoInscripcion.VENCIDA);
                inscripcionRepository.save(inscripcion);
            }
        }
    }

    private Inscripcion buscarInscripcion(Long id) {
        return inscripcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud no encontrada"));
    }

    private Usuario buscarUsuario(String dni) {
        return usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    private String nombreCompleto(Usuario usuario) {
        if (usuario.getPerfil() == null) {
            return "Un bailarín";
        }

        String nombre = usuario.getPerfil().getNombre() != null
                ? usuario.getPerfil().getNombre() : "";
        String apellido = usuario.getPerfil().getApellido() != null
                ? usuario.getPerfil().getApellido() : "";
        String completo = (nombre + " " + apellido).trim();

        return completo.isEmpty() ? "Un bailarín" : completo;
    }
}
