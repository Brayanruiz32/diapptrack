package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.NutritionLogRequest;
import com.diapptrack.backend.dto.response.NutritionLogResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Optional;

public interface NutritionService {
    NutritionLogResponse create(String email, NutritionLogRequest request);
    NutritionLogResponse update(String email, Long id, NutritionLogRequest request);
    Optional<NutritionLogResponse> getToday(String email);
    PageResponse<NutritionLogResponse> getHistory(String email, LocalDate from, LocalDate to, Pageable pageable);
}
