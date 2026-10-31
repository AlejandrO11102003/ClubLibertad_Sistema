package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.inscripcion.BailarinBusquedaResponse;
import com.entrepanuelo.dance.dto.inscripcion.BailarinDestacadoResponse;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.BailarinService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BailarinServiceImpl implements BailarinService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public BailarinBusquedaResponse buscarPorDni(
            String dniActual, TipoDocumento tipoDocumento, String dniBuscado) {
        if (dniActual.equals(dniBuscado)) {
            throw new BusinessException("No puedes buscarte a ti mismo como pareja");
        }

        Usuario usuario = usuarioRepository.findByTipoDocumentoAndDni(tipoDocumento, dniBuscado)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un bailarín registrado con ese DNI"));

        if (usuario.getRol() != Rol.BAILARIN) {
            throw new BusinessException("El usuario encontrado no es un bailarín");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new BusinessException("La cuenta del bailarín no está activa");
        }

        return BailarinBusquedaResponse.from(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BailarinDestacadoResponse> listarDestacados(int limite) {
        int cantidad = Math.max(1, Math.min(limite, 24));

        return usuarioRepository
                .listarDestacados(Rol.BAILARIN, PageRequest.of(0, cantidad))
                .stream()
                .map(BailarinDestacadoResponse::from)
                .toList();
    }
}
