package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.response.GlucoseResponse;
import com.diapptrack.backend.dto.response.HomeSummaryResponse;
import com.diapptrack.backend.entity.*;
import com.diapptrack.backend.repository.*;
import com.diapptrack.backend.service.HomeService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomeServiceImpl implements HomeService {

    private final UserService userService;
    private final GlucoseRecordRepository glucoseRepo;
    private final MedicationLogRepository medLogRepo;
    private final MedicationScheduleRepository medScheduleRepo;
    private final PhysicalActivityRepository activityRepo;
    private final NutritionLogRepository nutritionRepo;
    private final EducationContentRepository contentRepo;
    private final EducationViewRepository viewRepo;

    @Value("${app.glucose.low-threshold}") private int lowThreshold;
    @Value("${app.glucose.high-threshold}") private int highThreshold;

    @Override
    @Transactional(readOnly = true)
    public HomeSummaryResponse getSummary(String email) {
        User user = userService.getByEmail(email);
        LocalDate today = LocalDate.now();

        // Última glucosa
        HomeSummaryResponse.GlucoseSummary glucoseSummary = glucoseRepo
                .findTopByUserOrderByMeasuredAtDesc(user)
                .map(g -> {
                    double v = g.getValueMgdl().doubleValue();
                    GlucoseResponse.GlucoseAlert alert = v < lowThreshold ? GlucoseResponse.GlucoseAlert.LOW
                            : v > highThreshold ? GlucoseResponse.GlucoseAlert.HIGH
                            : GlucoseResponse.GlucoseAlert.NORMAL;
                    return HomeSummaryResponse.GlucoseSummary.builder()
                            .valueMgdl(g.getValueMgdl())
                            .measuredAt(g.getMeasuredAt())
                            .alert(alert)
                            .build();
                }).orElse(null);

        // Medicación hoy: el total son los horarios programados (dosis del día);
        // los tomados se cuentan desde los logs marcados como "taken".
        int totalToday = (int) medScheduleRepo.countByMedication_UserAndMedication_ActiveTrue(user);
        List<MedicationLog> todayLogs = medLogRepo.findByUserAndLogDate(user, today);
        int taken = (int) todayLogs.stream().filter(MedicationLog::getTaken).count();
        HomeSummaryResponse.MedicationSummary medSummary = HomeSummaryResponse.MedicationSummary.builder()
                .total(totalToday)
                .taken(taken)
                .pending(Math.max(0, totalToday - taken))
                .build();

        // Actividad hoy
        Integer todayMinutes = activityRepo.sumDurationByUserAndPeriod(user, today, today);
        long todaySessions = activityRepo.countActiveDaysByUserAndPeriod(user, today, today);
        HomeSummaryResponse.ActivitySummary actSummary = HomeSummaryResponse.ActivitySummary.builder()
                .totalMinutes(todayMinutes != null ? todayMinutes : 0)
                .sessions((int) todaySessions)
                .build();

        // Alimentación hoy
        HomeSummaryResponse.NutritionSummary nutritionSummary = nutritionRepo
                .findByUserAndLogDate(user, today)
                .map(n -> {
                    boolean healthy = Boolean.TRUE.equals(n.getAteFruits())
                            && Boolean.TRUE.equals(n.getAteVegetables())
                            && Boolean.FALSE.equals(n.getDrankSugary())
                            && Boolean.FALSE.equals(n.getAteFastFood())
                            && Boolean.TRUE.equals(n.getRespectedSchedule());
                    return HomeSummaryResponse.NutritionSummary.builder()
                            .registered(true).isHealthy(healthy).build();
                })
                .orElse(HomeSummaryResponse.NutritionSummary.builder()
                        .registered(false).isHealthy(false).build());

        // Educación pendiente
        long unread = Math.max(0, contentRepo.count() - viewRepo.countByUser(user));

        return HomeSummaryResponse.builder()
                .lastGlucose(glucoseSummary)
                .medicationToday(medSummary)
                .activityToday(actSummary)
                .nutritionToday(nutritionSummary)
                .education(HomeSummaryResponse.EducationSummary.builder().unreadCount(unread).build())
                .build();
    }
}
