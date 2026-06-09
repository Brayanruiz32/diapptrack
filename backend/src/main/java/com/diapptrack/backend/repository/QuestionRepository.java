package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.Question;
import com.diapptrack.backend.entity.Questionnaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuestionnaireOrderByOrderNumAsc(Questionnaire questionnaire);
}
