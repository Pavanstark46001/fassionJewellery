package com.luxora.jewellery.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luxora.jewellery.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    /** Sprint 8: this user's own shareable referral code, auto-generated at
     * registration time (see {@code AuthService.register}). */
    @Column(name = "referral_code", unique = true, length = 20)
    private String referralCode;

    /** Sprint 8: set if this user signed up using someone else's referral
     * code. Plain UUID column (not a JPA association) - same
     * no-graph-navigation convention as {@code CartItem}/{@code Address};
     * looked up via {@code UserRepository} when needed. Null for every user
     * who registered without a referral code. */
    @Column(name = "referred_by_user_id")
    private UUID referredByUserId;
}
