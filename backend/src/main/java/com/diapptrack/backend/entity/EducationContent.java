package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "education_content")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EducationContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Topic topic;

    /** Ruta de la imagen asociada (servida desde /uploads). */
    @Column(name = "image_url", length = 255)
    private String imageUrl;

    /** Tiempo estimado de lectura en minutos. */
    @Column(name = "reading_time_minutes")
    private Integer readingTimeMinutes;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (publishedAt == null) publishedAt = createdAt;
    }

    public enum ContentType { ARTICLE, TIP }
    public enum Topic { NUTRITION, ACTIVITY, GLUCOSE, MEDICATION, PREVENTION }
}
