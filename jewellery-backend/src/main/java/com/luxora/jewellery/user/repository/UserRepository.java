package com.luxora.jewellery.user.repository;

import com.luxora.jewellery.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /**
     * Backs the admin customer list search (name/email substring match,
     * case-insensitive). {@code q} may be {@code null}/blank, in which case
     * every user matches.
     */
    @Query("""
            SELECT u FROM User u
            WHERE (:q IS NULL OR :q = ''
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<User> search(@Param("q") String q, Pageable pageable);

    /**
     * Sprint 6: backs the POS register's "look up an existing customer by
     * phone" lookup, so staff can optionally link a walk-in sale to a real
     * account instead of ringing it up anonymously. Deliberately a plain
     * substring match on phone number only - a lightweight lookup, not a
     * full CRM search.
     */
    Page<User> findByPhoneNumberContaining(String phone, Pageable pageable);

    /** Sprint 8: referral code lookup - used both to validate a code
     * supplied at registration and to generate a guaranteed-unique new one. */
    Optional<User> findByReferralCode(String referralCode);

    boolean existsByReferralCode(String referralCode);
}
