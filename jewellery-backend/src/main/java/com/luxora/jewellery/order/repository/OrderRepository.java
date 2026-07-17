package com.luxora.jewellery.order.repository;

import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByUserIdOrderByCreatedDateDesc(UUID userId, Pageable pageable);

    Optional<Order> findByOrderNumberAndUserId(String orderNumber, UUID userId);

    /** Unscoped by user - the admin API can see/act on any order. */
    Optional<Order> findByOrderNumber(String orderNumber);

    /** Admin order list, unscoped by user, newest first. */
    Page<Order> findAllByOrderByCreatedDateDesc(Pageable pageable);

    /** Admin order list filtered by status, newest first. */
    Page<Order> findByStatusOrderByCreatedDateDesc(OrderStatus status, Pageable pageable);

    /** Sprint 8: how many orders (any channel/status) a user has ever
     * placed - used by the referral-bonus logic to detect "this is their
     * first order" right after the current order has been saved. */
    long countByUserId(UUID userId);

    /**
     * Pulls the next value from the {@code order_number_seq} DB sequence so
     * order numbers are sequential and gap-free-ish (Postgres sequences can
     * skip on rollback, which is fine - we only need uniqueness + readability,
     * not a strict audit-grade counter).
     */
    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    long nextOrderNumberSequence();

    /** Total revenue across every order not in {@code excludedStatus} (used
     * by the admin dashboard to exclude cancelled orders). */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> :excludedStatus")
    BigDecimal sumTotalAmountExcludingStatus(@Param("excludedStatus") OrderStatus excludedStatus);

    @Query("SELECT o.status AS status, COUNT(o) AS count FROM Order o GROUP BY o.status")
    List<OrderStatusCount> countGroupByStatus();

    @Query("SELECT o.userId AS userId, COUNT(o) AS count FROM Order o WHERE o.userId IN :userIds GROUP BY o.userId")
    List<UserOrderCount> countGroupByUserIds(@Param("userIds") List<UUID> userIds);

    interface OrderStatusCount {
        OrderStatus getStatus();

        long getCount();
    }

    interface UserOrderCount {
        UUID getUserId();

        long getCount();
    }
}
