package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.AdminCreatePatientRequest;
import com.diapptrack.backend.dto.request.UpdateProfileRequest;
import com.diapptrack.backend.dto.response.*;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AdminService {
    AdminDashboardResponse getDashboard();

    List<UserResponse> listPatients();
    UserResponse getPatient(Long id);
    UserResponse createPatient(AdminCreatePatientRequest request);
    UserResponse updatePatient(Long id, UpdateProfileRequest request);
    void deletePatient(Long id);

    PageResponse<GlucoseResponse> getPatientGlucose(Long patientId, LocalDate from, LocalDate to, Pageable pageable);
    PageResponse<MedicationLogResponse> getPatientMedicationLogs(Long patientId, LocalDate from, LocalDate to, Pageable pageable);
    PageResponse<PhysicalActivityResponse> getPatientActivities(Long patientId, LocalDate from, LocalDate to, Pageable pageable);
    PageResponse<NutritionLogResponse> getPatientNutrition(Long patientId, LocalDate from, LocalDate to, Pageable pageable);
    List<EducationContentResponse> getPatientEducationViews(Long patientId);
    PatientReportResponse getPatientReport(Long patientId, LocalDate from, LocalDate to);
}
