package com.diapptrack.backend.dto.request;

import com.diapptrack.backend.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 150)
    private String fullName;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 dígitos")
    private String dni;

    @Past
    private LocalDate birthDate;

    @PastOrPresent
    private LocalDate diagnosisDate;

    private User.Sex sex;

    @DecimalMin("20.0") @DecimalMax("300.0")
    private BigDecimal weightKg;

    @DecimalMin("50.0") @DecimalMax("250.0")
    private BigDecimal heightCm;
}
