package com.diapptrack.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** Estado de respuesta de cada cuestionario para un paciente (vista admin). */
@Data @Builder
public class PatientQuestionnaireStatusDto {
    private Long userId;
    private String fullName;
    private String dni;
    private List<InstanceStatus> instances;

    @Data @Builder
    public static class InstanceStatus {
        private String key;
        private String label;
        private Boolean completed;          // Completado / Pendiente
        private LocalDateTime submittedAt;
    }
}
