package com.diapptrack.backend.repository;

import com.diapptrack.backend.entity.QuestionnaireKey;
import com.diapptrack.backend.entity.QuestionnaireSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionnaireSettingRepository extends JpaRepository<QuestionnaireSetting, QuestionnaireKey> {
    List<QuestionnaireSetting> findByEnabledTrue();
}
