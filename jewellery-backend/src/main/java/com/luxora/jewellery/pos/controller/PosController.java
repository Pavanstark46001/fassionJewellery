package com.luxora.jewellery.pos.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.order.dto.OrderDetailDto;
import com.luxora.jewellery.order.service.InvoiceService;
import com.luxora.jewellery.pos.dto.PosCreateCustomerRequest;
import com.luxora.jewellery.pos.dto.PosCustomerSearchDto;
import com.luxora.jewellery.pos.dto.PosProductLookupDto;
import com.luxora.jewellery.pos.dto.PosSaleRequest;
import com.luxora.jewellery.pos.service.PosService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * In-store billing / point-of-sale (POS) for showroom staff. Gated the same
 * way as the rest of the admin back office ({@code hasRole("ADMIN")} via
 * {@code /api/v1/admin/**} in {@code SecurityConfig}) - there is no separate
 * "cashier" role this sprint, staff use the same admin login to run the
 * till. A dedicated lower-privilege cashier role is a future refinement.
 */
@Tag(name = "Admin - POS", description = "In-store billing / point-of-sale for showroom staff (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/pos")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;
    private final InvoiceService invoiceService;

    @GetMapping("/lookup")
    public ApiResponse<List<PosProductLookupDto>> lookup(@RequestParam String code) {
        return ApiResponse.ok(posService.lookupProduct(code));
    }

    @GetMapping("/customers/search")
    public ApiResponse<List<PosCustomerSearchDto>> searchCustomers(@RequestParam String phone) {
        return ApiResponse.ok(posService.searchCustomersByPhone(phone));
    }

    @PostMapping("/customers")
    public ResponseEntity<ApiResponse<PosCustomerSearchDto>> createCustomer(
            @Valid @RequestBody PosCreateCustomerRequest request) {
        PosCustomerSearchDto customer = posService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Customer created", customer));
    }

    @PostMapping("/sales")
    public ResponseEntity<ApiResponse<OrderDetailDto>> createSale(@Valid @RequestBody PosSaleRequest request) {
        OrderDetailDto sale = posService.createSale(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Sale completed", sale));
    }

    @GetMapping("/sales/{orderNumber}/invoice")
    public ResponseEntity<byte[]> getInvoice(@PathVariable String orderNumber,
                                              @RequestParam(defaultValue = "A4") InvoiceService.InvoiceFormat format) {
        byte[] pdf = invoiceService.generateAdminInvoicePdf(orderNumber, format);
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(orderNumber + "-" + format.name().toLowerCase() + ".pdf")
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(pdf);
    }
}
