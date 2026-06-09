package com.diapptrack.backend.service;

import com.diapptrack.backend.entity.*;
import com.diapptrack.backend.exception.BusinessException;
import com.diapptrack.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Genera archivos Excel (.xlsx) con la información de los pacientes.
 * Misma estructura de 9 hojas para exportación individual y global,
 * con identificadores de paciente y columnas por variable (compatible con Excel/SPSS).
 */
@Service
@RequiredArgsConstructor
public class ExportService {

    private final UserRepository userRepo;
    private final GlucoseRecordRepository glucoseRepo;
    private final MedicationLogRepository medLogRepo;
    private final PhysicalActivityRepository activityRepo;
    private final NutritionLogRepository nutritionRepo;
    private final EducationViewRepository viewRepo;
    private final QuestionRepository questionRepo;
    private final QuestionnaireResponseRepository responseRepo;
    private final UserService userService;

    @Value("${app.glucose.low-threshold}") private int lowThreshold;
    @Value("${app.glucose.high-threshold}") private int highThreshold;

    private static final DateTimeFormatter DATE     = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter TIME     = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional(readOnly = true)
    public byte[] exportPatient(Long patientId) {
        User patient = userService.getById(patientId);
        return buildWorkbook(List.of(patient));
    }

    @Transactional(readOnly = true)
    public byte[] exportAllPatients() {
        return buildWorkbook(userRepo.findByRole(User.Role.PATIENT));
    }

    // ====================== construcción del libro ======================

    private byte[] buildWorkbook(List<User> users) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle header = headerStyle(wb);

            writePatients(wb, header, users);
            writeGlucose(wb, header, users);
            writeMedication(wb, header, users);
            writeActivity(wb, header, users);
            writeNutrition(wb, header, users);
            writeEducation(wb, header, users);
            writeQuestionnaire(wb, header, users, QuestionnaireKey.Q1_PRETEST, Questionnaire.Q1, "Q1 Pretest");
            writeQuestionnaire(wb, header, users, QuestionnaireKey.Q1_POSTEST, Questionnaire.Q1, "Q1 Postest");
            writeQuestionnaire(wb, header, users, QuestionnaireKey.Q2,         Questionnaire.Q2, "Cuestionario 2");

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("Error al generar el Excel: " + e.getMessage());
        }
    }

    private void writePatients(Workbook wb, CellStyle header, List<User> users) {
        Sheet sheet = wb.createSheet("Pacientes");
        setHeader(sheet, header, "id_paciente", "dni", "nombre", "email", "sexo",
                "fecha_nacimiento", "peso_kg", "altura_cm", "fecha_diagnostico",
                "ultimo_acceso", "activo", "fecha_registro");
        int r = 1;
        for (User u : users) {
            writeRow(sheet, r++,
                    u.getId(), u.getDni(), u.getFullName(), u.getEmail(),
                    u.getSex() != null ? u.getSex().name() : "",
                    fmt(u.getBirthDate()), u.getWeightKg(), u.getHeightCm(),
                    fmt(u.getDiagnosisDate()), fmt(u.getLastLoginAt()),
                    Boolean.TRUE.equals(u.getActive()) ? 1 : 0, fmt(u.getCreatedAt()));
        }
    }

    private void writeGlucose(Workbook wb, CellStyle header, List<User> users) {
        Sheet sheet = wb.createSheet("Glucosa");
        setHeader(sheet, header, "id_paciente", "dni", "fecha_hora", "valor_mgdl", "alerta", "notas");
        int r = 1;
        for (User u : users) {
            for (GlucoseRecord g : glucoseRepo.findByUserOrderByMeasuredAtDesc(u)) {
                writeRow(sheet, r++, u.getId(), u.getDni(), fmt(g.getMeasuredAt()),
                        g.getValueMgdl(), glucoseAlert(g.getValueMgdl()), g.getNotes());
            }
        }
    }

    private void writeMedication(Workbook wb, CellStyle header, List<User> users) {
        Sheet sheet = wb.createSheet("Medicación");
        setHeader(sheet, header, "id_paciente", "dni", "fecha", "medicamento", "dosis", "hora", "tomado");
        int r = 1;
        for (User u : users) {
            for (MedicationLog log : medLogRepo.findByUserOrderByLogDateDesc(u)) {
                MedicationSchedule sch = log.getSchedule();
                Medication med = sch.getMedication();
                writeRow(sheet, r++, u.getId(), u.getDni(), fmt(log.getLogDate()),
                        med.getName(), med.getDose(), fmt(sch.getTimeOfDay()),
                        Boolean.TRUE.equals(log.getTaken()) ? 1 : 0);
            }
        }
    }

    private void writeActivity(Workbook wb, CellStyle header, List<User> users) {
        Sheet sheet = wb.createSheet("Actividad Física");
        setHeader(sheet, header, "id_paciente", "dni", "fecha", "tipo", "duracion_min", "calorias");
        int r = 1;
        for (User u : users) {
            for (PhysicalActivity a : activityRepo.findByUserOrderByActivityDateDesc(u)) {
                writeRow(sheet, r++, u.getId(), u.getDni(), fmt(a.getActivityDate()),
                        a.getActivityType().getName(), a.getDurationMin(), a.getCalories());
            }
        }
    }

    private void writeNutrition(Workbook wb, CellStyle header, List<User> users) {
        Sheet sheet = wb.createSheet("Alimentación");
        setHeader(sheet, header, "id_paciente", "dni", "fecha", "frutas", "verduras",
                "bebidas_azucaradas", "comida_rapida", "respeto_horarios", "saludable");
        int r = 1;
        for (User u : users) {
            for (NutritionLog n : nutritionRepo.findByUserOrderByLogDateDesc(u)) {
                boolean healthy = bool(n.getAteFruits()) && bool(n.getAteVegetables())
                        && !bool(n.getDrankSugary()) && !bool(n.getAteFastFood())
                        && bool(n.getRespectedSchedule());
                writeRow(sheet, r++, u.getId(), u.getDni(), fmt(n.getLogDate()),
                        bit(n.getAteFruits()), bit(n.getAteVegetables()),
                        bit(n.getDrankSugary()), bit(n.getAteFastFood()),
                        bit(n.getRespectedSchedule()), healthy ? 1 : 0);
            }
        }
    }

    private void writeEducation(Workbook wb, CellStyle header, List<User> users) {
        Sheet sheet = wb.createSheet("Educación");
        setHeader(sheet, header, "id_paciente", "dni", "contenido", "tema", "fecha_visto");
        int r = 1;
        for (User u : users) {
            for (EducationView v : viewRepo.findByUserOrderByViewedAtDesc(u)) {
                writeRow(sheet, r++, u.getId(), u.getDni(),
                        v.getContent().getTitle(), v.getContent().getTopic().name(), fmt(v.getViewedAt()));
            }
        }
    }

    private void writeQuestionnaire(Workbook wb, CellStyle header, List<User> users,
                                    QuestionnaireKey key, Questionnaire questionnaire, String sheetName) {
        Sheet sheet = wb.createSheet(sheetName);
        List<Question> questions = questionRepo.findByQuestionnaireOrderByOrderNumAsc(questionnaire);

        String[] cols = new String[4 + questions.size()];
        cols[0] = "id_paciente"; cols[1] = "dni"; cols[2] = "nombre"; cols[3] = "fecha_respuesta";
        for (int i = 0; i < questions.size(); i++) cols[4 + i] = "p" + questions.get(i).getOrderNum();
        setHeader(sheet, header, cols);

        int r = 1;
        for (User u : users) {
            QuestionnaireResponse resp = responseRepo.findByUserAndQuestionnaireKey(u, key).orElse(null);
            if (resp == null) continue;   // solo pacientes que respondieron

            Map<Long, Integer> byQuestion = new HashMap<>();
            for (QuestionnaireAnswer a : resp.getAnswers()) byQuestion.put(a.getQuestion().getId(), a.getAnswerValue());

            Object[] values = new Object[4 + questions.size()];
            values[0] = u.getId(); values[1] = u.getDni(); values[2] = u.getFullName();
            values[3] = fmt(resp.getSubmittedAt());
            for (int i = 0; i < questions.size(); i++) values[4 + i] = byQuestion.get(questions.get(i).getId());
            writeRow(sheet, r++, values);
        }
    }

    // ====================== helpers ======================

    private CellStyle headerStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private void setHeader(Sheet sheet, CellStyle style, String... cols) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < cols.length; i++) {
            Cell c = row.createCell(i);
            c.setCellValue(cols[i]);
            c.setCellStyle(style);
        }
    }

    private void writeRow(Sheet sheet, int rowIdx, Object... values) {
        Row row = sheet.createRow(rowIdx);
        for (int i = 0; i < values.length; i++) {
            Cell c = row.createCell(i);
            Object v = values[i];
            if (v == null) {
                c.setBlank();
            } else if (v instanceof Number n) {
                c.setCellValue(n.doubleValue());
            } else {
                c.setCellValue(v.toString());
            }
        }
    }

    private String glucoseAlert(java.math.BigDecimal value) {
        if (value == null) return "";
        double v = value.doubleValue();
        return v < lowThreshold ? "LOW" : v > highThreshold ? "HIGH" : "NORMAL";
    }

    private boolean bool(Boolean b) { return Boolean.TRUE.equals(b); }
    private int bit(Boolean b) { return Boolean.TRUE.equals(b) ? 1 : 0; }

    private String fmt(LocalDate d) { return d != null ? d.format(DATE) : ""; }
    private String fmt(LocalDateTime d) { return d != null ? d.format(DATETIME) : ""; }
    private String fmt(LocalTime t) { return t != null ? t.format(TIME) : ""; }
}
