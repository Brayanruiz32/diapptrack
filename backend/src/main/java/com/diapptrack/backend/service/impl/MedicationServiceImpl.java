package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.MedicationRequest;
import com.diapptrack.backend.dto.response.MedicationLogResponse;
import com.diapptrack.backend.dto.response.MedicationResponse;
import com.diapptrack.backend.dto.response.MedicationTodayItemResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.entity.Medication;
import com.diapptrack.backend.entity.MedicationLog;
import com.diapptrack.backend.entity.MedicationSchedule;
import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.exception.ResourceNotFoundException;
import com.diapptrack.backend.repository.MedicationLogRepository;
import com.diapptrack.backend.repository.MedicationRepository;
import com.diapptrack.backend.repository.MedicationScheduleRepository;
import com.diapptrack.backend.service.MedicationService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRepository medicationRepo;
    private final MedicationScheduleRepository scheduleRepo;
    private final MedicationLogRepository logRepo;
    private final UserService userService;

    @Override
    @Transactional
    public MedicationResponse create(String email, MedicationRequest request) {
        User user = userService.getByEmail(email);
        Medication med = Medication.builder()
                .user(user)
                .name(request.getName())
                .dose(request.getDose())
                .active(true)
                .build();
        for (LocalTime time : request.getTimes()) {
            med.addSchedule(MedicationSchedule.builder().timeOfDay(time).build());
        }
        return MedicationResponse.from(medicationRepo.save(med));
    }

    @Override
    @Transactional
    public MedicationResponse update(String email, Long id, MedicationRequest request) {
        Medication med = getOwned(email, id);
        med.setName(request.getName());
        med.setDose(request.getDose());
        // Reemplaza los horarios (orphanRemoval elimina los anteriores y sus logs en cascada)
        med.getSchedules().clear();
        for (LocalTime time : request.getTimes()) {
            med.addSchedule(MedicationSchedule.builder().timeOfDay(time).build());
        }
        return MedicationResponse.from(medicationRepo.save(med));
    }

    @Override
    @Transactional
    public void delete(String email, Long id) {
        Medication med = getOwned(email, id);
        med.setActive(false);
        medicationRepo.save(med);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicationResponse> getAll(String email) {
        User user = userService.getByEmail(email);
        return medicationRepo.findByUserAndActiveTrueOrderByNameAsc(user)
                .stream().map(MedicationResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicationTodayItemResponse> getTodayItems(String email) {
        User user = userService.getByEmail(email);
        LocalDate today = LocalDate.now();
        return scheduleRepo.findByMedication_UserAndMedication_ActiveTrueOrderByTimeOfDayAsc(user)
                .stream()
                .map(s -> toTodayItem(s, todayTaken(s, today)))
                .toList();
    }

    @Override
    @Transactional
    public MedicationTodayItemResponse setTodayTaken(String email, Long scheduleId, boolean taken) {
        User user = userService.getByEmail(email);
        MedicationSchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Horario de medicación no encontrado"));
        if (!schedule.getMedication().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Horario de medicación no encontrado");
        }
        LocalDate today = LocalDate.now();
        MedicationLog log = logRepo.findByScheduleAndLogDate(schedule, today)
                .orElseGet(() -> MedicationLog.builder()
                        .schedule(schedule).user(user).logDate(today).taken(false).build());
        log.setTaken(taken);
        logRepo.save(log);
        return toTodayItem(schedule, taken);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MedicationLogResponse> getLogHistory(String email, LocalDate from, LocalDate to, Pageable pageable) {
        User user = userService.getByEmail(email);
        LocalDate f = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate t = to != null ? to : LocalDate.now();
        return PageResponse.from(
                logRepo.findByUserAndLogDateBetweenOrderByLogDateDesc(user, f, t, pageable)
                        .map(MedicationLogResponse::from)
        );
    }

    // --- helpers ---

    private boolean todayTaken(MedicationSchedule schedule, LocalDate date) {
        return logRepo.findByScheduleAndLogDate(schedule, date).map(MedicationLog::getTaken).orElse(false);
    }

    private MedicationTodayItemResponse toTodayItem(MedicationSchedule s, boolean taken) {
        Medication med = s.getMedication();
        return MedicationTodayItemResponse.builder()
                .scheduleId(s.getId())
                .medicationId(med.getId())
                .medicationName(med.getName())
                .dose(med.getDose())
                .time(s.getTimeOfDay())
                .taken(taken)
                .build();
    }

    private Medication getOwned(String email, Long id) {
        User user = userService.getByEmail(email);
        Medication med = medicationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicamento no encontrado"));
        if (!med.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Medicamento no encontrado");
        }
        return med;
    }
}
