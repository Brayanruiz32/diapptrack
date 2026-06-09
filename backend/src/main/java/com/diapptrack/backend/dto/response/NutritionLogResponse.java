package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.NutritionLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class NutritionLogResponse {
    private Long id;
    private LocalDate logDate;
    private Boolean ateFruits;
    private Boolean ateVegetables;
    private Boolean drankSugary;
    private Boolean ateFastFood;
    private Boolean respectedSchedule;
    private Boolean isHealthy;
    private LocalDateTime updatedAt;

    public static NutritionLogResponse from(NutritionLog log) {
        boolean healthy = Boolean.TRUE.equals(log.getAteFruits())
                && Boolean.TRUE.equals(log.getAteVegetables())
                && Boolean.FALSE.equals(log.getDrankSugary())
                && Boolean.FALSE.equals(log.getAteFastFood())
                && Boolean.TRUE.equals(log.getRespectedSchedule());

        return NutritionLogResponse.builder()
                .id(log.getId())
                .logDate(log.getLogDate())
                .ateFruits(log.getAteFruits())
                .ateVegetables(log.getAteVegetables())
                .drankSugary(log.getDrankSugary())
                .ateFastFood(log.getAteFastFood())
                .respectedSchedule(log.getRespectedSchedule())
                .isHealthy(healthy)
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}
