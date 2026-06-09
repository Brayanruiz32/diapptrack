package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "medication_schedules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "time_of_day", nullable = false)
    private LocalTime timeOfDay;
}
