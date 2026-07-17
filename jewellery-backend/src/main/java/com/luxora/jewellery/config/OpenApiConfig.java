package com.luxora.jewellery.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI jewelleryOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sri Sai Fashion Jewellery API")
                        .description("Phase 1: foundation + public catalog/home browse APIs for the Sri Sai Fashion "
                                + "Jewellery artificial-jewellery e-commerce platform. Cart, checkout, payments, "
                                + "inventory and admin management are out of scope for this phase.")
                        .version("v1")
                        .contact(new Contact().name("Sri Sai Fashion Jewellery Engineering")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME_NAME, new SecurityScheme()
                                .name(BEARER_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
