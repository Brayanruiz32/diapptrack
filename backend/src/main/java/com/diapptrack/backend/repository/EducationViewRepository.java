package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.EducationContent;
import com.diapptrack.backend.entity.EducationView;
import com.diapptrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EducationViewRepository extends JpaRepository<EducationView, Long> {

    boolean existsByUserAndContent(User user, EducationContent content);

    Optional<EducationView> findByUserAndContent(User user, EducationContent content);

    long countByUser(User user);

    List<EducationView> findByUserOrderByViewedAtDesc(User user);

    long countByContent(EducationContent content);
}
