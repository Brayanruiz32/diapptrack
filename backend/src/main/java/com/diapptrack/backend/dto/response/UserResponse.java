package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.User;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String dni;
    private User.Role role;
    private LocalDate birthDate;
    private LocalDate diagnosisDate;
    private User.Sex sex;
    private BigDecimal weightKg;
    private BigDecimal heightCm;
    private Boolean active;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .dni(user.getDni())
                .role(user.getRole())
                .birthDate(user.getBirthDate())
                .diagnosisDate(user.getDiagnosisDate())
                .sex(user.getSex())
                .weightKg(user.getWeightKg())
                .heightCm(user.getHeightCm())
                .active(user.getActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
