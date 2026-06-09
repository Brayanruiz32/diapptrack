package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "questionnaire_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionnaireSetting {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "questionnaire_key", length = 20)
    private QuestionnaireKey questionnaireKey;

    @Column(nullable = false)
    private Boolean enabled;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
