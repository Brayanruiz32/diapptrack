package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.RegisterRequest;
import com.diapptrack.backend.dto.response.UserResponse;
import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.exception.BusinessException;
import com.diapptrack.backend.repository.UserRepository;
import com.diapptrack.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("El correo electrónico ya está registrado");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.PATIENT)
                .active(true)
                .build();

        return UserResponse.from(userRepository.save(user));
    }
}
