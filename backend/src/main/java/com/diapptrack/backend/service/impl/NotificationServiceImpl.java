package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.FcmTokenRequest;
import com.diapptrack.backend.dto.request.NotificationSettingsRequest;
import com.diapptrack.backend.dto.response.NotificationSettingsResponse;
import com.diapptrack.backend.entity.*;
import com.diapptrack.backend.repository.*;
import com.diapptrack.backend.service.NotificationService;
import com.diapptrack.backend.service.UserService;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationSettingsRepository settingsRepo;
    private final FcmTokenRepository fcmTokenRepo;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public NotificationSettingsResponse getSettings(String email) {
        User user = userService.getByEmail(email);
        NotificationSettings settings = settingsRepo.findByUser(user)
                .orElseGet(() -> defaultSettings(user));
        return NotificationSettingsResponse.from(settings);
    }

    @Override
    @Transactional
    public NotificationSettingsResponse updateSettings(String email, NotificationSettingsRequest request) {
        User user = userService.getByEmail(email);
        NotificationSettings settings = settingsRepo.findByUser(user)
                .orElseGet(() -> defaultSettings(user));

        if (request.getGlucoseEnabled() != null) settings.setGlucoseEnabled(request.getGlucoseEnabled());
        if (request.getGlucoseTime() != null) settings.setGlucoseTime(request.getGlucoseTime());
        if (request.getMedicationEnabled() != null) settings.setMedicationEnabled(request.getMedicationEnabled());
        if (request.getActivityEnabled() != null) settings.setActivityEnabled(request.getActivityEnabled());
        if (request.getActivityTime() != null) settings.setActivityTime(request.getActivityTime());
        if (request.getEducationEnabled() != null) settings.setEducationEnabled(request.getEducationEnabled());

        return NotificationSettingsResponse.from(settingsRepo.save(settings));
    }

    @Override
    @Transactional
    public void saveFcmToken(String email, FcmTokenRequest request) {
        User user = userService.getByEmail(email);
        fcmTokenRepo.findByToken(request.getToken()).ifPresentOrElse(
                existing -> {
                    existing.setDeviceInfo(request.getDeviceInfo());
                    fcmTokenRepo.save(existing);
                },
                () -> fcmTokenRepo.save(FcmToken.builder()
                        .user(user)
                        .token(request.getToken())
                        .deviceInfo(request.getDeviceInfo())
                        .build())
        );
    }

    @Override
    @Transactional
    public void deleteFcmToken(String email, String token) {
        fcmTokenRepo.deleteByToken(token);
    }

    @Override
    public void sendToUser(User user, String title, String body) {
        if (!isFirebaseAvailable()) return;

        List<FcmToken> tokens = fcmTokenRepo.findByUser(user);
        if (tokens.isEmpty()) return;

        tokens.forEach(fcmToken -> {
            try {
                Message message = Message.builder()
                        .setNotification(Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build())
                        .setToken(fcmToken.getToken())
                        .build();
                FirebaseMessaging.getInstance().send(message);
            } catch (FirebaseMessagingException e) {
                log.warn("Error enviando FCM a token {}: {}", fcmToken.getId(), e.getMessage());
                if ("registration-token-not-registered".equals(e.getErrorCode().name())) {
                    fcmTokenRepo.delete(fcmToken);
                }
            }
        });
    }

    @Override
    public void notifyNewEducationContent(EducationContent content) {
        if (!isFirebaseAvailable()) return;

        List<FcmToken> allTokens = fcmTokenRepo.findAll();
        if (allTokens.isEmpty()) return;

        List<String> tokenStrings = allTokens.stream().map(FcmToken::getToken).toList();
        try {
            MulticastMessage message = MulticastMessage.builder()
                    .setNotification(Notification.builder()
                            .setTitle("Nuevo contenido educativo")
                            .setBody(content.getTitle())
                            .build())
                    .addAllTokens(tokenStrings)
                    .build();
            FirebaseMessaging.getInstance().sendEachForMulticast(message);
        } catch (FirebaseMessagingException e) {
            log.warn("Error enviando notificación multicast: {}", e.getMessage());
        }
    }

    private NotificationSettings defaultSettings(User user) {
        return NotificationSettings.builder()
                .user(user)
                .glucoseEnabled(false)
                .medicationEnabled(false)
                .activityEnabled(false)
                .educationEnabled(false)
                .build();
    }

    private boolean isFirebaseAvailable() {
        return !FirebaseApp.getApps().isEmpty();
    }
}
