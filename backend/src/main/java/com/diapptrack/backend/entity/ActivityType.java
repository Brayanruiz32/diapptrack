package com.diapptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "activity_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 50)
    private String icon;

    /** MET (Metabolic Equivalent of Task) usado para estimar calorías. */
    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal met;
}
