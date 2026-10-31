package com.entrepanuelo.dance.security;



import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.TipoDocumento;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String identity) throws UsernameNotFoundException {
        String[] parts = identity.split(":", 2);
        TipoDocumento tipoDocumento;
        String documento;

        if (parts.length == 2) {
            try {
                tipoDocumento = TipoDocumento.valueOf(parts[0]);
            } catch (IllegalArgumentException ex) {
                throw new UsernameNotFoundException("Tipo de documento inválido");
            }
            documento = parts[1];
        } else {
            tipoDocumento = TipoDocumento.DNI;
            documento = identity;
        }

        Usuario u = usuarioRepository.findByTipoDocumentoAndDni(tipoDocumento, documento)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return User.builder()
                .username(u.getDni())
                .password(u.getPasswordHash())
                .disabled(!u.getActivo())
                .authorities(List.of(new SimpleGrantedAuthority(u.getRol().name())))
                .build();
    }
}