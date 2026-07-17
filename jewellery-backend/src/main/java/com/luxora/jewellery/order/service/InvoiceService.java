package com.luxora.jewellery.order.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.entity.OrderChannel;
import com.luxora.jewellery.order.entity.OrderItem;
import com.luxora.jewellery.order.repository.OrderItemRepository;
import com.luxora.jewellery.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * PDF invoice generation for a placed order, built on OpenPDF.
 *
 * <p>Sprint 6 adds a second, narrow "thermal receipt" layout ({@link
 * InvoiceFormat#THERMAL}) alongside the original A4 tax-invoice layout, for
 * printing a POS sale on an 80mm receipt printer - 80mm at 72dpi is
 * ~226.77pt, rounded to 227pt here. Both layouts share the same totals math
 * (subtotal/discount/GST/total) and item data; only the page geometry and
 * styling differ.
 */
@Service
@RequiredArgsConstructor
public class InvoiceService {

    /** The two supported invoice/receipt layouts. */
    public enum InvoiceFormat {
        A4,
        THERMAL
    }

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH).withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm", Locale.ENGLISH).withZone(ZoneOffset.UTC);

    /** 80mm expressed in points at 72dpi (80 / 25.4 * 72 ≈ 226.77). */
    private static final float THERMAL_WIDTH_PT = 227f;
    private static final float THERMAL_BASE_HEIGHT_PT = 320f;
    private static final float THERMAL_HEIGHT_PER_ITEM_PT = 28f;

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Customer-facing invoice - ownership-scoped to the requesting user, as
     * before. Always the A4 layout (customers don't get a thermal-receipt
     * option; that's a till/POS concept).
     */
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(String email, String orderNumber) {
        OrderService.OrderWithItems data = orderService.loadOwnedOrderWithItems(email, orderNumber);
        return buildPdf(data.order(), data.items(), InvoiceFormat.A4);
    }

    /**
     * Admin/POS invoice generation - unscoped by requesting user (same
     * unscoped-by-owner pattern as {@code AdminOrderService}), since a POS
     * sale may be linked to a different customer than the admin printing the
     * receipt, or to no customer at all (anonymous walk-in). Supports either
     * layout.
     */
    @Transactional(readOnly = true)
    public byte[] generateAdminInvoicePdf(String orderNumber, InvoiceFormat format) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", "orderNumber", orderNumber));
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedDateAsc(order.getId());
        return buildPdf(order, items, format);
    }

    private byte[] buildPdf(Order order, List<OrderItem> items, InvoiceFormat format) {
        return format == InvoiceFormat.THERMAL ? buildThermalReceipt(order, items) : buildA4Invoice(order, items);
    }

    // ------------------------------------------------------------------
    // A4 tax invoice
    // ------------------------------------------------------------------

    private byte[] buildA4Invoice(Order order, List<OrderItem> items) {
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            Paragraph company = new Paragraph("Sri Sai Fashion Jewellery", titleFont);
            company.add(new Paragraph("Tax Invoice", headingFont));
            document.add(company);
            document.add(spacer());

            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);
            meta.setSpacingBefore(10);
            addPlainCell(meta, "Order Number: " + order.getOrderNumber(), boldFont);
            addPlainCell(meta, "Order Date: " + DATE_FORMAT.format(order.getCreatedDate()), normalFont);
            addPlainCell(meta, "Sale Channel: " + order.getChannel(), normalFont);
            addPlainCell(meta, "Payment Method: " + order.getPaymentMethod(), normalFont);
            addPlainCell(meta, "Payment Status: " + order.getPaymentStatus(), normalFont);
            document.add(meta);
            document.add(spacer());

            if (order.getChannel() == OrderChannel.POS) {
                Paragraph billTo = new Paragraph("Customer:", headingFont);
                document.add(billTo);
                String customerKind = order.getWalkInCustomerName() != null || order.getUserId() == null
                        ? "Walk-in Customer" : "Registered Customer";
                Paragraph info = new Paragraph(
                        order.getShippingFullName() + "\n"
                                + "Phone: " + order.getShippingPhoneNumber() + "\n"
                                + customerKind + " - In-Store Sale",
                        normalFont);
                document.add(info);
            } else {
                Paragraph shipTo = new Paragraph("Ship To:", headingFont);
                document.add(shipTo);
                Paragraph addr = new Paragraph(
                        order.getShippingFullName() + "\n"
                                + order.getShippingAddressLine1()
                                + (order.getShippingAddressLine2() != null ? ", " + order.getShippingAddressLine2() : "")
                                + "\n" + order.getShippingCity() + ", " + order.getShippingState()
                                + " - " + order.getShippingPostalCode() + "\n"
                                + order.getShippingCountry() + "\n"
                                + "Phone: " + order.getShippingPhoneNumber(),
                        normalFont);
                document.add(addr);
            }
            document.add(spacer());

            PdfPTable table = new PdfPTable(new float[]{3.2f, 1.3f, 0.8f, 1.2f, 1.2f});
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            addHeaderCell(table, "Item", tableHeaderFont);
            addHeaderCell(table, "Ornament ID", tableHeaderFont);
            addHeaderCell(table, "Qty", tableHeaderFont);
            addHeaderCell(table, "Unit Price", tableHeaderFont);
            addHeaderCell(table, "Line Total", tableHeaderFont);

            for (OrderItem item : items) {
                addBodyCell(table, item.getProductName(), normalFont, Element.ALIGN_LEFT);
                addBodyCell(table, item.getOrnamentId(), normalFont, Element.ALIGN_LEFT);
                addBodyCell(table, String.valueOf(item.getQuantity()), normalFont, Element.ALIGN_CENTER);
                addBodyCell(table, formatAmount(item.getUnitPrice()), normalFont, Element.ALIGN_RIGHT);
                addBodyCell(table, formatAmount(item.getLineTotal()), normalFont, Element.ALIGN_RIGHT);
            }
            document.add(table);

            PdfPTable totals = new PdfPTable(new float[]{4f, 1.5f});
            totals.setWidthPercentage(50);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totals.setSpacingBefore(10);
            addTotalRow(totals, "Subtotal", formatAmount(order.getSubtotal()), normalFont);
            if (order.getDiscountAmount() != null && order.getDiscountAmount().signum() > 0) {
                addTotalRow(totals, "Discount", "- " + formatAmount(order.getDiscountAmount()), normalFont);
            }
            if (order.getChannel() == OrderChannel.WEB) {
                addTotalRow(totals, "Shipping Fee", formatAmount(order.getShippingFee()), normalFont);
            }
            if (order.getGstAmount() != null && order.getGstAmount().signum() > 0) {
                addTotalRow(totals, "GST (3%)", formatAmount(order.getGstAmount()), normalFont);
            }
            addTotalRow(totals, "Total Amount", formatAmount(order.getTotalAmount()), boldFont);
            document.add(totals);

            document.add(spacer());
            document.add(new Paragraph(
                    order.getChannel() == OrderChannel.POS
                            ? "Thank you for shopping in-store with Sri Sai Fashion Jewellery."
                            : "This is a system-generated invoice foundation and does not include tax breakdowns "
                                    + "beyond the GST amount shown above.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY)));

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            document.close();
            throw new IllegalStateException(
                    "Failed to generate invoice PDF for order " + order.getOrderNumber(), e);
        }
    }

    // ------------------------------------------------------------------
    // Thermal (80mm) receipt
    // ------------------------------------------------------------------

    private byte[] buildThermalReceipt(Order order, List<OrderItem> items) {
        float height = THERMAL_BASE_HEIGHT_PT + (items.size() * THERMAL_HEIGHT_PER_ITEM_PT);
        Rectangle pageSize = new Rectangle(THERMAL_WIDTH_PT, height);
        Document document = new Document(pageSize, 10, 10, 10, 10);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 7);
            Font smallBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7);

            Paragraph title = new Paragraph("Sri Sai Fashion Jewellery", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                    order.getChannel() == OrderChannel.POS ? "In-Store Receipt" : "Tax Invoice", smallFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
            document.add(thermalDivider(smallFont));

            document.add(new Paragraph("Order: " + order.getOrderNumber(), smallFont));
            document.add(new Paragraph("Date: " + DATE_TIME_FORMAT.format(order.getCreatedDate()), smallFont));
            document.add(new Paragraph("Pay: " + order.getPaymentMethod() + " (" + order.getPaymentStatus() + ")",
                    smallFont));
            String customerLine = order.getShippingFullName() != null ? order.getShippingFullName() : "Walk-in";
            document.add(new Paragraph("Customer: " + customerLine, smallFont));
            document.add(thermalDivider(smallFont));

            PdfPTable itemsTable = new PdfPTable(new float[]{3.2f, 1f, 1.3f});
            itemsTable.setWidthPercentage(100);
            for (OrderItem item : items) {
                addThermalCell(itemsTable, item.getProductName(), smallFont, Element.ALIGN_LEFT);
                addThermalCell(itemsTable, "x" + item.getQuantity(), smallFont, Element.ALIGN_CENTER);
                addThermalCell(itemsTable, formatAmount(item.getLineTotal()), smallFont, Element.ALIGN_RIGHT);
                addThermalCell(itemsTable, item.getOrnamentId(), smallFont, Element.ALIGN_LEFT);
                addThermalCell(itemsTable, "@" + formatAmount(item.getUnitPrice()), smallFont, Element.ALIGN_CENTER);
                addThermalCell(itemsTable, "", smallFont, Element.ALIGN_RIGHT);
            }
            document.add(itemsTable);
            document.add(thermalDivider(smallFont));

            PdfPTable totals = new PdfPTable(new float[]{2f, 1.5f});
            totals.setWidthPercentage(100);
            addThermalTotalRow(totals, "Subtotal", formatAmount(order.getSubtotal()), smallFont);
            if (order.getDiscountAmount() != null && order.getDiscountAmount().signum() > 0) {
                addThermalTotalRow(totals, "Discount", "-" + formatAmount(order.getDiscountAmount()), smallFont);
            }
            if (order.getGstAmount() != null && order.getGstAmount().signum() > 0) {
                addThermalTotalRow(totals, "GST (3%)", formatAmount(order.getGstAmount()), smallFont);
            }
            addThermalTotalRow(totals, "TOTAL", formatAmount(order.getTotalAmount()), smallBoldFont);
            document.add(totals);

            document.add(thermalDivider(smallFont));
            Paragraph footer = new Paragraph("Thank you for shopping with us!", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            document.close();
            throw new IllegalStateException(
                    "Failed to generate thermal receipt PDF for order " + order.getOrderNumber(), e);
        }
    }

    private Paragraph thermalDivider(Font font) {
        Paragraph p = new Paragraph("------------------------------", font);
        p.setSpacingBefore(2);
        p.setSpacingAfter(2);
        return p;
    }

    private void addThermalCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(1);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void addThermalTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, font));
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setPadding(1);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Paragraph(value, font));
        valueCell.setBorder(PdfPCell.NO_BORDER);
        valueCell.setPadding(1);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    // ------------------------------------------------------------------
    // Shared helpers
    // ------------------------------------------------------------------

    private Paragraph spacer() {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(4);
        return p;
    }

    private void addPlainCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPaddingBottom(4);
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBackgroundColor(new Color(74, 55, 40));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, font));
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Paragraph(value, font));
        valueCell.setBorder(PdfPCell.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private String formatAmount(BigDecimal amount) {
        return "Rs. " + amount.setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
