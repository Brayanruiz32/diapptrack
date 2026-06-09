package com.diapptrack.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PhysicalActivityRequest {

    @NotNull
    private Long activityTypeId;

    @NotNull
    private LocalDate activityDate;

    @NotNull @Min(1) @Max(1440)
    private Integer durationMin;
}
