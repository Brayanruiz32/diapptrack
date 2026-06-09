package com.diapptrack.backend.controller;

import com.diapptrack.backend.entity.ActivityType;
import com.diapptrack.backend.repository.ActivityTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final ActivityTypeRepository activityTypeRepository;

    @GetMapping("/activity-types")
    public ResponseEntity<List<ActivityType>> getActivityTypes() {
        return ResponseEntity.ok(activityTypeRepository.findAll());
    }
}
