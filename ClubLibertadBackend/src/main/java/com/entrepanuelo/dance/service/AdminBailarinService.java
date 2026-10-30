package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.admin.AdminBailarinResponse;

import java.util.List;

public interface AdminBailarinService {

    List<AdminBailarinResponse> listar(String texto, Boolean activo, String categoria);

    AdminBailarinResponse obtener(Long id);

    AdminBailarinResponse cambiarActivo(String dniAdmin, Long id, boolean activo);
}
