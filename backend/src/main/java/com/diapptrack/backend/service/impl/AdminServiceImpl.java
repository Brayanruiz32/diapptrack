package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.AdminCreatePatientRequest;
import com.diapptrack.backend.dto.request.UpdateProfileRequest;
import com.diapptrack.backend.dto.response.*;
import com.diapptrack.backend.entity.*;
import com.diapptrack.backend.exception.BusinessException;
import com.diapptrack.backend.repository.*;
import com.diapptrack.backend.service.AdminService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepo;
    private final GlucoseRecordRepository glucoseRepo;
    private final MedicationLogRepository medLogRepo;
    private final PhysicalActivityRepository activityRepo;
    private final NutritionLogRepository nutritionRepo;
    private final EducationContentRepository contentRepo;
    private final EducationViewRepository viewRepo;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.patient-active-days}") private int activePatientDays;
    @Value("${app.glucose.low-threshold}") private int lowThreshold;
    @Value("${app.glucose.high-threshold}") private int highThreshold;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long total = userRepo.findByRole(User.Role.PATIENT).size();
        long active = userRepo.findActivePatients(LocalDateTime.now().minusDays(activePatientDays)).size();

        LocalDate monthAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();

        List<User> patients = userRepo.findByRole(User.Role.PATIENT);

        double avgMed = patients.stream().mapToDouble(p -> {
            long total_ = medLogRepo.countTotalByUserAndPeriod(p, monthAgo, today);
            long taken = medLogRepo.countTakenByUserAndPeriod(p, monthAgo, today);
            return total_ == 0 ? 0 : (taken * 100.0 / total_);
        }).average().orElse(0);

        double avgActivity = patients.stream().mapToDouble(p ->
                activityRepo.sumDurationByUserAndPeriod(p, monthAgo, today) / 4.28
        ).average().orElse(0);

        double avgNutrition = patients.stream().mapToDouble(p -> {
            long days = nutritionRepo.countByUserAndLogDateBetween(p, monthAgo, today);
            long healthy = nutritionRepo.countHealthyDaysByUserAndPeriod(p, monthAgo, today);
            return days == 0 ? 0 : (healthy * 100.0 / days);
        }).average().orElse(0);

        long totalViews = viewRepo.count();

        return AdminDashboardResponse.builder()
                .totalPatients(total)
                .activePatients(active)
                .avgMedicationAdherence(Math.round(avgMed * 10.0) / 10.0)
                .avgActivityMinutesPerWeek(Math.round(avgActivity * 10.0) / 10.0)
                .avgHealthyNutritionPercent(Math.round(avgNutrition * 10.0) / 10.0)
                .totalEducationViews(totalViews)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listPatients() {
        return userRepo.findByRole(User.Role.PATIENT).stream().map(UserResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getPatient(Long id) {
        return UserResponse.from(userService.getById(id));
    }

    @Override
    @Transactional
    public UserResponse createPatient(AdminCreatePatientRequest request) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new BusinessException("El correo electrónico ya está registrado");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .dni(request.getDni())
                .role(User.Role.PATIENT)
                .birthDate(request.getBirthDate())
                .diagnosisDate(request.getDiagnosisDate())
                .sex(request.getSex())
                .weightKg(request.getWeightKg())
                .heightCm(request.getHeightCm())
                .active(true)
                .build();
        return UserResponse.from(userRepo.save(user));
    }

    @Override
    @Transactional
    public UserResponse updatePatient(Long id, UpdateProfileRequest request) {
        User user = userService.getById(id);
        user.setFullName(request.getFullName());
        user.setDni(request.getDni());
        if (request.getDiagnosisDate() != null) user.setDiagnosisDate(request.getDiagnosisDate());
        if (request.getBirthDate() != null) user.setBirthDate(request.getBirthDate());
        if (request.getSex() != null) user.setSex(request.getSex());
        if (request.getWeightKg() != null) user.setWeightKg(request.getWeightKg());
        if (request.getHeightCm() != null) user.setHeightCm(request.getHeightCm());
        return UserResponse.from(userRepo.save(user));
    }

    @Override
    @Transactional
    public void deletePatient(Long id) {
        User user = userService.getById(id);
        user.setActive(false);
        userRepo.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GlucoseResponse> getPatientGlucose(Long patientId, LocalDate from, LocalDate to, Pageable pageable) {
        User patient = userService.getById(patientId);
        LocalDateTime dtFrom = from != null ? from.atStartOfDay() : LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime dtTo = to != null ? to.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);
        return PageResponse.from(
                glucoseRepo.findByUserAndMeasuredAtBetweenOrderByMeasuredAtDesc(patient, dtFrom, dtTo, pageable)
                        .map(r -> GlucoseResponse.from(r, lowThreshold, highThreshold))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MedicationLogResponse> getPatientMedicationLogs(Long patientId, LocalDate from, LocalDate to, Pageable pageable) {
        User patient = userService.getById(patientId);
        LocalDate f = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate t = to != null ? to : LocalDate.now();
        return PageResponse.from(
                medLogRepo.findByUserAndLogDateBetweenOrderByLogDateDesc(patient, f, t, pageable)
                        .map(MedicationLogResponse::from)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PhysicalActivityResponse> getPatientActivities(Long patientId, LocalDate from, LocalDate to, Pageable pageable) {
        User patient = userService.getById(patientId);
        LocalDate f = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate t = to != null ? to : LocalDate.now();
        return PageResponse.from(
                activityRepo.findByUserAndActivityDateBetweenOrderByActivityDateDesc(patient, f, t, pageable)
                        .map(PhysicalActivityResponse::from)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NutritionLogResponse> getPatientNutrition(Long patientId, LocalDate from, LocalDate to, Pageable pageable) {
        User patient = userService.getById(patientId);
        LocalDate f = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate t = to != null ? to : LocalDate.now();
        return PageResponse.from(
                nutritionRepo.findByUserAndLogDateBetweenOrderByLogDateDesc(patient, f, t, pageable)
                        .map(NutritionLogResponse::from)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<EducationContentResponse> getPatientEducationViews(Long patientId) {
        User patient = userService.getById(patientId);
        return viewRepo.findByUserOrderByViewedAtDesc(patient).stream()
                .map(v -> EducationContentResponse.from(v.getContent(), true))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PatientReportResponse getPatientReport(Long patientId, LocalDate from, LocalDate to) {
        User patient = userService.getById(patientId);
        LocalDate f = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate t = to != null ? to : LocalDate.now();
        int totalDays = (int) f.datesUntil(t.plusDays(1)).count();

        // Medicación
        long medTotal = medLogRepo.countTotalByUserAndPeriod(patient, f, t);
        long medTaken = medLogRepo.countTakenByUserAndPeriod(patient, f, t);
        double medPercent = medTotal == 0 ? 0 : (medTaken * 100.0 / medTotal);

        // Actividad física (días activos vs total días del período)
        long activeDays = activityRepo.countActiveDaysByUserAndPeriod(patient, f, t);
        int activityMinutes = activityRepo.sumDurationByUserAndPeriod(patient, f, t);
        double activityPercent = totalDays == 0 ? 0 : (activeDays * 100.0 / totalDays);

        // Alimentación
        long nutritionDays = nutritionRepo.countByUserAndLogDateBetween(patient, f, t);
        long healthyDays = nutritionRepo.countHealthyDaysByUserAndPeriod(patient, f, t);
        double nutritionPercent = nutritionDays == 0 ? 0 : (healthyDays * 100.0 / nutritionDays);

        // Educación
        long totalContent = contentRepo.count();
        long viewedContent = viewRepo.countByUser(patient);
        double educationPercent = totalContent == 0 ? 0 : (viewedContent * 100.0 / totalContent);

        double overall = (medPercent + activityPercent + nutritionPercent + educationPercent) / 4;

        return PatientReportResponse.builder()
                .patientId(patientId)
                .patientName(patient.getFullName())
                .from(f)
                .to(t)
                .medicationPercent(round(medPercent))
                .activityPercent(round(activityPercent))
                .nutritionPercent(round(nutritionPercent))
                .educationPercent(round(educationPercent))
                .overallSelfCarePercent(round(overall))
                .totalMedicationsScheduled((int) medTotal)
                .totalMedicationsTaken((int) medTaken)
                .totalActivityMinutes(activityMinutes)
                .totalActivityDays((int) activeDays)
                .totalNutritionDays(nutritionDays)
                .healthyNutritionDays(healthyDays)
                .totalEducationContent(totalContent)
                .viewedEducationContent(viewedContent)
                .build();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
