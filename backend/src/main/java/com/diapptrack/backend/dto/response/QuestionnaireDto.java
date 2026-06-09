package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.QuestionnaireKey;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/** Cuestionario que el paciente debe responder (instancia habilitada y pendiente). */
@Data @Builder
public class QuestionnaireDto {
    private QuestionnaireKey key;
    private String label;
    private Integer scaleMin;
    private Integer scaleMax;
    private List<QuestionDto> questions;
}
