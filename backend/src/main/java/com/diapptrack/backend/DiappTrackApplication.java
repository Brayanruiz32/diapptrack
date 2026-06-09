package com.diapptrack.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class DiappTrackApplication {
    public static void main(String[] args) {
        // Fijar la zona horaria de la JVM a América/Lima (UTC-5)
        // para que LocalDate.now() y LocalDateTime.now() reflejen la hora de Perú.
        TimeZone.setDefault(TimeZone.getTimeZone("America/Lima"));
        SpringApplication.run(DiappTrackApplication.class, args);
    }
}
