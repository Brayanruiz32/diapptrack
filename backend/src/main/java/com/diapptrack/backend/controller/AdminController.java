package com.diapptrack.backend.controller;

import com.diapptrack.backend.dto.request.AdminCreatePatientRequest;
import com.diapptrack.backend.dto.request.EducationContentRequest;
import com.diapptrack.backend.dto.request.UpdateProfileRequest;
import com.diapptrack.backend.dto.response.*;
import com.diapptrack.backend.service.AdminService;
import com.diapptrack.backend.service.EducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final EducationService educationService;

    // --- Dashboard ---

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // --- Pacientes ---

    @GetMapping("/patients")
    public ResponseEntity<List<UserResponse>> listPatients() {
        return ResponseEntity.ok(adminService.listPatients());
    }

    @PostMapping("/patients")
    public ResponseEntity<UserResponse> createPatient(@Valid @RequestBody AdminCreatePatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createPatient(request));
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<UserResponse> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getPatient(id));
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<UserResponse> updatePatient(@PathVariable Long id,
                                                       @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(adminService.updatePatient(id, request));
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        adminService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    // --- Glucosa del paciente ---

    @GetMapping("/patients/{id}/glucose")
    public ResponseEntity<PageResponse<GlucoseResponse>> getPatientGlucose(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getPatientGlucose(id, from, to, PageRequest.of(page, size)));
    }

    // --- Medicación del paciente ---

    @GetMapping("/patients/{id}/medications")
    public ResponseEntity<PageResponse<MedicationLogResponse>> getPatientMedications(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getPatientMedicationLogs(id, from, to, PageRequest.of(page, size)));
    }

    // --- Actividad del paciente ---

    @GetMapping("/patients/{id}/activities")
    public ResponseEntity<PageResponse<PhysicalActivityResponse>> getPatientActivities(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getPatientActivities(id, from, to, PageRequest.of(page, size)));
    }

    // --- Nutrición del paciente ---

    @GetMapping("/patients/{id}/nutrition")
    public ResponseEntity<PageResponse<NutritionLogResponse>> getPatientNutrition(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getPatientNutrition(id, from, to, PageRequest.of(page, size)));
    }

    // --- Educación del paciente ---

    @GetMapping("/patients/{id}/education")
    public ResponseEntity<List<EducationContentResponse>> getPatientEducation(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getPatientEducationViews(id));
    }

    // --- Reporte del paciente ---

    @GetMapping("/patients/{id}/report")
    public ResponseEntity<PatientReportResponse> getPatientReport(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(adminService.getPatientReport(id, from, to));
    }

    // --- Gestión de contenido educativo ---

    @PostMapping("/education")
    public ResponseEntity<EducationContentResponse> createContent(@Valid @RequestBody EducationContentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(educationService.create(request));
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<EducationContentResponse> updateContent(@PathVariable Long id,
                                                                   @Valid @RequestBody EducationContentRequest request) {
        return ResponseEntity.ok(educationService.update(id, request));
    }

    @PostMapping(value = "/education/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EducationContentResponse> uploadContentImage(@PathVariable Long id,
                                                                        @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(educationService.uploadImage(id, file));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        educationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
