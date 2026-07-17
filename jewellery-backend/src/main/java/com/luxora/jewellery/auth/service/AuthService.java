package com.luxora.jewellery.auth.service;

import com.luxora.jewellery.auth.dto.JwtResponse;
import com.luxora.jewellery.auth.dto.LoginRequest;
import com.luxora.jewellery.auth.dto.RegisterRequest;
import com.luxora.jewellery.auth.dto.UserProfileResponse;
import com.luxora.jewellery.common.exception.ApiException;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.user.entity.Role;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.entity.UserRole;
import com.luxora.jewellery.user.repository.RoleRepository;
import com.luxora.jewellery.user.repository.UserRepository;
import com.luxora.jewellery.user.repository.UserRoleRepository;
import com.luxora.jewellery.loyalty.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String DEFAULT_ROLE = "CUSTOMER";

    /** Sprint 8: referral code alphabet/length - short, unambiguous
     * (no 0/O/1/I), easy to read aloud or type from a friend's screen. */
    private static final String REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int REFERRAL_CODE_RANDOM_LENGTH = 6;
    private static final String REFERRAL_CODE_PREFIX = "REF";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final com.luxora.jewellery.security.JwtTokenProvider jwtTokenProvider;
    private final WalletService walletService;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        User user = provisionCustomer(request.email(), request.password(), request.fullName(),
                request.phoneNumber(), request.referralCode());
        String token = jwtTokenProvider.generateToken(user.getEmail(), List.of(DEFAULT_ROLE));
        return JwtResponse.of(token, user.getId(), user.getEmail(), user.getFullName(), List.of(DEFAULT_ROLE));
    }

    /**
     * Core "create a CUSTOMER account" logic shared by self-service
     * registration ({@link #register}) and staff-initiated creation from the
     * POS till ({@code PosService.createCustomer}) - same account shape
     * either way (password, wallet, referral code, CUSTOMER role), just a
     * different caller and a different DTO wrapping the result. A
     * POS-created customer's password is a random value they don't know
     * yet; they'd use "forgot password" to set their own later, which is a
     * reasonable, common pattern for in-store-created accounts and doesn't
     * need a dedicated flow this sprint.
     */
    @Transactional
    public User provisionCustomer(String email, String rawPassword, String fullName, String phoneNumber,
                                   String referralCode) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        User referrer = resolveReferrer(referralCode);

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .phoneNumber(phoneNumber)
                .isActive(true)
                .referralCode(generateUniqueReferralCode())
                .referredByUserId(referrer != null ? referrer.getId() : null)
                .build();
        user = userRepository.save(user);

        // Every user gets a zero-balance wallet up front, same as the V9
        // migration's backfill for pre-existing users - keeps "does this
        // user have a wallet row" a non-question everywhere else.
        walletService.getOrCreateWallet(user.getId());

        Role customerRole = roleRepository.findByName(DEFAULT_ROLE)
                .orElseThrow(() -> new IllegalStateException(
                        "Default role '" + DEFAULT_ROLE + "' is missing; check the seed migration"));

        userRoleRepository.save(UserRole.builder().user(user).role(customerRole).build());

        return user;
    }

    /**
     * Looks up the referrer for an optional referral code supplied at
     * registration. An unknown/blank code resolves to {@code null} rather
     * than rejecting registration - see {@code RegisterRequest.referralCode}
     * javadoc for why.
     */
    private User resolveReferrer(String referralCode) {
        if (referralCode == null || referralCode.isBlank()) {
            return null;
        }
        return userRepository.findByReferralCode(referralCode.trim().toUpperCase()).orElse(null);
    }

    private String generateUniqueReferralCode() {
        String candidate;
        do {
            StringBuilder sb = new StringBuilder(REFERRAL_CODE_PREFIX);
            for (int i = 0; i < REFERRAL_CODE_RANDOM_LENGTH; i++) {
                sb.append(REFERRAL_CODE_ALPHABET.charAt(RANDOM.nextInt(REFERRAL_CODE_ALPHABET.length())));
            }
            candidate = sb.toString();
        } while (userRepository.existsByReferralCode(candidate));
        return candidate;
    }

    @Transactional(readOnly = true)
    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", request.email()));

        List<String> roles = userRoleRepository.findByUser_Id(user.getId()).stream()
                .map(userRole -> userRole.getRole().getName())
                .toList();

        String token = jwtTokenProvider.generateToken(user.getEmail(), roles);
        return JwtResponse.of(token, user.getId(), user.getEmail(), user.getFullName(), roles);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));

        List<String> roles = userRoleRepository.findByUser_Id(user.getId()).stream()
                .map(userRole -> userRole.getRole().getName())
                .toList();

        return new UserProfileResponse(user.getId(), user.getEmail(), user.getFullName(),
                user.getPhoneNumber(), roles, user.getReferralCode());
    }
}
