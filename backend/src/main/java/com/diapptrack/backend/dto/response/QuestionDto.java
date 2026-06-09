package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.Question;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class QuestionDto {
    private Long id;
    private Integer orderNum;
    private String text;
    private Integer minValue;
    private Integer maxValue;

    public static QuestionDto from(Question q) {
        return QuestionDto.builder()
                .id(q.getId())
                .orderNum(q.getOrderNum())
                .text(q.getText())
                .minValue(q.getMinValue())
                .maxValue(q.getMaxValue())
                .build();
    }
}
