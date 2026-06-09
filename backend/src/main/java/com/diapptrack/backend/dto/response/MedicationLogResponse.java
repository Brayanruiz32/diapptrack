package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.MedicationLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @Builder
public class MedicationLogResponse {
    private Long id;
    private Long medicationId;
    private String medicationName;
    private String dose;
    private LocalTime scheduledTime;
    private LocalDate logDate;
    private Boolean taken;
    private LocalDateTime updatedAt;

    public static MedicationLogResponse from(MedicationLog log) {
        var schedule   = log.getSchedule();
        var medication = schedule.getMedication();
        return MedicationLogResponse.builder()
                .id(log.getId())
                .medicationId(medication.getId())
                .medicationName(medication.getName())
                .dose(medication.getDose())
                .scheduledTime(schedule.getTimeOfDay())
                .logDate(log.getLogDate())
                .taken(log.getTaken())
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}
