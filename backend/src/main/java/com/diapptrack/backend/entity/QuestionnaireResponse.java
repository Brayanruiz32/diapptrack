package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questionnaire_responses",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "questionnaire_key"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionnaireResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "questionnaire_key", nullable = false, length = 20)
    private QuestionnaireKey questionnaireKey;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @OneToMany(mappedBy = "response", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<QuestionnaireAnswer> answers = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }

    public void addAnswer(QuestionnaireAnswer answer) {
        answer.setResponse(this);
        this.answers.add(answer);
    }
}
