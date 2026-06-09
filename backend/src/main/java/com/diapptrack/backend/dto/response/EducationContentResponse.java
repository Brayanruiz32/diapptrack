package com.diapptrack.backend.dto.response;

import com.diapptrack.backend.entity.EducationContent;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class EducationContentResponse {
    private Long id;
    private String title;
    private String body;
    private EducationContent.ContentType type;
    private EducationContent.Topic topic;
    private String imageUrl;
    private Integer readingTimeMinutes;
    private LocalDateTime publishedAt;
    private Boolean read;

    public static EducationContentResponse from(EducationContent content, boolean read) {
        return EducationContentResponse.builder()
                .id(content.getId())
                .title(content.getTitle())
                .body(content.getBody())
                .type(content.getType())
                .topic(content.getTopic())
                .imageUrl(content.getImageUrl())
                .readingTimeMinutes(content.getReadingTimeMinutes())
                .publishedAt(content.getPublishedAt())
                .read(read)
                .build();
    }
}
