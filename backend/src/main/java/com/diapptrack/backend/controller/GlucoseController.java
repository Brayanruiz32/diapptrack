package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.request.GlucoseRequest;
import com.diapptrack.backend.dto.response.GlucoseResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.service.GlucoseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/glucose")
@RequiredArgsConstructor
public class GlucoseController {

    private final GlucoseService glucoseService;

    @GetMapping
    public ResponseEntity<PageResponse<GlucoseResponse>> getHistory(
            Principal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(glucoseService.getHistory(principal.getName(), from, to,
                PageRequest.of(page, size, Sort.by("measuredAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GlucoseResponse> getById(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(glucoseService.getById(principal.getName(), id));
    }

    @PostMapping
    public ResponseEntity<GlucoseResponse> create(Principal principal,
                                                    @Valid @RequestBody GlucoseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(glucoseService.create(principal.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GlucoseResponse> update(Principal principal, @PathVariable Long id,
                                                    @Valid @RequestBody GlucoseRequest request) {
        return ResponseEntity.ok(glucoseService.update(principal.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        glucoseService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
