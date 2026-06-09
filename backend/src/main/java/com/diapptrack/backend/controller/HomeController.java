package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.response.HomeSummaryResponse;
import com.diapptrack.backend.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    public ResponseEntity<HomeSummaryResponse> getSummary(Principal principal) {
        return ResponseEntity.ok(homeService.getSummary(principal.getName()));
    }
}
