package com.diapptrack.backend.scheduler;

import com.diapptrack.backend.entity.*;
import com.diapptrack.backend.repository.*;
import com.diapptrack.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final NotificationSettingsRepository settingsRepo;
    private final MedicationRepository medicationRepo;
    private final NotificationService notificationService;

    // Cada minuto — comprueba recordatorios de glucosa y actividad
    @Scheduled(cron = "0 * * * * *")
    public void checkGlucoseAndActivityReminders() {
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        settingsRepo.findByGlucoseEnabledAndTime(now).forEach(settings ->
                notificationService.sendToUser(settings.getUser(),
                        "Recordatorio de glucosa",
                        "Es hora de registrar tu medición de glucosa")
        );

        settingsRepo.findByActivityEnabledAndTime(now).forEach(settings ->
                notificationService.sendToUser(settings.getUser(),
                        "Recordatorio de actividad física",
                        "¡No olvides registrar tu actividad física de hoy!")
        );
    }

    // Cada 15 minutos — comprueba recordatorios de medicación
    @Scheduled(cron = "0 */15 * * * *")
    public void checkMedicationReminders() {
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        LocalTime windowStart = now.minusMinutes(7);
        LocalTime windowEnd = now.plusMinutes(7);

        List<NotificationSettings> enabled = settingsRepo.findAllMedicationEnabled();
        enabled.forEach(settings -> {
            User user = settings.getUser();
            List<Medication> medications = medicationRepo.findByUserAndActiveTrue(user);
            medications.forEach(med ->
                med.getSchedules().forEach(schedule -> {
                    LocalTime scheduled = schedule.getTimeOfDay();
                    if (!scheduled.isBefore(windowStart) && !scheduled.isAfter(windowEnd)) {
                        notificationService.sendToUser(user,
                                "Recordatorio de medicación",
                                "Es hora de tomar: " + med.getName() + " (" + med.getDose() + ")");
                    }
                })
            );
        });
    }
}
