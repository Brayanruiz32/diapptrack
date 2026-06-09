package com.diapptrack.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data @Builder
public class PatientReportResponse {
    private Long patientId;
    private String patientName;
    private LocalDate from;
    private LocalDate to;

    private double medicationPercent;
    private double activityPercent;
    private double nutritionPercent;
    private double educationPercent;
    private double overallSelfCarePercent;

    private int totalMedicationsScheduled;
    private int totalMedicationsTaken;
    private int totalActivityMinutes;
    private int totalActivityDays;
    private long totalNutritionDays;
    private long healthyNutritionDays;
    private long totalEducationContent;
    private long viewedEducationContent;
}
