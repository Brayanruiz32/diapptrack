package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.Medication;
import com.diapptrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication, Long> {

    List<Medication> findByUserAndActiveTrueOrderByNameAsc(User user);

    List<Medication> findByUserAndActiveTrue(User user);
}
