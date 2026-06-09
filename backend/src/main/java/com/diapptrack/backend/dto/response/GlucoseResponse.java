package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.GlucoseRecord;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class GlucoseResponse {
    private Long id;
    private LocalDateTime measuredAt;
    private BigDecimal valueMgdl;
    private String notes;
    private GlucoseAlert alert;
    private LocalDateTime createdAt;

    public enum GlucoseAlert { LOW, NORMAL, HIGH }

    public static GlucoseResponse from(GlucoseRecord record, int lowThreshold, int highThreshold) {
        double value = record.getValueMgdl().doubleValue();
        GlucoseAlert alert = value < lowThreshold ? GlucoseAlert.LOW
                           : value > highThreshold ? GlucoseAlert.HIGH
                           : GlucoseAlert.NORMAL;

        return GlucoseResponse.builder()
                .id(record.getId())
                .measuredAt(record.getMeasuredAt())
                .valueMgdl(record.getValueMgdl())
                .notes(record.getNotes())
                .alert(alert)
                .createdAt(record.getCreatedAt())
                .build();
    }
}
