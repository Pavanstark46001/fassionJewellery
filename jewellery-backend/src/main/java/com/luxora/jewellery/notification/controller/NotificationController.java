package com.luxora.jewellery.notification.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.notification.dto.NotificationDto;
import com.luxora.jewellery.notification.service.NotificationQueryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Notifications", description = "Authenticated user's own (mocked) notification log")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationQueryService notificationQueryService;

    @GetMapping
    public ApiResponse<PageResponse<NotificationDto>> listNotifications(Authentication authentication,
                                                                          Pageable pageable) {
        return ApiResponse.ok(notificationQueryService.listNotifications(authentication.getName(), pageable));
    }
}
