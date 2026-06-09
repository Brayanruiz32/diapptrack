package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.response.EducationContentResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.entity.EducationContent;
import com.diapptrack.backend.service.EducationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @GetMapping
    public ResponseEntity<PageResponse<EducationContentResponse>> getAll(
            Principal principal,
            @RequestParam(required = false) EducationContent.Topic topic,
            @RequestParam(required = false) EducationContent.ContentType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(educationService.getAll(principal.getName(), topic, type, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EducationContentResponse> getById(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(educationService.getById(principal.getName(), id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> markAsRead(Principal principal, @PathVariable Long id) {
        educationService.markAsRead(principal.getName(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Principal principal) {
        return ResponseEntity.ok(Map.of("unreadCount", educationService.getUnreadCount(principal.getName())));
    }
}
