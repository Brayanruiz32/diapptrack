package com.diapptrack.backend.dto.request;

import com.diapptrack.backend.entity.User;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AdminCreatePatientRequest {

    @NotBlank @Size(max = 150)
    private String fullName;

    @NotBlank @Email @Size(max = 150)
    private String email;

    @NotBlank @Size(min = 8, max = 100)
    private String password;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 dígitos")
    private String dni;

    private LocalDate birthDate;
    private LocalDate diagnosisDate;
    private User.Sex sex;

    @DecimalMin("20.0") @DecimalMax("300.0")
    private BigDecimal weightKg;

    @DecimalMin("50.0") @DecimalMax("250.0")
    private BigDecimal heightCm;
}
