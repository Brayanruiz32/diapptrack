package com.diapptrack.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AdminDashboardResponse {
    private long totalPatients;
    private long activePatients;
    private double avgMedicationAdherence;
    private double avgActivityMinutesPerWeek;
    private double avgHealthyNutritionPercent;
    private long totalEducationViews;
}
