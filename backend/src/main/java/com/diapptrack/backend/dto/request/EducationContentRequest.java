package com.diapptrack.backend.dto.request;

import com.diapptrack.backend.entity.EducationContent;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EducationContentRequest {

    @NotBlank @Size(max = 200)
    private String title;

    @NotBlank
    private String body;

    @NotNull
    private EducationContent.ContentType type;

    @NotNull
    private EducationContent.Topic topic;

    @Min(1) @Max(240)
    private Integer readingTimeMinutes;
}
