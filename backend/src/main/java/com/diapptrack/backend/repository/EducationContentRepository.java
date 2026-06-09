package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.EducationContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EducationContentRepository extends JpaRepository<EducationContent, Long> {

    Page<EducationContent> findByOrderByPublishedAtDesc(Pageable pageable);

    Page<EducationContent> findByTopicOrderByPublishedAtDesc(
            EducationContent.Topic topic, Pageable pageable);

    Page<EducationContent> findByTypeOrderByPublishedAtDesc(
            EducationContent.ContentType type, Pageable pageable);
}
