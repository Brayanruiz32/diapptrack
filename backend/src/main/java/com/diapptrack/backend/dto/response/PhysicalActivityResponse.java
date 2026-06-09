package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.PhysicalActivity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class PhysicalActivityResponse {
    private Long id;
    private Long activityTypeId;
    private String activityTypeName;
    private String activityTypeIcon;
    private LocalDate activityDate;
    private Integer durationMin;
    private Integer calories;
    private LocalDateTime createdAt;

    public static PhysicalActivityResponse from(PhysicalActivity pa) {
        return PhysicalActivityResponse.builder()
                .id(pa.getId())
                .activityTypeId(pa.getActivityType().getId())
                .activityTypeName(pa.getActivityType().getName())
                .activityTypeIcon(pa.getActivityType().getIcon())
                .activityDate(pa.getActivityDate())
                .durationMin(pa.getDurationMin())
                .calories(pa.getCalories())
                .createdAt(pa.getCreatedAt())
                .build();
    }
}
