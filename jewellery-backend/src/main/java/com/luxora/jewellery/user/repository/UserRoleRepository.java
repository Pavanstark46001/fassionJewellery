package com.luxora.jewellery.user.repository;

import com.luxora.jewellery.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Not explicitly listed in the original package layout, but required to look
 * up a user's granted roles (e.g. from {@code CustomUserDetailsService})
 * without adding a bidirectional collection to {@link com.luxora.jewellery.user.entity.User}.
 */
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {

    List<UserRole> findByUser_Id(UUID userId);

    /** Used by {@code AdminUserInitializer} to check idempotently whether any
     * user already holds the given role before seeding a default admin. */
    boolean existsByRole_Id(UUID roleId);
}
