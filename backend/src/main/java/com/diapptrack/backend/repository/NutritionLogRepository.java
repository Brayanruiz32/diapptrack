package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.NutritionLog;
import com.diapptrack.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NutritionLogRepository extends JpaRepository<NutritionLog, Long> {

    Optional<NutritionLog> findByUserAndLogDate(User user, LocalDate logDate);

    Page<NutritionLog> findByUserOrderByLogDateDesc(User user, Pageable pageable);

    List<NutritionLog> findByUserOrderByLogDateDesc(User user);

    Page<NutritionLog> findByUserAndLogDateBetweenOrderByLogDateDesc(
            User user, LocalDate from, LocalDate to, Pageable pageable);

    // Cuenta días con hábitos saludables (sin azúcar, sin fast food, con frutas+verduras y respetando horarios)
    @Query("""
        SELECT COUNT(nl) FROM NutritionLog nl WHERE nl.user = :user
        AND nl.logDate BETWEEN :from AND :to
        AND nl.ateFruits = true
        AND nl.ateVegetables = true
        AND nl.drankSugary = false
        AND nl.ateFastFood = false
        AND nl.respectedSchedule = true
    """)
    long countHealthyDaysByUserAndPeriod(@Param("user") User user,
                                         @Param("from") LocalDate from,
                                         @Param("to") LocalDate to);

    long countByUserAndLogDateBetween(User user, LocalDate from, LocalDate to);
}
