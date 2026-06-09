package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.request.PhysicalActivityRequest;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.dto.response.PhysicalActivityResponse;
import com.diapptrack.backend.service.PhysicalActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class PhysicalActivityController {

    private final PhysicalActivityService activityService;

    @GetMapping
    public ResponseEntity<PageResponse<PhysicalActivityResponse>> getHistory(
            Principal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(activityService.getHistory(principal.getName(), from, to, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhysicalActivityResponse> getById(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(activityService.getById(principal.getName(), id));
    }

    @PostMapping
    public ResponseEntity<PhysicalActivityResponse> create(Principal principal,
                                                            @Valid @RequestBody PhysicalActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(activityService.create(principal.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhysicalActivityResponse> update(Principal principal, @PathVariable Long id,
                                                            @Valid @RequestBody PhysicalActivityRequest request) {
        return ResponseEntity.ok(activityService.update(principal.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        activityService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
