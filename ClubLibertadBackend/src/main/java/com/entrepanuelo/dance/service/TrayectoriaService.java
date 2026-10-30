package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.trayectoria.PerfilPublicoResponse;
import com.entrepanuelo.dance.entity.Usuario;

public interface TrayectoriaService {

    PerfilPublicoResponse obtenerPublico(Long usuarioId);

    PerfilPublicoResponse obtenerMia(String dni);

    void recalcular(Usuario usuario);
}
