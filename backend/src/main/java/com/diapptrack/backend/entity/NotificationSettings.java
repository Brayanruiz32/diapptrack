package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "notification_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "glucose_enabled", nullable = false)
    private Boolean glucoseEnabled = false;

    @Column(name = "glucose_time")
    private LocalTime glucoseTime;

    @Column(name = "medication_enabled", nullable = false)
    private Boolean medicationEnabled = false;

    @Column(name = "activity_enabled", nullable = false)
    private Boolean activityEnabled = false;

    @Column(name = "activity_time")
    private LocalTime activityTime;

    @Column(name = "education_enabled", nullable = false)
    private Boolean educationEnabled = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }
}
