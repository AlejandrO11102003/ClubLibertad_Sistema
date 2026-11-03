package com.entrepanuelo.dance.service.impl;

import com.entrepanuelo.dance.dto.inscripcion.InscripcionResponse;
import com.entrepanuelo.dance.entity.Inscripcion;
import com.entrepanuelo.dance.entity.enums.EstadoInscripcion;
import com.entrepanuelo.dance.exception.ResourceNotFoundException;
import com.entrepanuelo.dance.repository.ConcursoRepository;
import com.entrepanuelo.dance.repository.InscripcionRepository;
import com.entrepanuelo.dance.service.AdminInscripcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.text.Normalizer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminInscripcionServiceImpl implements AdminInscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final ConcursoRepository concursoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InscripcionResponse> listar(Long concursoId, Long categoriaId,
                                            EstadoInscripcion estado, String texto) {
        List<Inscripcion> inscripciones =
                inscripcionRepository.listarAdmin(concursoId, categoriaId, estado);

        String filtro = normalizar(texto);
        if (filtro.isBlank()) {
            return inscripciones.stream().map(InscripcionResponse::from).toList();
        }

        return inscripciones.stream()
                .filter(i -> coincide(i, filtro))
                .map(InscripcionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InscripcionResponse obtener(Long id) {
        Inscripcion inscripcion = inscripcionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada"));

        return InscripcionResponse.from(inscripcion);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportar(Long concursoId) {
        var concurso = concursoRepository.findById(concursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Concurso no encontrado"));
        List<Inscripcion> inscripciones =
                inscripcionRepository.listarAdmin(concursoId, null, null);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            CellStyle headerStyle = crearEstiloEncabezado(workbook);
            Map<String, List<Inscripcion>> porCategoria = inscripciones.stream()
                    .collect(Collectors.groupingBy(
                            i -> i.getCategoria().getNombre(),
                            java.util.LinkedHashMap::new,
                            Collectors.toList()));

            if (porCategoria.isEmpty()) {
                crearHoja(workbook, headerStyle, "Sin inscripciones", List.of());
            } else {
                Set<String> nombresUsados = new HashSet<>();
                porCategoria.forEach((categoria, lista) -> crearHoja(
                        workbook, headerStyle, nombreHoja(categoria, nombresUsados), lista));
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No se pudo generar el Excel de inscripciones del concurso "
                            + concurso.getNombre(), exception);
        }
    }

    private void crearHoja(
            XSSFWorkbook workbook,
            CellStyle headerStyle,
            String nombre,
            List<Inscripcion> inscripciones) {
        Sheet sheet = workbook.createSheet(nombre);
        String[] encabezados = {
                "ID inscripción", "Solicitante", "Tipo documento solicitante",
                "Documento solicitante", "Pareja", "Tipo documento pareja",
                "Documento pareja", "Categoría", "Estado", "Fecha solicitud",
                "Fecha respuesta", "Fecha vencimiento"
        };

        Row header = sheet.createRow(0);
        for (int columna = 0; columna < encabezados.length; columna++) {
            Cell cell = header.createCell(columna);
            cell.setCellValue(encabezados[columna]);
            cell.setCellStyle(headerStyle);
        }

        for (int fila = 0; fila < inscripciones.size(); fila++) {
            Inscripcion inscripcion = inscripciones.get(fila);
            Row row = sheet.createRow(fila + 1);
            int columna = 0;
            row.createCell(columna++).setCellValue(inscripcion.getId());
            row.createCell(columna++).setCellValue(nombreCompleto(inscripcion.getSolicitante()));
            row.createCell(columna++).setCellValue(inscripcion.getSolicitante().getTipoDocumento().name());
            row.createCell(columna++).setCellValue(inscripcion.getSolicitante().getDni());
            row.createCell(columna++).setCellValue(nombreCompleto(inscripcion.getPareja()));
            row.createCell(columna++).setCellValue(inscripcion.getPareja().getTipoDocumento().name());
            row.createCell(columna++).setCellValue(inscripcion.getPareja().getDni());
            row.createCell(columna++).setCellValue(inscripcion.getCategoria().getNombre());
            row.createCell(columna++).setCellValue(inscripcion.getEstado().name());
            row.createCell(columna++).setCellValue(formatearFecha(inscripcion.getFechaSolicitud()));
            row.createCell(columna++).setCellValue(formatearFecha(inscripcion.getFechaRespuesta()));
            row.createCell(columna).setCellValue(formatearFecha(inscripcion.getFechaVencimiento()));
        }

        for (int columna = 0; columna < encabezados.length; columna++) {
            sheet.autoSizeColumn(columna);
        }
        sheet.createFreezePane(0, 1);
    }

    private CellStyle crearEstiloEncabezado(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private String nombreHoja(String categoria, Set<String> nombresUsados) {
        String base = categoria.replaceAll("[\\\\/*?:\\[\\]]", " ").trim();
        if (base.isBlank()) base = "Categoría";
        base = base.substring(0, Math.min(31, base.length()));
        String nombre = base;
        int contador = 2;
        while (!nombresUsados.add(nombre)) {
            String sufijo = " (" + contador++ + ")";
            nombre = base.substring(0, Math.min(31 - sufijo.length(), base.length())) + sufijo;
        }
        return nombre;
    }

    private String formatearFecha(LocalDateTime fecha) {
        return fecha == null ? "" : fecha.toString().replace('T', ' ');
    }

    private String nombreCompleto(com.entrepanuelo.dance.entity.Usuario usuario) {
        if (usuario.getPerfil() == null) return usuario.getDni();
        String nombre = (usuario.getPerfil().getNombre() + " "
                + usuario.getPerfil().getApellido()).trim();
        return nombre.isBlank() ? usuario.getDni() : nombre;
    }

    private boolean coincide(Inscripcion inscripcion, String filtro) {
        return normalizar(inscripcion.getSolicitante().getPerfil() != null
                        ? inscripcion.getSolicitante().getPerfil().getNombre()
                        : null).contains(filtro)
                || normalizar(inscripcion.getSolicitante().getPerfil() != null
                        ? inscripcion.getSolicitante().getPerfil().getApellido()
                        : null).contains(filtro)
                || normalizar(inscripcion.getPareja().getPerfil() != null
                        ? inscripcion.getPareja().getPerfil().getNombre()
                        : null).contains(filtro)
                || normalizar(inscripcion.getPareja().getPerfil() != null
                        ? inscripcion.getPareja().getPerfil().getApellido()
                        : null).contains(filtro)
                || normalizar(inscripcion.getConcurso().getNombre()).contains(filtro)
                || normalizar(inscripcion.getCategoria().getNombre()).contains(filtro);
    }

    private String normalizar(String valor) {
        if (valor == null) return "";

        return Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }
}
