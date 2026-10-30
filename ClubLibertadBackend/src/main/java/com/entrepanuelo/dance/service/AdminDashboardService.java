package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.admin.AdminDashboardResponse;

public interface AdminDashboardService {

    AdminDashboardResponse obtener(String dniAdmin);
}
