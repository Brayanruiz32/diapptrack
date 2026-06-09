package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.NotificationSettings;
import com.diapptrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {

    Optional<NotificationSettings> findByUser(User user);

    @Query("SELECT ns FROM NotificationSettings ns WHERE ns.glucoseEnabled = true AND ns.glucoseTime = :time")
    List<NotificationSettings> findByGlucoseEnabledAndTime(LocalTime time);

    @Query("SELECT ns FROM NotificationSettings ns WHERE ns.activityEnabled = true AND ns.activityTime = :time")
    List<NotificationSettings> findByActivityEnabledAndTime(LocalTime time);

    @Query("SELECT ns FROM NotificationSettings ns WHERE ns.medicationEnabled = true")
    List<NotificationSettings> findAllMedicationEnabled();

    @Query("SELECT ns FROM NotificationSettings ns WHERE ns.educationEnabled = true")
    List<NotificationSettings> findAllEducationEnabled();
}
