package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.SubmitQuestionnaireRequest;
import com.diapptrack.backend.dto.response.*;
import com.diapptrack.backend.entity.*;
import com.diapptrack.backend.exception.BusinessException;
import com.diapptrack.backend.exception.ResourceNotFoundException;
import com.diapptrack.backend.repository.QuestionRepository;
import com.diapptrack.backend.repository.QuestionnaireResponseRepository;
import com.diapptrack.backend.repository.QuestionnaireSettingRepository;
import com.diapptrack.backend.repository.UserRepository;
import com.diapptrack.backend.service.QuestionnaireService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuestionnaireServiceImpl implements QuestionnaireService {

    private final QuestionnaireSettingRepository settingRepo;
    private final QuestionRepository questionRepo;
    private final QuestionnaireResponseRepository responseRepo;
    private final UserRepository userRepo;
    private final UserService userService;

    // ====================== PACIENTE ======================

    @Override
    @Transactional(readOnly = true)
    public List<QuestionnaireDto> getAvailableForUser(String email) {
        User user = userService.getByEmail(email);
        return settingRepo.findByEnabledTrue().stream()
                .map(QuestionnaireSetting::getQuestionnaireKey)
                .filter(key -> !responseRepo.existsByUserAndQuestionnaireKey(user, key))
                .sorted(Comparator.comparingInt(Enum::ordinal))
                .map(this::toQuestionnaireDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionnaireResponseDetailDto> getMyResponses(String email) {
        User user = userService.getByEmail(email);
        return responseRepo.findByUser(user).stream()
                .sorted(Comparator.comparingInt(r -> r.getQuestionnaireKey().ordinal()))
                .map(this::toDetail)
                .toList();
    }

    @Override
    @Transactional
    public void submit(String email, QuestionnaireKey key, SubmitQuestionnaireRequest request) {
        User user = userService.getByEmail(email);

        QuestionnaireSetting setting = settingRepo.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Cuestionario no encontrado"));
        if (!Boolean.TRUE.equals(setting.getEnabled())) {
            throw new BusinessException("El cuestionario no está disponible");
        }
        if (responseRepo.existsByUserAndQuestionnaireKey(user, key)) {
            throw new BusinessException("Ya registraste tu respuesta para este cuestionario");
        }

        Map<Long, Integer> provided = new HashMap<>();
        for (SubmitQuestionnaireRequest.AnswerInput a : request.getAnswers()) {
            provided.put(a.getQuestionId(), a.getValue());
        }

        QuestionnaireResponse response = QuestionnaireResponse.builder()
                .user(user)
                .questionnaireKey(key)
                .build();

        List<Question> questions = questionRepo.findByQuestionnaireOrderByOrderNumAsc(key.getQuestionnaire());
        for (Question q : questions) {
            Integer value = provided.get(q.getId());
            if (value == null) {
                throw new BusinessException("Falta responder la pregunta " + q.getOrderNum());
            }
            if (value < q.getMinValue() || value > q.getMaxValue()) {
                throw new BusinessException("Respuesta fuera de rango en la pregunta " + q.getOrderNum()
                        + " (permitido " + q.getMinValue() + " a " + q.getMaxValue() + ")");
            }
            response.addAnswer(QuestionnaireAnswer.builder().question(q).answerValue(value).build());
        }

        responseRepo.save(response);
    }

    // ====================== ADMIN ======================

    @Override
    @Transactional(readOnly = true)
    public List<QuestionnaireSettingDto> getSettings() {
        return settingRepo.findAll().stream()
                .sorted(Comparator.comparingInt(s -> s.getQuestionnaireKey().ordinal()))
                .map(QuestionnaireSettingDto::from)
                .toList();
    }

    @Override
    @Transactional
    public QuestionnaireSettingDto updateSetting(QuestionnaireKey key, boolean enabled) {
        QuestionnaireSetting setting = settingRepo.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Cuestionario no encontrado"));
        setting.setEnabled(enabled);
        return QuestionnaireSettingDto.from(settingRepo.save(setting));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientQuestionnaireStatusDto> getPatientStatuses() {
        List<User> patients = userRepo.findByRole(User.Role.PATIENT);
        return patients.stream().map(patient -> {
            List<PatientQuestionnaireStatusDto.InstanceStatus> instances =
                    java.util.Arrays.stream(QuestionnaireKey.values()).map(key -> {
                        var resp = responseRepo.findByUserAndQuestionnaireKey(patient, key).orElse(null);
                        return PatientQuestionnaireStatusDto.InstanceStatus.builder()
                                .key(key.name())
                                .label(key.getLabel())
                                .completed(resp != null)
                                .submittedAt(resp != null ? resp.getSubmittedAt() : null)
                                .build();
                    }).toList();
            return PatientQuestionnaireStatusDto.builder()
                    .userId(patient.getId())
                    .fullName(patient.getFullName())
                    .dni(patient.getDni())
                    .instances(instances)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionnaireResponseDetailDto getPatientResponse(Long userId, QuestionnaireKey key) {
        User user = userService.getById(userId);
        QuestionnaireResponse resp = responseRepo.findByUserAndQuestionnaireKey(user, key)
                .orElseThrow(() -> new ResourceNotFoundException("El paciente no ha respondido este cuestionario"));
        return toDetail(resp);
    }

    // ====================== helpers ======================

    private QuestionnaireDto toQuestionnaireDto(QuestionnaireKey key) {
        List<Question> questions = questionRepo.findByQuestionnaireOrderByOrderNumAsc(key.getQuestionnaire());
        int min = questions.isEmpty() ? 0 : questions.get(0).getMinValue();
        int max = questions.isEmpty() ? 0 : questions.get(0).getMaxValue();
        return QuestionnaireDto.builder()
                .key(key)
                .label(key.getLabel())
                .scaleMin(min)
                .scaleMax(max)
                .questions(questions.stream().map(QuestionDto::from).toList())
                .build();
    }

    private QuestionnaireResponseDetailDto toDetail(QuestionnaireResponse resp) {
        List<QuestionnaireResponseDetailDto.AnswerDetail> answers = resp.getAnswers().stream()
                .sorted(Comparator.comparingInt(a -> a.getQuestion().getOrderNum()))
                .map(a -> QuestionnaireResponseDetailDto.AnswerDetail.builder()
                        .orderNum(a.getQuestion().getOrderNum())
                        .text(a.getQuestion().getText())
                        .value(a.getAnswerValue())
                        .build())
                .toList();
        return QuestionnaireResponseDetailDto.builder()
                .key(resp.getQuestionnaireKey().name())
                .label(resp.getQuestionnaireKey().getLabel())
                .submittedAt(resp.getSubmittedAt())
                .answers(answers)
                .build();
    }
}
