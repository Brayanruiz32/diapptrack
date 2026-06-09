package com.diapptrack.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
public class MedicationRequest {

    @NotBlank @Size(max = 150)
    private String name;

    @NotBlank @Size(max = 100)
    private String dose;

    /** Uno o varios horarios programados para el medicamento. */
    @NotEmpty(message = "Debe indicar al menos un horario")
    private List<@NotNull LocalTime> times;
}
