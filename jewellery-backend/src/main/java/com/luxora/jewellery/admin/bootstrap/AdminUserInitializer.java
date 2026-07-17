package com.luxora.jewellery.admin.bootstrap;

import com.luxora.jewellery.user.entity.Role;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.entity.UserRole;
import com.luxora.jewellery.user.repository.RoleRepository;
import com.luxora.jewellery.user.repository.UserRepository;
import com.luxora.jewellery.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Sprint 5 dev/demo convenience: ensures at least one ADMIN user exists so
 * the admin back-office API is reachable out of the box, without a manual
 * SQL step or a bcrypt hash baked into a migration.
 *
 * <p><strong>This seeds a fixed, publicly-documented password
 * ({@code Admin@12345}).</strong> It is intentionally simple for local
 * dev/demo purposes only - any real deployment MUST change this password
 * (or disable/remove this runner) immediately after first login.
 *
 * <p>Idempotent: checks whether any user already holds the ADMIN role before
 * doing anything, so this never runs twice / never creates duplicates.
 */
@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {

    private static final String ADMIN_ROLE_NAME = "ADMIN";
    private static final String DEFAULT_ADMIN_EMAIL = "admin@srisaifashionjewellery.local";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@12345";
    private static final String DEFAULT_ADMIN_FULL_NAME = "Store Admin";

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Role adminRole = roleRepository.findByName(ADMIN_ROLE_NAME)
                .orElseThrow(() -> new IllegalStateException(
                        "Role '" + ADMIN_ROLE_NAME + "' is missing; check the seed migration"));

        if (userRoleRepository.existsByRole_Id(adminRole.getId())) {
            // Already have at least one admin - nothing to do, and nothing to log,
            // so repeated restarts don't spam the log with a "created" message.
            return;
        }

        // Reuse an existing user row with this email if one somehow already
        // exists (e.g. registered as a plain customer first) rather than
        // fail on the unique email constraint; otherwise create a fresh one.
        User adminUser = userRepository.findByEmailIgnoreCase(DEFAULT_ADMIN_EMAIL)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(DEFAULT_ADMIN_EMAIL)
                        .passwordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                        .fullName(DEFAULT_ADMIN_FULL_NAME)
                        .isActive(true)
                        .build()));

        userRoleRepository.save(UserRole.builder().user(adminUser).role(adminRole).build());

        log.info("Created default ADMIN user '{}' (password: {}) - CHANGE THIS before any real deployment.",
                DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
    }
}
