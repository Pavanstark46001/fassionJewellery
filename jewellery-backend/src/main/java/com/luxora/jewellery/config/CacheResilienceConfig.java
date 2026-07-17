package com.luxora.jewellery.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Configuration;

/**
 * Makes Redis a "best effort" cache rather than a hard dependency for request
 * handling. Spring Boot's Lettuce-backed connection factory already connects
 * lazily, so the app starts fine even if Redis is unreachable at boot; this
 * handler additionally swallows (and just logs) any cache get/put/evict
 * failure that happens later, so a Redis outage degrades catalog endpoints to
 * "uncached" instead of 500s.
 *
 * <p>If you want caching to actually work, start Redis, e.g.:
 * {@code docker run -p 6379:6379 redis} (a docker-compose.yml for this is
 * expected to be added at the repo root separately).
 */
@Slf4j
@Configuration
public class CacheResilienceConfig implements CachingConfigurer {

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache GET failed for cache '{}' key '{}': {}. Falling back to uncached.",
                        cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache PUT failed for cache '{}' key '{}': {}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache EVICT failed for cache '{}' key '{}': {}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache CLEAR failed for cache '{}': {}", cache.getName(), exception.getMessage());
            }
        };
    }
}
