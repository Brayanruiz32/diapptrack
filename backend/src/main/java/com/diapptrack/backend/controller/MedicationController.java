package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.request.MedicationRequest;
import com.diapptrack.backend.dto.response.*;
import com.diapptrack.backend.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping
    public ResponseEntity<List<MedicationResponse>> getAll(Principal principal) {
        return ResponseEntity.ok(medicationService.getAll(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<MedicationResponse> create(Principal principal,
                                                      @Valid @RequestBody MedicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicationService.create(principal.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicationResponse> update(Principal principal, @PathVariable Long id,
                                                      @Valid @RequestBody MedicationRequest request) {
        return ResponseEntity.ok(medicationService.update(principal.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        medicationService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // --- Apartado "Hoy" ---

    @GetMapping("/today")
    public ResponseEntity<List<MedicationTodayItemResponse>> getToday(Principal principal) {
        return ResponseEntity.ok(medicationService.getTodayItems(principal.getName()));
    }

    @PutMapping("/today/{scheduleId}")
    public ResponseEntity<MedicationTodayItemResponse> setTodayTaken(Principal principal,
                                                                     @PathVariable Long scheduleId,
                                                                     @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(medicationService.setTodayTaken(principal.getName(), scheduleId,
                Boolean.TRUE.equals(body.get("taken"))));
    }

    // --- Historial ---

    @GetMapping("/logs")
    public ResponseEntity<PageResponse<MedicationLogResponse>> getLogs(
            Principal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(medicationService.getLogHistory(principal.getName(), from, to,
                PageRequest.of(page, size)));
    }
}
