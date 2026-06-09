package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.QuestionnaireKey;
import com.diapptrack.backend.entity.QuestionnaireResponse;
import com.diapptrack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuestionnaireResponseRepository extends JpaRepository<QuestionnaireResponse, Long> {

    boolean existsByUserAndQuestionnaireKey(User user, QuestionnaireKey questionnaireKey);

    Optional<QuestionnaireResponse> findByUserAndQuestionnaireKey(User user, QuestionnaireKey questionnaireKey);

    List<QuestionnaireResponse> findByUser(User user);
}
