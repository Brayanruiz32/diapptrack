package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.QuestionnaireSetting;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class QuestionnaireSettingDto {
    private String key;
    private String label;
    private Boolean enabled;

    public static QuestionnaireSettingDto from(QuestionnaireSetting s) {
        return QuestionnaireSettingDto.builder()
                .key(s.getQuestionnaireKey().name())
                .label(s.getQuestionnaireKey().getLabel())
                .enabled(s.getEnabled())
                .build();
    }
}
