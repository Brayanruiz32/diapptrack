package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.GlucoseRequest;
import com.diapptrack.backend.dto.response.GlucoseResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface GlucoseService {
    GlucoseResponse create(String email, GlucoseRequest request);
    GlucoseResponse update(String email, Long id, GlucoseRequest request);
    void delete(String email, Long id);
    PageResponse<GlucoseResponse> getHistory(String email, LocalDateTime from, LocalDateTime to, Pageable pageable);
    GlucoseResponse getById(String email, Long id);
}
