package com.luxora.jewellery.order.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.order.dto.OrderDetailDto;
import com.luxora.jewellery.order.dto.OrderSummaryDto;
import com.luxora.jewellery.order.dto.PlaceOrderRequest;
import com.luxora.jewellery.order.service.InvoiceService;
import com.luxora.jewellery.order.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Orders", description = "Authenticated user's orders - checkout, history, tracking, invoices")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDetailDto>> placeOrder(Authentication authentication,
                                                                    @Valid @RequestBody PlaceOrderRequest request) {
        OrderDetailDto order = orderService.placeOrder(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Order placed", order));
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderSummaryDto>> listOrders(Authentication authentication, Pageable pageable) {
        return ApiResponse.ok(orderService.listOrders(authentication.getName(), pageable));
    }

    @GetMapping("/{orderNumber}")
    public ApiResponse<OrderDetailDto> getOrder(Authentication authentication, @PathVariable String orderNumber) {
        return ApiResponse.ok(orderService.getOrder(authentication.getName(), orderNumber));
    }

    @PatchMapping("/{orderNumber}/cancel")
    public ApiResponse<OrderDetailDto> cancelOrder(Authentication authentication, @PathVariable String orderNumber) {
        return ApiResponse.ok("Order cancelled", orderService.cancelOrder(authentication.getName(), orderNumber));
    }

    @PostMapping("/{orderNumber}/pay")
    public ApiResponse<OrderDetailDto> payOrder(Authentication authentication, @PathVariable String orderNumber) {
        return ApiResponse.ok("Payment successful", orderService.payOrder(authentication.getName(), orderNumber));
    }

    @GetMapping("/{orderNumber}/invoice")
    public ResponseEntity<byte[]> getInvoice(Authentication authentication, @PathVariable String orderNumber) {
        byte[] pdf = invoiceService.generateInvoicePdf(authentication.getName(), orderNumber);
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(orderNumber + "-invoice.pdf")
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(pdf);
    }
}
