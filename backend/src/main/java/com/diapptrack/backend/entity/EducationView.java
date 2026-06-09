package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "education_views",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "content_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EducationView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private EducationContent content;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @PrePersist
    void onCreate() { viewedAt = LocalDateTime.now(); }
}
