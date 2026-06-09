package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questionnaire_answers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"response_id", "question_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionnaireAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private QuestionnaireResponse response;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "answer_value", nullable = false)
    private Integer answerValue;
}
