package com.diapptrack.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class HomeSummaryResponse {

    private GlucoseSummary lastGlucose;
    private MedicationSummary medicationToday;
    private ActivitySummary activityToday;
    private NutritionSummary nutritionToday;
    private EducationSummary education;

    @Data @Builder
    public static class GlucoseSummary {
        private BigDecimal valueMgdl;
        private LocalDateTime measuredAt;
        private GlucoseResponse.GlucoseAlert alert;
    }

    @Data @Builder
    public static class MedicationSummary {
        private int total;
        private int taken;
        private int pending;
    }

    @Data @Builder
    public static class ActivitySummary {
        private int totalMinutes;
        private int sessions;
    }

    @Data @Builder
    public static class NutritionSummary {
        private Boolean registered;
        private Boolean isHealthy;
    }

    @Data @Builder
    public static class EducationSummary {
        private long unreadCount;
    }
}
