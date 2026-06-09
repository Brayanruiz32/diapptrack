package com.diapptrack.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GlucoseRequest {

    @NotNull
    private LocalDateTime measuredAt;

    @NotNull
    @DecimalMin("10.0") @DecimalMax("900.0")
    private BigDecimal valueMgdl;

    @Size(max = 1000)
    private String notes;
}
