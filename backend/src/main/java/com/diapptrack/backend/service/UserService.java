package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.UpdateProfileRequest;
import com.diapptrack.backend.dto.response.UserResponse;
import com.diapptrack.backend.entity.User;

public interface UserService {
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, UpdateProfileRequest request);
    User getByEmail(String email);
    User getById(Long id);
}
