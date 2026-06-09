package com.diapptrack.backend.controller;

import com.diapptrack.backend.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ExportController {

    private static final String XLSX_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private final ExportService exportService;

    /** Exporta toda la información de un paciente en Excel. */
    @GetMapping("/patients/{id}/export")
    public ResponseEntity<byte[]> exportPatient(@PathVariable Long id) {
        return xlsx(exportService.exportPatient(id), "paciente_" + id + ".xlsx");
    }

    /** Exporta la información de todos los pacientes en Excel (9 hojas). */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAll() {
        return xlsx(exportService.exportAllPatients(), "pacientes_todos.xlsx");
    }

    private ResponseEntity<byte[]> xlsx(byte[] data, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(XLSX_TYPE))
                .body(data);
    }
}
