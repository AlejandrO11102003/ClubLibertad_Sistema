package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.inscripcion.NotificacionResponse;
import com.entrepanuelo.dance.entity.Notificacion;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.TipoNotificacion;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.NotificacionRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public void crear(Usuario destinatario, TipoNotificacion tipo,
                      String mensaje, Long referenciaId) {
        Notificacion notificacion = Notificacion.builder()
                .destinatario(destinatario)
                .tipo(tipo)
                .mensaje(mensaje)
                .referenciaId(referenciaId)
                .leida(false)
                .build();

        notificacionRepository.save(notificacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificacionResponse> listar(String dni) {
        Usuario usuario = buscarUsuario(dni);
        return notificacionRepository
                .findByDestinatario_IdOrderByCreatedAtDesc(usuario.getId())
                .stream()
                .map(NotificacionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long contarNoLeidas(String dni) {
        Usuario usuario = buscarUsuario(dni);
        return notificacionRepository
                .countByDestinatario_IdAndLeidaFalse(usuario.getId());
    }

    @Override
    @Transactional
    public void marcarLeida(String dni, Long id) {
        Usuario usuario = buscarUsuario(dni);

        Notificacion notificacion = notificacionRepository
                .findByIdAndDestinatario_Id(id, usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada"));

        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }

    @Override
    @Transactional
    public void marcarTodasLeidas(String dni) {
        Usuario usuario = buscarUsuario(dni);
        notificacionRepository.marcarTodasLeidas(usuario.getId());
    }

    private Usuario buscarUsuario(String dni) {
        return usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
