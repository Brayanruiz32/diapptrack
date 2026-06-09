package com.diapptrack.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SubmitQuestionnaireRequest {

    @NotEmpty(message = "Debe responder todas las preguntas")
    @Valid
    private List<AnswerInput> answers;

    @Data
    public static class AnswerInput {
        @NotNull
        private Long questionId;

        @NotNull
        private Integer value;
    }
}
