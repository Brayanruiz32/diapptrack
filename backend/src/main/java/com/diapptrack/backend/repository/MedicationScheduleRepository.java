package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.MedicationSchedule;
import com.diapptrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, Long> {

    List<MedicationSchedule> findByMedication_UserAndMedication_ActiveTrueOrderByTimeOfDayAsc(User user);

    long countByMedication_UserAndMedication_ActiveTrue(User user);
}
