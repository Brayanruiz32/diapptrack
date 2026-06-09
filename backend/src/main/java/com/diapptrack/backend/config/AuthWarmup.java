package com.diapptrack.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Calienta la cadena de autenticación al arrancar.
 *
 * Problema: la PRIMERA petición de login tras iniciar el backend inicializa de
 * forma perezosa los filtros de seguridad + AuthenticationManager + la primera
 * transacción, y ese primer intento puede fallar con 401.
 *
 * Solución: al estar lista la app, se hace una petición de login "en seco" con
 * credenciales inexistentes (responde 401 y no crea sesión ni afecta datos),
 * de modo que el primer login REAL del usuario ya encuentre todo inicializado.
 */
@Component
@Slf4j
public class AuthWarmup {

    @Value("${server.port:8080}")
    private int port;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @EventListener(ApplicationReadyEvent.class)
    public void warmUpAuthentication() {
        String url = "http://localhost:" + port + contextPath + "/auth/login";
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString("email=__warmup__@diapptrack.local&password=__warmup__"))
                    .build();

            client.send(request, HttpResponse.BodyHandlers.discarding());
            log.info("✅  Warm-up de autenticación completado (cadena de login inicializada).");
        } catch (Exception e) {
            // No es crítico: si falla, simplemente el primer login real hará el arranque en frío.
            log.warn("Warm-up de autenticación no se pudo completar: {}", e.getMessage());
        }
    }
}
