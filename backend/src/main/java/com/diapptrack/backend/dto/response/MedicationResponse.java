package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.Medication;
import com.diapptrack.backend.entity.MedicationSchedule;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Data @Builder
public class MedicationResponse {
    private Long id;
    private String name;
    private String dose;
    private Boolean active;
    private LocalDateTime createdAt;
    private List<ScheduleItem> schedules;

    @Data @Builder
    public static class ScheduleItem {
        private Long id;
        private LocalTime time;
    }

    public static MedicationResponse from(Medication m) {
        List<ScheduleItem> items = m.getSchedules().stream()
                .sorted(Comparator.comparing(MedicationSchedule::getTimeOfDay))
                .map(s -> ScheduleItem.builder().id(s.getId()).time(s.getTimeOfDay()).build())
                .toList();
        return MedicationResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .dose(m.getDose())
                .active(m.getActive())
                .createdAt(m.getCreatedAt())
                .schedules(items)
                .build();
    }
}
