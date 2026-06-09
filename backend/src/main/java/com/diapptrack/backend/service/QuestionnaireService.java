package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.SubmitQuestionnaireRequest;
import com.diapptrack.backend.dto.response.*;
import com.diapptrack.backend.entity.QuestionnaireKey;

import java.util.List;

public interface QuestionnaireService {

    // --- Paciente ---
    List<QuestionnaireDto> getAvailableForUser(String email);
    List<QuestionnaireResponseDetailDto> getMyResponses(String email);
    void submit(String email, QuestionnaireKey key, SubmitQuestionnaireRequest request);

    // --- Administrador ---
    List<QuestionnaireSettingDto> getSettings();
    QuestionnaireSettingDto updateSetting(QuestionnaireKey key, boolean enabled);
    List<PatientQuestionnaireStatusDto> getPatientStatuses();
    QuestionnaireResponseDetailDto getPatientResponse(Long userId, QuestionnaireKey key);
}
