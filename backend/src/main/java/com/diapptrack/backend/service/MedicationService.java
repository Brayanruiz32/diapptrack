package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.MedicationRequest;
import com.diapptrack.backend.dto.response.MedicationLogResponse;
import com.diapptrack.backend.dto.response.MedicationResponse;
import com.diapptrack.backend.dto.response.MedicationTodayItemResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface MedicationService {
    MedicationResponse create(String email, MedicationRequest request);
    MedicationResponse update(String email, Long id, MedicationRequest request);
    void delete(String email, Long id);
    List<MedicationResponse> getAll(String email);

    // Apartado "Hoy": un ítem por cada horario programado del día
    List<MedicationTodayItemResponse> getTodayItems(String email);
    MedicationTodayItemResponse setTodayTaken(String email, Long scheduleId, boolean taken);

    PageResponse<MedicationLogResponse> getLogHistory(String email, LocalDate from, LocalDate to, Pageable pageable);
}
