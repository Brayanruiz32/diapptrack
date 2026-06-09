package com.diapptrack.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.credentials-path}")
    private String credentialsPath;

    @Value("${firebase.project-id}")
    private String projectId;

    @PostConstruct
    public void initialize() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                InputStream serviceAccount = getCredentialsStream();
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setProjectId(projectId)
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("Firebase inicializado correctamente para proyecto: {}", projectId);
            } catch (IOException e) {
                log.warn("No se pudo inicializar Firebase: {}. Las notificaciones push estarán deshabilitadas.", e.getMessage());
            }
        }
    }

    private InputStream getCredentialsStream() throws IOException {
        // Opción 1: variable de entorno con el JSON completo (para Railway/producción)
        String jsonEnv = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
        if (jsonEnv != null && !jsonEnv.isBlank()) {
            return new ByteArrayInputStream(jsonEnv.getBytes(StandardCharsets.UTF_8));
        }
        // Opción 2: archivo en classpath (desarrollo local)
        try {
            return new ClassPathResource(credentialsPath).getInputStream();
        } catch (IOException e) {
            // Opción 3: ruta absoluta del sistema de archivos
            return new java.io.FileInputStream(credentialsPath);
        }
    }
}
