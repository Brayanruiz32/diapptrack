package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.PhysicalActivityRequest;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.dto.response.PhysicalActivityResponse;
import com.diapptrack.backend.entity.ActivityType;
import com.diapptrack.backend.entity.PhysicalActivity;
import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.exception.BusinessException;
import com.diapptrack.backend.exception.ResourceNotFoundException;
import com.diapptrack.backend.repository.ActivityTypeRepository;
import com.diapptrack.backend.repository.PhysicalActivityRepository;
import com.diapptrack.backend.service.PhysicalActivityService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PhysicalActivityServiceImpl implements PhysicalActivityService {

    private final PhysicalActivityRepository activityRepo;
    private final ActivityTypeRepository activityTypeRepo;
    private final UserService userService;

    @Override
    @Transactional
    public PhysicalActivityResponse create(String email, PhysicalActivityRequest request) {
        User user = userService.getByEmail(email);
        requireWeight(user);
        ActivityType type = activityTypeRepo.findById(request.getActivityTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de actividad no encontrado"));

        PhysicalActivity activity = PhysicalActivity.builder()
                .user(user)
                .activityType(type)
                .activityDate(request.getActivityDate())
                .durationMin(request.getDurationMin())
                .calories(estimateCalories(type, user, request.getDurationMin()))
                .build();
        return PhysicalActivityResponse.from(activityRepo.save(activity));
    }

    @Override
    @Transactional
    public PhysicalActivityResponse update(String email, Long id, PhysicalActivityRequest request) {
        PhysicalActivity activity = getOwned(email, id);
        User user = activity.getUser();
        requireWeight(user);
        ActivityType type = activityTypeRepo.findById(request.getActivityTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de actividad no encontrado"));
        activity.setActivityType(type);
        activity.setActivityDate(request.getActivityDate());
        activity.setDurationMin(request.getDurationMin());
        activity.setCalories(estimateCalories(type, user, request.getDurationMin()));
        return PhysicalActivityResponse.from(activityRepo.save(activity));
    }

    @Override
    @Transactional(readOnly = true)
    public PhysicalActivityResponse getById(String email, Long id) {
        return PhysicalActivityResponse.from(getOwned(email, id));
    }

    @Override
    @Transactional
    public void delete(String email, Long id) {
        activityRepo.delete(getOwned(email, id));
    }

    /**
     * Estima las calorías quemadas con la fórmula estándar ACSM:
     *   kcal = MET × 3.5 × peso(kg) / 200 × duración(min)
     */
    private Integer estimateCalories(ActivityType type, User user, int durationMin) {
        if (user.getWeightKg() == null || type.getMet() == null) return null;
        double met    = type.getMet().doubleValue();
        double weight = user.getWeightKg().doubleValue();
        double kcal   = met * 3.5 * weight / 200.0 * durationMin;
        return (int) Math.round(kcal);
    }

    /** El peso es obligatorio para registrar actividad (necesario para calcular calorías). */
    private void requireWeight(User user) {
        if (user.getWeightKg() == null || user.getWeightKg().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Debes registrar tu peso en el perfil antes de registrar actividad física.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PhysicalActivityResponse> getHistory(String email, LocalDate from, LocalDate to, Pageable pageable) {
        User user = userService.getByEmail(email);
        Page<PhysicalActivity> page = (from != null && to != null)
                ? activityRepo.findByUserAndActivityDateBetweenOrderByActivityDateDesc(user, from, to, pageable)
                : activityRepo.findByUserOrderByActivityDateDesc(user, pageable);
        return PageResponse.from(page.map(PhysicalActivityResponse::from));
    }

    private PhysicalActivity getOwned(String email, Long id) {
        User user = userService.getByEmail(email);
        PhysicalActivity activity = activityRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad física no encontrada"));
        if (!activity.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Actividad física no encontrada");
        }
        return activity;
    }
}
