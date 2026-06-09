package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.RegisterRequest;
import com.diapptrack.backend.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
}
