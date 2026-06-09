package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.UpdateProfileRequest;
import com.diapptrack.backend.dto.response.UserResponse;
import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.exception.ResourceNotFoundException;
import com.diapptrack.backend.repository.UserRepository;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        return UserResponse.from(getByEmail(email));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getByEmail(email);
        user.setFullName(request.getFullName());
        user.setDni(request.getDni());
        user.setDiagnosisDate(request.getDiagnosisDate());
        if (request.getBirthDate() != null) user.setBirthDate(request.getBirthDate());
        if (request.getSex() != null) user.setSex(request.getSex());
        if (request.getWeightKg() != null) user.setWeightKg(request.getWeightKg());
        if (request.getHeightCm() != null) user.setHeightCm(request.getHeightCm());
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con id: " + id));
    }
}
