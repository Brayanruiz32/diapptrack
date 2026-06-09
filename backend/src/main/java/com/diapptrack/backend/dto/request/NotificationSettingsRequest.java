package com.diapptrack.backend.dto.request;

import lombok.Data;

import java.time.LocalTime;

@Data
public class NotificationSettingsRequest {
    private Boolean glucoseEnabled;
    private LocalTime glucoseTime;
    private Boolean medicationEnabled;
    private Boolean activityEnabled;
    private LocalTime activityTime;
    private Boolean educationEnabled;
}
