package com.luxora.jewellery.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

/**
 * Redis-backed {@link org.springframework.cache.CacheManager} with
 * per-cache-name TTLs tuned to how often each kind of catalog data changes.
 * Taxonomy data (categories/collections/occasions) is essentially static so it
 * gets a long TTL; products change more often; homepage CMS content is
 * refreshed most eagerly since merchandising teams expect near-real-time edits
 * to show up.
 *
 * <p>Note: with {@code spring.cache.type=redis} a reachable Redis instance is
 * required at startup (Spring Boot eagerly validates the connection factory).
 * See the README-style comment in {@code application.yml} for how to run one
 * locally via Docker if you don't already have it running.
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder().build(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY);
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                .entryTtl(Duration.ofMinutes(10));

        Map<String, RedisCacheConfiguration> perCacheTtls = Map.of(
                "categories", defaultConfig.entryTtl(Duration.ofHours(1)),
                "subcategories", defaultConfig.entryTtl(Duration.ofHours(1)),
                "collections", defaultConfig.entryTtl(Duration.ofHours(1)),
                "occasions", defaultConfig.entryTtl(Duration.ofHours(1)),
                "products", defaultConfig.entryTtl(Duration.ofMinutes(15)),
                "homeBanners", defaultConfig.entryTtl(Duration.ofMinutes(5)),
                "homeSections", defaultConfig.entryTtl(Duration.ofMinutes(5))
        );

        return builder -> builder
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(perCacheTtls);
    }
}
