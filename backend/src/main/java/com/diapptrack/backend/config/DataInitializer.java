package com.diapptrack.backend.config;

import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inicializador de datos que se ejecuta al arrancar el backend.
 * Garantiza que el usuario administrador exista con un hash BCrypt válido.
 *
 * Credenciales admin:
 *   Email:    admin@diapptrack.com
 *   Password: Admin1234!
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL    = "admin@diapptrack.com";
    private static final String ADMIN_PASSWORD = "Admin1234!";
    private static final String ADMIN_NAME     = "Administrador DiabTrack";

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        User admin = userRepository.findByEmail(ADMIN_EMAIL).orElse(null);

        if (admin == null) {
            // Crea el admin si no existe (por si Flyway no insertó el seed)
            admin = User.builder()
                .fullName(ADMIN_NAME)
                .email(ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                .role(User.Role.ADMIN)
                .active(true)
                .build();
            admin = userRepository.save(admin);
            log.info("✅  Usuario administrador CREADO: {}", ADMIN_EMAIL);
        } else {
            // Reescribe el hash con uno calculado por el encoder real de Spring
            admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setActive(true);
            admin.setRole(User.Role.ADMIN);
            admin = userRepository.save(admin);
            log.info("✅  Admin password hash ACTUALIZADO para: {}", ADMIN_EMAIL);
        }

        // --- Auto-verificación: prueba que la contraseña realmente coincide ---
        boolean matches = passwordEncoder.matches(ADMIN_PASSWORD, admin.getPasswordHash());
        log.info("==================================================================");
        log.info("  CREDENCIALES ADMIN");
        log.info("    email    : {}", ADMIN_EMAIL);
        log.info("    password : {}", ADMIN_PASSWORD);
        log.info("    activo   : {}", admin.getActive());
        log.info("    rol      : {}", admin.getRole());
        log.info("    matches  : {}   <-- DEBE ser true", matches);
        log.info("==================================================================");

        if (!matches) {
            log.error("❌  La verificación de contraseña FALLÓ. Revisa el PasswordEncoder.");
        }
    }
}
