package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.PhysicalActivityRequest;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.dto.response.PhysicalActivityResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PhysicalActivityService {
    PhysicalActivityResponse create(String email, PhysicalActivityRequest request);
    PhysicalActivityResponse update(String email, Long id, PhysicalActivityRequest request);
    PhysicalActivityResponse getById(String email, Long id);
    void delete(String email, Long id);
    PageResponse<PhysicalActivityResponse> getHistory(String email, LocalDate from, LocalDate to, Pageable pageable);
}
