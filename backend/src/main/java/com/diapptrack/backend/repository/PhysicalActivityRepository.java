package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.PhysicalActivity;
import com.diapptrack.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PhysicalActivityRepository extends JpaRepository<PhysicalActivity, Long> {

    Page<PhysicalActivity> findByUserOrderByActivityDateDesc(User user, Pageable pageable);

    List<PhysicalActivity> findByUserOrderByActivityDateDesc(User user);

    Page<PhysicalActivity> findByUserAndActivityDateBetweenOrderByActivityDateDesc(
            User user, LocalDate from, LocalDate to, Pageable pageable);

    @Query("SELECT COALESCE(SUM(pa.durationMin), 0) FROM PhysicalActivity pa WHERE pa.user = :user AND pa.activityDate BETWEEN :from AND :to")
    Integer sumDurationByUserAndPeriod(@Param("user") User user,
                                       @Param("from") LocalDate from,
                                       @Param("to") LocalDate to);

    @Query("SELECT COUNT(DISTINCT pa.activityDate) FROM PhysicalActivity pa WHERE pa.user = :user AND pa.activityDate BETWEEN :from AND :to")
    long countActiveDaysByUserAndPeriod(@Param("user") User user,
                                        @Param("from") LocalDate from,
                                        @Param("to") LocalDate to);
}
