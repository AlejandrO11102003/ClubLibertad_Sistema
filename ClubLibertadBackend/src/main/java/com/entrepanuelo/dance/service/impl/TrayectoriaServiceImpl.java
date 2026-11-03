package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.trayectoria.LogroResponse;
import com.entrepanuelo.dance.dto.trayectoria.PerfilPublicoResponse;
import com.entrepanuelo.dance.dto.trayectoria.TrayectoriaItemResponse;
import com.entrepanuelo.dance.entity.Logro;
import com.entrepanuelo.dance.entity.Perfil;
import com.entrepanuelo.dance.entity.Resultado;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.TipoLogro;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.LogroRepository;
import com.entrepanuelo.dance.repository.ResultadoRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.repository.AdmiradorRepository;
import com.entrepanuelo.dance.service.TrayectoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TrayectoriaServiceImpl implements TrayectoriaService {

    private final UsuarioRepository usuarioRepository;
    private final ResultadoRepository resultadoRepository;
    private final LogroRepository logroRepository;
    private final AdmiradorRepository admiradorRepository;

    @Override
    @Transactional(readOnly = true)
    public PerfilPublicoResponse obtenerPublico(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Bailarín no encontrado"));
        return construir(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public PerfilPublicoResponse obtenerMia(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return construir(usuario);
    }

    @Override
    @Transactional
    public void recalcular(Usuario usuario) {
        Calculo calculo = calcular(usuario);

        Perfil perfil = usuario.getPerfil();
        if (perfil == null) {
            perfil = Perfil.builder().usuario(usuario).build();
            usuario.setPerfil(perfil);
        }

        perfil.setNivelEstrellas(calculo.nivelEstrellas());
        perfil.setNivelCalculadoEn(LocalDateTime.now());
        perfil.setTotalConcursos(calculo.totalConcursos());
        perfil.setTotalParticipaciones(calculo.totalParticipaciones());
        perfil.setTotalPrimeros(calculo.totalPrimeros());
        perfil.setPromedioPosicion(calculo.promedioPosicion());

        logroRepository.eliminarPorUsuario(usuario.getId());
        logroRepository.saveAll(calculo.logros());

        usuarioRepository.save(usuario);
    }

    private PerfilPublicoResponse construir(Usuario usuario) {
        Calculo calculo = calcular(usuario);
        Perfil perfil = usuario.getPerfil();
        List<Logro> logros = logroRepository
                .findByUsuario_IdOrderByFechaDesc(usuario.getId());

        return PerfilPublicoResponse.builder()
                .usuarioId(usuario.getId())
                .nombre(perfil != null ? perfil.getNombre() : null)
                .apellido(perfil != null ? perfil.getApellido() : null)
                .ciudad(perfil != null ? perfil.getCiudad() : null)
                .fotografiaUrl(perfil != null ? perfil.getFotografiaUrl() : null)
                .categoria(perfil != null ? perfil.getCategoria() : null)
                .academiaActual(perfil != null ? perfil.getAcademiaActual() : null)
                .anioInicio(perfil != null ? perfil.getAnioInicio() : null)
                .marineraFavorita(perfil != null ? perfil.getMarineraFavorita() : null)
                .biografia(perfil != null ? perfil.getBiografia() : null)
                .nivelEstrellas(calculo.nivelEstrellas())
                .nivelPendiente(calculo.nivelEstrellas() == null)
                .totalConcursos(calculo.totalConcursos())
                .totalParticipaciones(calculo.totalParticipaciones())
                .totalPrimeros(calculo.totalPrimeros())
                .totalSegundos(calculo.totalSegundos())
                .totalTerceros(calculo.totalTerceros())
                .totalAdmiradores(admiradorRepository.countByAdmirado_Id(usuario.getId()))
                .promedioPosicion(calculo.promedioPosicion())
                .mejorPosicion(calculo.mejorPosicion())
                .logros(logros.stream().map(LogroResponse::from).toList())
                .trayectoria(calculo.resultados().stream()
                        .map(r -> TrayectoriaItemResponse.from(r, usuario.getId()))
                        .toList())
                .build();
    }

    private Calculo calcular(Usuario usuario) {
        List<Resultado> resultados =
                resultadoRepository.listarPublicadosPorUsuario(usuario.getId());

        int total = (int) resultados.stream()
                .filter(resultado -> resultado.getPosicion() != null)
                .count();
        int totalConcursos = (int) resultados.stream()
                .map(r -> r.getConcurso().getId())
                .distinct()
                .count();

        int primeros = 0;
        int segundos = 0;
        int terceros = 0;
        int sumaPosiciones = 0;
        Integer mejorPosicion = null;

        for (Resultado resultado : resultados) {
            Integer posicion = resultado.getPosicion();
            if (posicion == null) {
                continue;
            }

            sumaPosiciones += posicion;
            mejorPosicion = mejorPosicion == null
                    ? posicion
                    : Math.min(mejorPosicion, posicion);

            if (posicion == 1) primeros++;
            if (posicion == 2) segundos++;
            if (posicion == 3) terceros++;
        }

        BigDecimal promedio = total == 0
                ? null
                : BigDecimal.valueOf((double) sumaPosiciones / total)
                        .setScale(2, RoundingMode.HALF_UP);

        BigDecimal nivel = calcularNivel(resultados, total, primeros, promedio);
        List<Logro> logros = construirLogros(usuario, resultados);

        return new Calculo(
                resultados,
                totalConcursos,
                total,
                primeros,
                segundos,
                terceros,
                promedio,
                mejorPosicion,
                nivel,
                logros);
    }

    private BigDecimal calcularNivel(List<Resultado> resultados, int total,
                                     int primeros, BigDecimal promedio) {
        if (total == 0 || promedio == null) {
            return null;
        }

        double rendimiento = clamp((11.0 - promedio.doubleValue()) / 10.0);
        double ratioPrimeros = (double) primeros / total;
        double experiencia = Math.min(total / 10.0, 1.0);

        int anioActual = LocalDate.now().getYear();
        int anioInicio = resultados.stream()
                .mapToInt(r -> r.getConcurso().getFechaInicio().getYear())
                .min()
                .orElse(anioActual);
        double trayectoria = Math.min(Math.max(0, anioActual - anioInicio) / 5.0, 1.0);

        double puntaje = 0.4 * rendimiento
                + 0.3 * ratioPrimeros
                + 0.2 * experiencia
                + 0.1 * trayectoria;

        double estrellas = Math.round(puntaje * 5 * 10.0) / 10.0;

        return BigDecimal.valueOf(estrellas).setScale(1, RoundingMode.HALF_UP);
    }

    private List<Logro> construirLogros(Usuario usuario, List<Resultado> resultados) {
        List<Logro> logros = new ArrayList<>();
        Set<String> claves = new HashSet<>();

        for (Resultado resultado : resultados) {
            TipoLogro tipo = switch (resultado.getPosicion()) {
                case 1 -> TipoLogro.CAMPEON;
                case 2 -> TipoLogro.SUBCAMPEON;
                case 3 -> TipoLogro.TERCER_LUGAR;
                default -> null;
            };

            if (tipo == null) continue;

            String clave = resultado.getConcurso().getId() + "-"
                    + resultado.getCategoria().getId() + "-" + tipo;

            if (!claves.add(clave)) continue;

            String descripcion = switch (tipo) {
                case CAMPEON -> "Campeón en ";
                case SUBCAMPEON -> "Subcampeón en ";
                case TERCER_LUGAR -> "Tercer lugar en ";
            } + resultado.getCategoria().getNombre()
              + " - " + resultado.getConcurso().getNombre();

            LocalDate fecha = resultado.getConcurso().getFechaFin() != null
                    ? resultado.getConcurso().getFechaFin()
                    : resultado.getConcurso().getFechaInicio();

            logros.add(Logro.builder()
                    .usuario(usuario)
                    .concurso(resultado.getConcurso())
                    .categoria(resultado.getCategoria())
                    .tipo(tipo)
                    .descripcion(descripcion)
                    .fecha(fecha)
                    .build());
        }

        return logros;
    }

    private double clamp(double valor) {
        return Math.max(0.0, Math.min(1.0, valor));
    }

    private record Calculo(
            List<Resultado> resultados,
            int totalConcursos,
            int totalParticipaciones,
            int totalPrimeros,
            int totalSegundos,
            int totalTerceros,
            BigDecimal promedioPosicion,
            Integer mejorPosicion,
            BigDecimal nivelEstrellas,
            List<Logro> logros
    ) {
    }
}
