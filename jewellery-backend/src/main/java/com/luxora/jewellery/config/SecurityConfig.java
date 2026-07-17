package com.luxora.jewellery.config;

import com.luxora.jewellery.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Stateless, JWT-based security configuration.
 *
 * <p>Phase 1 only exposes read-mostly public catalog/home endpoints plus a
 * minimal auth flow, so the rule set is intentionally simple: all {@code GET
 * /api/v1/**} traffic is public, auth's register/login are public (you need
 * to be anonymous to use them), {@code /auth/me} requires a valid JWT, and
 * everything else defaults to authenticated (future-proofing for phases that
 * add mutating endpoints).
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/actuator/health/**",
                                "/actuator/info"
                        ).permitAll()
                        // Sprint 7: sitemap.xml/robots.txt are crawled by unauthenticated search
                        // engine bots and live outside /api/v1/** entirely, so they need their own
                        // explicit permitAll rather than relying on the blanket GET-permitAll rule
                        // below (which only covers /api/v1/**).
                        .requestMatchers("/sitemap.xml", "/robots.txt").permitAll()
                        .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login").permitAll()
                        .requestMatchers("/api/v1/auth/me").authenticated()
                        // Sprint 2: cart/wishlist/addresses are always per-user, private data - they
                        // must require authentication even for GET, so these matchers have to be
                        // registered before the blanket GET-permitAll rule below (first-match-wins).
                        .requestMatchers("/api/v1/cart/**", "/api/v1/wishlist/**", "/api/v1/addresses/**")
                        .authenticated()
                        // Sprint 3: orders (checkout/history/tracking/invoice) are likewise always
                        // per-user private data - same first-match-wins reasoning as above.
                        .requestMatchers("/api/v1/orders/**").authenticated()
                        // Sprint 4: the (mock) notification log is likewise always per-user private
                        // data - same first-match-wins reasoning as above.
                        .requestMatchers("/api/v1/notifications/**").authenticated()
                        // Sprint 5: the admin back-office API requires the ADMIN role - not just
                        // authentication - and must be registered before the blanket GET-permitAll
                        // rule below (first-match-wins), since GET under /admin/** must NOT be
                        // publicly readable.
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        // Sprint 8: a user's wallet (balance + reward/referral transaction
                        // history) is likewise always per-user private data - same
                        // first-match-wins reasoning as cart/wishlist/addresses/orders above.
                        .requestMatchers("/api/v1/wallet/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Comma-separated list of allowed browser origins. Defaults cover the Vite
    // dev server's two possible ports; production/Docker deployments must
    // override this with the real frontend origin(s) via the CORS_ALLOWED_ORIGINS
    // env var (e.g. http://localhost:8080 for the docker-compose nginx frontend).
    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,https://fassion-jewellery.vercel.app}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
