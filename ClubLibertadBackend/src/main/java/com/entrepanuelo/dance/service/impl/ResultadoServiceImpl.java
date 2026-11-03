package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.resultado.ImportacionResponse;
import com.entrepanuelo.dance.dto.resultado.ResultadoResponse;
import com.entrepanuelo.dance.entity.Concurso;
import com.entrepanuelo.dance.entity.ConcursoCategoria;
import com.entrepanuelo.dance.entity.Importacion;
import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.Resultado;
import com.entrepanuelo.dance.entity.Usuario;
import com.entrepanuelo.dance.entity.enums.EstadoConcurso;
import com.entrepanuelo.dance.entity.enums.EstadoImportacion;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import com.entrepanuelo.dance.entity.enums.EtapaResultado;
import com.entrepanuelo.dance.entity.enums.Rol;
import com.entrepanuelo.dance.exception.BusinessException;
import com.entrepanuelo.dance.exception.ForbiddenException;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.ConcursoRepository;
import com.entrepanuelo.dance.repository.ImportacionRepository;
import com.entrepanuelo.dance.repository.InscripcionRepository;
import com.entrepanuelo.dance.repository.ResultadoRepository;
import com.entrepanuelo.dance.repository.UsuarioRepository;
import com.entrepanuelo.dance.service.ResultadoService;
import com.entrepanuelo.dance.service.TrayectoriaService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ResultadoServiceImpl implements ResultadoService {

    private static final List<String> COLUMNAS_OBLIGATORIAS = List.of(
            "categoria", "dni_solicitante", "dni_pareja", "etapa");

    private final ResultadoRepository resultadoRepository;
    private final ImportacionRepository importacionRepository;
    private final InscripcionRepository inscripcionRepository;
    private final ConcursoRepository concursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TrayectoriaService trayectoriaService;

    @Override
    @Transactional
    public ImportacionResponse importar(String dniAdmin, Long concursoId, MultipartFile archivo) {
        Usuario admin = buscarAdmin(dniAdmin);

        if (archivo == null || archivo.isEmpty()) {
            throw new BusinessException("El archivo Excel es obligatorio");
        }

        String nombreArchivo = archivo.getOriginalFilename() != null
                ? archivo.getOriginalFilename()
                : "resultados.xlsx";

        String nombreLower = nombreArchivo.toLowerCase();
        if (!nombreLower.endsWith(".xlsx") && !nombreLower.endsWith(".xls")) {
            throw new BusinessException("El archivo debe tener formato .xlsx o .xls");
        }

        Concurso concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Concurso no encontrado"));

        if (concurso.getEstado() == EstadoConcurso.BORRADOR) {
            throw new BusinessException(
                    "El concurso debe estar publicado o cerrado para cargar resultados");
        }

        try (InputStream input = archivo.getInputStream();
             Workbook workbook = WorkbookFactory.create(input)) {

            return procesar(workbook, concurso, admin, nombreArchivo);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("No se pudo leer el archivo Excel: " + e.getMessage());
        }
    }

    private ImportacionResponse procesar(Workbook workbook, Concurso concurso,
                                         Usuario admin, String nombreArchivo) {
        if (workbook.getNumberOfSheets() == 0) {
            throw new BusinessException("El archivo Excel no contiene hojas");
        }

        Sheet sheet = workbook.getSheetAt(0);
        Row header = sheet.getRow(0);

        if (header == null) {
            throw new BusinessException("El archivo Excel no contiene la fila de encabezados");
        }

        DataFormatter formatter = new DataFormatter();
        Map<String, Integer> columnas = new HashMap<>();

        for (int c = 0; c < header.getLastCellNum(); c++) {
            Cell cell = header.getCell(c);
            if (cell == null) continue;

            String nombre = normalizar(formatter.formatCellValue(cell));
            if (!nombre.isBlank()) {
                columnas.put(nombre, c);
            }
        }

        List<String> faltantes = COLUMNAS_OBLIGATORIAS.stream()
                .filter(col -> !columnas.containsKey(col))
                .toList();

        if (!faltantes.isEmpty()) {
            throw new BusinessException(
                    "Faltan columnas obligatorias: " + String.join(", ", faltantes));
        }

        List<String> errores = new ArrayList<>();
        Set<String> clavesArchivo = new HashSet<>();
        Set<Usuario> afectados = new HashSet<>();
        int filasValidas = 0;

        for (int r = 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String categoriaNombre = valor(row, columnas.get("categoria"), formatter);
            String dniSolicitante = soloDigitos(valor(row, columnas.get("dni_solicitante"), formatter));
            String dniPareja = soloDigitos(valor(row, columnas.get("dni_pareja"), formatter));
            String etapaTexto = valor(row, columnas.get("etapa"), formatter);
            String posicionTexto = valor(row, columnas.get("posicion"), formatter);
            String puntajeTexto = valor(row, columnas.get("puntaje"), formatter);

            if (categoriaNombre.isBlank() && dniSolicitante.isBlank()
                    && dniPareja.isBlank() && etapaTexto.isBlank() && posicionTexto.isBlank()) {
                continue;
            }

            int numeroFila = r + 1;
            List<String> erroresFila = new ArrayList<>();

            if (categoriaNombre.isBlank()) {
                erroresFila.add("la categoría está vacía");
            }

            if (dniSolicitante.length() != 8) {
                erroresFila.add("el DNI del solicitante debe tener 8 dígitos");
            }

            if (dniPareja.length() != 8) {
                erroresFila.add("el DNI de la pareja debe tener 8 dígitos");
            }

            if (dniSolicitante.equals(dniPareja)) {
                erroresFila.add("los DNI de la pareja no pueden ser iguales");
            }

            EtapaResultado etapa = parseEtapa(etapaTexto, erroresFila);
            Integer posicion = parsePosicion(posicionTexto, erroresFila);
            BigDecimal puntaje = parsePuntaje(puntajeTexto, erroresFila);

            ConcursoCategoria asignacion = null;
            if (!categoriaNombre.isBlank()) {
                asignacion = buscarCategoria(concurso, categoriaNombre);
                if (asignacion == null) {
                    erroresFila.add("la categoría \"" + categoriaNombre + "\" no existe en el concurso");
                }
            }

            Inscripcion inscripcion = null;
            if (asignacion != null && dniSolicitante.length() == 8 && dniPareja.length() == 8
                    && !dniSolicitante.equals(dniPareja)) {
                inscripcion = inscripcionRepository
                        .buscarConfirmadaPorPareja(
                                concurso.getId(),
                                asignacion.getCategoria().getId(),
                                dniSolicitante,
                                dniPareja,
                                EstadoInscripcion.CONFIRMADA)
                        .orElse(null);

                if (inscripcion == null) {
                    erroresFila.add("no existe una inscripción confirmada para esa pareja en la categoría");
                }
            }

            if (asignacion != null && inscripcion != null) {
                String clave = asignacion.getCategoria().getId() + "-" + inscripcion.getId();
                if (!clavesArchivo.add(clave)) {
                    erroresFila.add("resultado duplicado para la misma pareja y categoría en el archivo");
                }
            }

            if (!erroresFila.isEmpty()) {
                errores.add("Fila " + numeroFila + ": " + String.join("; ", erroresFila));
                continue;
            }

            Resultado resultado = resultadoRepository
                    .findByConcurso_IdAndCategoria_IdAndInscripcion_Id(
                            concurso.getId(),
                            asignacion.getCategoria().getId(),
                            inscripcion.getId())
                    .orElseGet(Resultado::new);

            resultado.setConcurso(concurso);
            resultado.setCategoria(asignacion.getCategoria());
            resultado.setInscripcion(inscripcion);
            resultado.setEtapa(etapa);
            resultado.setPosicion(posicion);
            resultado.setPuntaje(puntaje);
            resultado.setPublicado(true);

            resultadoRepository.save(resultado);
            afectados.add(inscripcion.getSolicitante());
            afectados.add(inscripcion.getPareja());
            filasValidas++;
        }

        // ECU-10 / ECU-11: recalcular trayectoria y nivel de los bailarines afectados.
        for (Usuario afectado : afectados) {
            trayectoriaService.recalcular(afectado);
        }

        Importacion importacion = Importacion.builder()
                .usuario(admin)
                .archivo(nombreArchivo.length() > 255
                        ? nombreArchivo.substring(0, 255)
                        : nombreArchivo)
                .estado(errores.isEmpty()
                        ? EstadoImportacion.COMPLETADA
                        : EstadoImportacion.CON_ERRORES)
                .filasValidas(filasValidas)
                .filasInvalidas(errores.size())
                .detalleErrores(errores.isEmpty() ? null : String.join("\n", errores))
                .build();

        return ImportacionResponse.from(importacionRepository.save(importacion));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImportacionResponse> listarImportaciones(String dniAdmin) {
        buscarAdmin(dniAdmin);
        return importacionRepository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(ImportacionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResultadoResponse> listarResultados(String dniAdmin, Long concursoId) {
        buscarAdmin(dniAdmin);

        if (!concursoRepository.existsById(concursoId)) {
            throw new ResourceNotFoundException("Concurso no encontrado");
        }

        return resultadoRepository
                .findByConcurso_IdOrderByCategoria_NombreAscPosicionAsc(concursoId)
                .stream()
                .map(ResultadoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResultadoResponse> listarPublicosPorConcurso(Long concursoId) {
        if (!concursoRepository.existsById(concursoId)) {
            throw new ResourceNotFoundException("Concurso no encontrado");
        }

        return resultadoRepository
                .findByConcurso_IdAndPublicadoTrueOrderByCategoria_NombreAscPosicionAsc(concursoId)
                .stream()
                .map(ResultadoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResultadoResponse> listarMios(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return resultadoRepository
                .listarPublicadosPorUsuario(usuario.getId())
                .stream()
                .map(ResultadoResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarPlantilla(String dniAdmin, Long concursoId) {
        buscarAdmin(dniAdmin);

        Concurso concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Concurso no encontrado"));

        List<Inscripcion> inscripciones = inscripcionRepository.listarPorConcursoYEstado(
                concurso.getId(), EstadoInscripcion.CONFIRMADA);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Resultados");
            Row header = sheet.createRow(0);

            String[] columnas = {
                    "categoria", "dni_solicitante", "nombre_solicitante",
                    "dni_pareja", "nombre_pareja", "etapa", "posicion", "puntaje"
            };
            for (int i = 0; i < columnas.length; i++) {
                header.createCell(i).setCellValue(columnas[i]);
                sheet.setColumnWidth(i, 20 * 256);
            }

            for (int i = 0; i < inscripciones.size(); i++) {
                Inscripcion inscripcion = inscripciones.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(inscripcion.getCategoria().getNombre());
                row.createCell(1).setCellValue(inscripcion.getSolicitante().getDni());
                row.createCell(2).setCellValue(nombreCompleto(inscripcion.getSolicitante()));
                row.createCell(3).setCellValue(inscripcion.getPareja().getDni());
                row.createCell(4).setCellValue(nombreCompleto(inscripcion.getPareja()));
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (Exception e) {
            throw new BusinessException("No se pudo generar la plantilla Excel");
        }
    }

    private String nombreCompleto(Usuario usuario) {
        if (usuario.getPerfil() == null) {
            return "Bailarín";
        }

        String nombre = usuario.getPerfil().getNombre() != null
                ? usuario.getPerfil().getNombre() : "";
        String apellido = usuario.getPerfil().getApellido() != null
                ? usuario.getPerfil().getApellido() : "";
        return (nombre + " " + apellido).trim();
    }

    private Usuario buscarAdmin(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (usuario.getRol() != Rol.ADMIN) {
            throw new ForbiddenException("Solo un administrador puede gestionar resultados");
        }

        return usuario;
    }

    private ConcursoCategoria buscarCategoria(Concurso concurso, String nombre) {
        String objetivo = normalizar(nombre);

        for (ConcursoCategoria cc : concurso.getCategorias()) {
            String actual = normalizar(cc.getCategoria().getNombre());

            if (actual.equals(objetivo)
                    || actual.startsWith(objetivo + "_")
                    || objetivo.startsWith(actual + "_")) {
                return cc;
            }
        }

        return null;
    }

    private Integer parsePosicion(String valor, List<String> errores) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        try {
            int posicion = new BigDecimal(valor.replace(",", ".")).intValueExact();
            if (posicion <= 0) {
                errores.add("la posición debe ser mayor que cero");
                return null;
            }
            return posicion;
        } catch (Exception e) {
            errores.add("la posición debe ser un número entero");
            return null;
        }
    }

    private EtapaResultado parseEtapa(String valor, List<String> errores) {
        if (valor == null || valor.isBlank()) {
            errores.add("la etapa es obligatoria");
            return null;
        }

        try {
            return EtapaResultado.valueOf(normalizar(valor).toUpperCase());
        } catch (IllegalArgumentException e) {
            errores.add("la etapa debe ser ELIMINATORIA, SEMIFINAL o FINAL");
            return null;
        }
    }

    private BigDecimal parsePuntaje(String valor, List<String> errores) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        try {
            BigDecimal puntaje = new BigDecimal(valor.replace(",", "."));
            if (puntaje.signum() < 0) {
                errores.add("el puntaje no puede ser negativo");
                return null;
            }
            return puntaje;
        } catch (Exception e) {
            errores.add("el puntaje debe ser un número");
            return null;
        }
    }

    private String valor(Row row, Integer columna, DataFormatter formatter) {
        if (columna == null) return "";

        Cell cell = row.getCell(columna);
        return cell == null ? "" : formatter.formatCellValue(cell).trim();
    }

    private String soloDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("\\D", "");
    }

    private String normalizar(String valor) {
        if (valor == null) return "";

        String sinAcentos = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return sinAcentos.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }
}
