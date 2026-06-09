package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.request.NutritionLogRequest;
import com.diapptrack.backend.dto.response.NutritionLogResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.service.NutritionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;

    @GetMapping("/today")
    public ResponseEntity<NutritionLogResponse> getToday(Principal principal) {
        Optional<NutritionLogResponse> today = nutritionService.getToday(principal.getName());
        return today.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<PageResponse<NutritionLogResponse>> getHistory(
            Principal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(nutritionService.getHistory(principal.getName(), from, to, PageRequest.of(page, size)));
    }

    @PostMapping
    public ResponseEntity<NutritionLogResponse> create(Principal principal,
                                                        @Valid @RequestBody NutritionLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nutritionService.create(principal.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NutritionLogResponse> update(Principal principal, @PathVariable Long id,
                                                        @Valid @RequestBody NutritionLogRequest request) {
        return ResponseEntity.ok(nutritionService.update(principal.getName(), id, request));
    }
}
