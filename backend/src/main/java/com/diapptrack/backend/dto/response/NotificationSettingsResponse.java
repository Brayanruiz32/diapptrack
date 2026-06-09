package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.NotificationSettings;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data @Builder
public class NotificationSettingsResponse {
    private Boolean glucoseEnabled;
    private LocalTime glucoseTime;
    private Boolean medicationEnabled;
    private Boolean activityEnabled;
    private LocalTime activityTime;
    private Boolean educationEnabled;

    public static NotificationSettingsResponse from(NotificationSettings s) {
        return NotificationSettingsResponse.builder()
                .glucoseEnabled(s.getGlucoseEnabled())
                .glucoseTime(s.getGlucoseTime())
                .medicationEnabled(s.getMedicationEnabled())
                .activityEnabled(s.getActivityEnabled())
                .activityTime(s.getActivityTime())
                .educationEnabled(s.getEducationEnabled())
                .build();
    }
}
