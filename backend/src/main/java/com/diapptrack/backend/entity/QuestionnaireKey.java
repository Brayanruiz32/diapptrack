package com.diapptrack.backend.entity;

/**
 * Instancia concreta de un cuestionario que el usuario responde una sola vez.
 * El Cuestionario 1 se responde dos veces (pretest y postest).
 */
public enum QuestionnaireKey {
    Q1_PRETEST(Questionnaire.Q1, "Cuestionario 1 - Pretest"),
    Q1_POSTEST(Questionnaire.Q1, "Cuestionario 1 - Postest"),
    Q2(Questionnaire.Q2, "Cuestionario 2");

    private final Questionnaire questionnaire;
    private final String label;

    QuestionnaireKey(Questionnaire questionnaire, String label) {
        this.questionnaire = questionnaire;
        this.label = label;
    }

    public Questionnaire getQuestionnaire() {
        return questionnaire;
    }

    public String getLabel() {
        return label;
    }
}
