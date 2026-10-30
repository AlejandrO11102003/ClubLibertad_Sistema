package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.inscripcion.NotificacionResponse;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.TipoNotificacion;

import java.util.List;

public interface NotificacionService {

    void crear(Usuario destinatario, TipoNotificacion tipo, String mensaje, Long referenciaId);

    List<NotificacionResponse> listar(String dni);

    long contarNoLeidas(String dni);

    void marcarLeida(String dni, Long id);

    void marcarTodasLeidas(String dni);
}
