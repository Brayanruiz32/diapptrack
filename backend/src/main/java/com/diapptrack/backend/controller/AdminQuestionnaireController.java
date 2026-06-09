package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.response.PatientQuestionnaireStatusDto;
import com.diapptrack.backend.dto.response.QuestionnaireResponseDetailDto;
import com.diapptrack.backend.dto.response.QuestionnaireSettingDto;
import com.diapptrack.backend.entity.QuestionnaireKey;
import com.diapptrack.backend.service.QuestionnaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/questionnaires")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminQuestionnaireController {

    private final QuestionnaireService questionnaireService;

    @GetMapping("/settings")
    public ResponseEntity<List<QuestionnaireSettingDto>> getSettings() {
        return ResponseEntity.ok(questionnaireService.getSettings());
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<QuestionnaireSettingDto> updateSetting(@PathVariable QuestionnaireKey key,
                                                                 @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(questionnaireService.updateSetting(key, Boolean.TRUE.equals(body.get("enabled"))));
    }

    /** Estado (Pendiente/Completado) de cada cuestionario por paciente. */
    @GetMapping("/responses")
    public ResponseEntity<List<PatientQuestionnaireStatusDto>> getResponses() {
        return ResponseEntity.ok(questionnaireService.getPatientStatuses());
    }

    /** Detalle de las respuestas de un paciente a un cuestionario. */
    @GetMapping("/responses/{userId}/{key}")
    public ResponseEntity<QuestionnaireResponseDetailDto> getResponseDetail(@PathVariable Long userId,
                                                                            @PathVariable QuestionnaireKey key) {
        return ResponseEntity.ok(questionnaireService.getPatientResponse(userId, key));
    }
}
