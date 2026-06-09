package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.FcmTokenRequest;
import com.diapptrack.backend.dto.request.NotificationSettingsRequest;
import com.diapptrack.backend.dto.response.NotificationSettingsResponse;
import com.diapptrack.backend.entity.EducationContent;
import com.diapptrack.backend.entity.User;

public interface NotificationService {
    NotificationSettingsResponse getSettings(String email);
    NotificationSettingsResponse updateSettings(String email, NotificationSettingsRequest request);
    void saveFcmToken(String email, FcmTokenRequest request);
    void deleteFcmToken(String email, String token);

    void sendToUser(User user, String title, String body);
    void notifyNewEducationContent(EducationContent content);
}
