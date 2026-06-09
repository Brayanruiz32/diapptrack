package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.GlucoseRecord;
import com.diapptrack.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GlucoseRecordRepository extends JpaRepository<GlucoseRecord, Long> {

    Page<GlucoseRecord> findByUserOrderByMeasuredAtDesc(User user, Pageable pageable);

    List<GlucoseRecord> findByUserOrderByMeasuredAtDesc(User user);

    Page<GlucoseRecord> findByUserAndMeasuredAtBetweenOrderByMeasuredAtDesc(
            User user, LocalDateTime from, LocalDateTime to, Pageable pageable);

    Optional<GlucoseRecord> findTopByUserOrderByMeasuredAtDesc(User user);

    @Query("SELECT AVG(g.valueMgdl) FROM GlucoseRecord g WHERE g.user = :user AND g.measuredAt BETWEEN :from AND :to")
    Double findAverageByUserAndPeriod(@Param("user") User user,
                                      @Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to);
}
