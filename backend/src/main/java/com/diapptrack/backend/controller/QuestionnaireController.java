package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.request.SubmitQuestionnaireRequest;
import com.diapptrack.backend.dto.response.QuestionnaireDto;
import com.diapptrack.backend.dto.response.QuestionnaireResponseDetailDto;
import com.diapptrack.backend.entity.QuestionnaireKey;
import com.diapptrack.backend.service.QuestionnaireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/questionnaires")
@RequiredArgsConstructor
public class QuestionnaireController {

    private final QuestionnaireService questionnaireService;

    /** Cuestionarios habilitados que el usuario aún no ha respondido. */
    @GetMapping("/available")
    public ResponseEntity<List<QuestionnaireDto>> getAvailable(Principal principal) {
        return ResponseEntity.ok(questionnaireService.getAvailableForUser(principal.getName()));
    }

    /** Cuestionarios ya respondidos por el usuario (solo lectura). */
    @GetMapping("/mine")
    public ResponseEntity<List<QuestionnaireResponseDetailDto>> getMine(Principal principal) {
        return ResponseEntity.ok(questionnaireService.getMyResponses(principal.getName()));
    }

    @PostMapping("/{key}/submit")
    public ResponseEntity<Void> submit(Principal principal,
                                       @PathVariable QuestionnaireKey key,
                                       @Valid @RequestBody SubmitQuestionnaireRequest request) {
        questionnaireService.submit(principal.getName(), key, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
