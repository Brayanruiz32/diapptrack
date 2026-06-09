package com.diapptrack.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** Detalle de las respuestas de un paciente a un cuestionario (vista admin). */
@Data @Builder
public class QuestionnaireResponseDetailDto {
    private String key;
    private String label;
    private LocalDateTime submittedAt;
    private List<AnswerDetail> answers;

    @Data @Builder
    public static class AnswerDetail {
        private Integer orderNum;
        private String text;
        private Integer value;
    }
}
