package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    @Query("""
        SELECT DISTINCT u FROM User u WHERE u.role = 'PATIENT' AND u.active = true
        AND (
            EXISTS (SELECT g FROM GlucoseRecord g WHERE g.user = u AND g.createdAt >= :since)
            OR EXISTS (SELECT ml FROM MedicationLog ml WHERE ml.user = u AND ml.createdAt >= :since)
            OR EXISTS (SELECT pa FROM PhysicalActivity pa WHERE pa.user = u AND pa.createdAt >= :since)
            OR EXISTS (SELECT nl FROM NutritionLog nl WHERE nl.user = u AND nl.createdAt >= :since)
        )
    """)
    List<User> findActivePatients(@Param("since") LocalDateTime since);
}
