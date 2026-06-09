package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.MedicationLog;
import com.diapptrack.backend.entity.MedicationSchedule;
import com.diapptrack.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MedicationLogRepository extends JpaRepository<MedicationLog, Long> {

    Optional<MedicationLog> findByScheduleAndLogDate(MedicationSchedule schedule, LocalDate logDate);

    List<MedicationLog> findByUserAndLogDate(User user, LocalDate logDate);

    List<MedicationLog> findByUserOrderByLogDateDesc(User user);

    Page<MedicationLog> findByUserAndLogDateBetweenOrderByLogDateDesc(
            User user, LocalDate from, LocalDate to, Pageable pageable);

    @Query("""
        SELECT COUNT(ml) FROM MedicationLog ml
        WHERE ml.user = :user AND ml.logDate BETWEEN :from AND :to
    """)
    long countTotalByUserAndPeriod(@Param("user") User user,
                                   @Param("from") LocalDate from,
                                   @Param("to") LocalDate to);

    @Query("""
        SELECT COUNT(ml) FROM MedicationLog ml
        WHERE ml.user = :user AND ml.taken = true AND ml.logDate BETWEEN :from AND :to
    """)
    long countTakenByUserAndPeriod(@Param("user") User user,
                                   @Param("from") LocalDate from,
                                   @Param("to") LocalDate to);
}
