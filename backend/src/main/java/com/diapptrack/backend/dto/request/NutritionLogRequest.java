package com.diapptrack.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class NutritionLogRequest {

    @NotNull
    private LocalDate logDate;

    @NotNull private Boolean ateFruits;
    @NotNull private Boolean ateVegetables;
    @NotNull private Boolean drankSugary;
    @NotNull private Boolean ateFastFood;
    @NotNull private Boolean respectedSchedule;
}
