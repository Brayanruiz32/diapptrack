package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.request.FcmTokenRequest;
import com.diapptrack.backend.dto.request.NotificationSettingsRequest;
import com.diapptrack.backend.dto.response.NotificationSettingsResponse;
import com.diapptrack.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/settings")
    public ResponseEntity<NotificationSettingsResponse> getSettings(Principal principal) {
        return ResponseEntity.ok(notificationService.getSettings(principal.getName()));
    }

    @PutMapping("/settings")
    public ResponseEntity<NotificationSettingsResponse> updateSettings(Principal principal,
                                                                        @RequestBody NotificationSettingsRequest request) {
        return ResponseEntity.ok(notificationService.updateSettings(principal.getName(), request));
    }

    @PostMapping("/fcm-token")
    public ResponseEntity<Void> saveFcmToken(Principal principal,
                                              @Valid @RequestBody FcmTokenRequest request) {
        notificationService.saveFcmToken(principal.getName(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/fcm-token")
    public ResponseEntity<Void> deleteFcmToken(Principal principal,
                                                @RequestBody Map<String, String> body) {
        notificationService.deleteFcmToken(principal.getName(), body.get("token"));
        return ResponseEntity.noContent().build();
    }
}
