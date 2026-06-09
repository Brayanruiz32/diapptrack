package com.diapptrack.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

/**
 * Un ítem de la lista "Hoy": un horario concreto de un medicamento para la fecha actual,
 * con su estado de cumplimiento (tomado / pendiente).
 */
@Data @Builder
public class MedicationTodayItemResponse {
    private Long scheduleId;
    private Long medicationId;
    private String medicationName;
    private String dose;
    private LocalTime time;
    private Boolean taken;
}
