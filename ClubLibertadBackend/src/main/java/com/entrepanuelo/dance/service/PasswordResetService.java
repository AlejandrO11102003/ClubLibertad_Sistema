package com.entrepanuelo.dance.service;

import com.entrepanuelo.dance.dto.auth.ForgotPasswordRequest;
import com.entrepanuelo.dance.dto.auth.ResetPasswordRequest;

public interface PasswordResetService {

    String requestReset(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
