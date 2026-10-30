package com.entrepanuelo.dance.dto.inscripcion;

import com.entrepanuelo.dance.entity.Notificacion;
import com.entrepanuelo.dance.entity.enums.TipoNotificacion;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacionResponse {

    private Long id;
    private TipoNotificacion tipo;
    private String mensaje;
    private Long referenciaId;
    private Boolean leida;
    private LocalDateTime createdAt;

    public static NotificacionResponse from(Notificacion n) {
        return NotificacionResponse.builder()
                .id(n.getId())
                .tipo(n.getTipo())
                .mensaje(n.getMensaje())
                .referenciaId(n.getReferenciaId())
                .leida(n.getLeida())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
