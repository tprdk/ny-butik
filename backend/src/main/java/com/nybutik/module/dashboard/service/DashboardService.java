package com.nybutik.module.dashboard.service;

import com.nybutik.module.catalog.repository.ProductRepository;
import com.nybutik.module.dashboard.dto.*;
import com.nybutik.module.order.enums.OrderStatus;
import com.nybutik.module.user.enums.Role;
import com.nybutik.module.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final EntityManager em;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private static final List<OrderStatus> REVENUE_STATUSES = List.of(
            OrderStatus.CONFIRMED, OrderStatus.PREPARING,
            OrderStatus.SHIPPED, OrderStatus.DELIVERED
    );

    public DashboardStatsResponse getStats() {
        Instant todayStart = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();

        long totalOrders = count("SELECT COUNT(o) FROM Order o");
        long todayOrders = countSince("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :since", todayStart);

        BigDecimal totalRevenue = sumRevenue(null);
        BigDecimal todayRevenue = sumRevenueSince(todayStart);

        long totalProducts = productRepository.count();
        long lowStockProducts = count(
                "SELECT COUNT(v) FROM ProductVariant v WHERE v.stockQuantity <= 5 AND v.product.status = 'ACTIVE'"
        );

        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long newCustomersToday = countSince(
                "SELECT COUNT(u) FROM User u WHERE u.role = com.nybutik.module.user.enums.Role.CUSTOMER AND u.createdAt >= :since",
                todayStart
        );

        List<OrderSummaryItem> recentOrders = em.createQuery(
                        "SELECT o FROM Order o JOIN FETCH o.user ORDER BY o.createdAt DESC LIMIT 10",
                        com.nybutik.module.order.entity.Order.class
                ).getResultList()
                .stream()
                .map(o -> new OrderSummaryItem(
                        o.getId(), o.getOrderNumber(),
                        o.getUser().getFullName(),
                        o.getTotalAmount(), o.getStatus().name(), o.getCreatedAt()
                ))
                .toList();

        Instant since30d = Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
        List<TopProductItem> topProducts = em.createQuery(
                        """
                        SELECT new com.nybutik.module.dashboard.dto.TopProductItem(
                            oi.variantId, oi.productName, SUM(oi.quantity), SUM(oi.lineTotal))
                        FROM OrderItem oi
                        WHERE oi.order.createdAt >= :since
                          AND oi.order.status IN :statuses
                        GROUP BY oi.variantId, oi.productName
                        ORDER BY SUM(oi.quantity) DESC
                        LIMIT 5
                        """,
                        TopProductItem.class
                )
                .setParameter("since", since30d)
                .setParameter("statuses", REVENUE_STATUSES)
                .getResultList();

        return new DashboardStatsResponse(
                totalOrders, todayOrders,
                totalRevenue, todayRevenue,
                totalProducts, lowStockProducts,
                totalCustomers, newCustomersToday,
                recentOrders, topProducts
        );
    }

    private long count(String jpql) {
        return em.createQuery(jpql, Long.class).getSingleResult();
    }

    private long countSince(String jpql, Instant since) {
        return em.createQuery(jpql, Long.class)
                .setParameter("since", since)
                .getSingleResult();
    }

    private BigDecimal sumRevenue(Object unused) {
        BigDecimal result = em.createQuery(
                        "SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN :statuses",
                        BigDecimal.class
                )
                .setParameter("statuses", REVENUE_STATUSES)
                .getSingleResult();
        return result != null ? result : BigDecimal.ZERO;
    }

    private BigDecimal sumRevenueSince(Instant since) {
        BigDecimal result = em.createQuery(
                        "SELECT SUM(o.totalAmount) FROM Order o WHERE o.status IN :statuses AND o.createdAt >= :since",
                        BigDecimal.class
                )
                .setParameter("statuses", REVENUE_STATUSES)
                .setParameter("since", since)
                .getSingleResult();
        return result != null ? result : BigDecimal.ZERO;
    }
}
