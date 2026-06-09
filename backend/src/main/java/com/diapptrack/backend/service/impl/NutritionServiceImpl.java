package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.NutritionLogRequest;
import com.diapptrack.backend.dto.response.NutritionLogResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.entity.NutritionLog;
import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.exception.BusinessException;
import com.diapptrack.backend.exception.ResourceNotFoundException;
import com.diapptrack.backend.repository.NutritionLogRepository;
import com.diapptrack.backend.service.NutritionService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NutritionServiceImpl implements NutritionService {

    private final NutritionLogRepository nutritionRepo;
    private final UserService userService;

    @Override
    @Transactional
    public NutritionLogResponse create(String email, NutritionLogRequest request) {
        User user = userService.getByEmail(email);
        if (nutritionRepo.findByUserAndLogDate(user, request.getLogDate()).isPresent()) {
            throw new BusinessException("Ya existe un registro de alimentación para esta fecha");
        }
        NutritionLog log = buildLog(user, request);
        return NutritionLogResponse.from(nutritionRepo.save(log));
    }

    @Override
    @Transactional
    public NutritionLogResponse update(String email, Long id, NutritionLogRequest request) {
        User user = userService.getByEmail(email);
        NutritionLog log = nutritionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de alimentación no encontrado"));
        if (!log.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Registro de alimentación no encontrado");
        }
        log.setLogDate(request.getLogDate());
        log.setAteFruits(request.getAteFruits());
        log.setAteVegetables(request.getAteVegetables());
        log.setDrankSugary(request.getDrankSugary());
        log.setAteFastFood(request.getAteFastFood());
        log.setRespectedSchedule(request.getRespectedSchedule());
        return NutritionLogResponse.from(nutritionRepo.save(log));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<NutritionLogResponse> getToday(String email) {
        User user = userService.getByEmail(email);
        return nutritionRepo.findByUserAndLogDate(user, LocalDate.now())
                .map(NutritionLogResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NutritionLogResponse> getHistory(String email, LocalDate from, LocalDate to, Pageable pageable) {
        User user = userService.getByEmail(email);
        Page<NutritionLog> page = (from != null && to != null)
                ? nutritionRepo.findByUserAndLogDateBetweenOrderByLogDateDesc(user, from, to, pageable)
                : nutritionRepo.findByUserOrderByLogDateDesc(user, pageable);
        return PageResponse.from(page.map(NutritionLogResponse::from));
    }

    private NutritionLog buildLog(User user, NutritionLogRequest req) {
        return NutritionLog.builder()
                .user(user)
                .logDate(req.getLogDate())
                .ateFruits(req.getAteFruits())
                .ateVegetables(req.getAteVegetables())
                .drankSugary(req.getDrankSugary())
                .ateFastFood(req.getAteFastFood())
                .respectedSchedule(req.getRespectedSchedule())
                .build();
    }
}
