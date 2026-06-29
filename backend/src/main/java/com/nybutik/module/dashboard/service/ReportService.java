package com.nybutik.module.dashboard.service;

import com.nybutik.module.dashboard.dto.SalesReportResponse;
import com.nybutik.module.dashboard.dto.SalesReportRow;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final EntityManager em;

    private static final String REVENUE_STATUSES = "'CONFIRMED','PREPARING','SHIPPED','DELIVERED'";

    @SuppressWarnings("unchecked")
    public SalesReportResponse getDailySalesReport(LocalDate from, LocalDate to) {
        List<Object[]> rows = em.createNativeQuery(
                        "SELECT DATE(created_at) AS d, COUNT(*), COALESCE(SUM(total_amount), 0) " +
                        "FROM orders " +
                        "WHERE status IN (" + REVENUE_STATUSES + ") " +
                        "  AND created_at >= :from AND created_at < :to " +
                        "GROUP BY DATE(created_at) ORDER BY 1"
                )
                .setParameter("from", from.atStartOfDay())
                .setParameter("to", to.plusDays(1).atStartOfDay())
                .getResultList();

        List<SalesReportRow> reportRows = rows.stream()
                .map(r -> new SalesReportRow(
                        ((java.sql.Date) r[0]).toLocalDate(),
                        ((Number) r[1]).longValue(),
                        new BigDecimal(r[2].toString())
                ))
                .toList();

        BigDecimal totalRevenue = reportRows.stream()
                .map(SalesReportRow::revenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalOrders = reportRows.stream().mapToLong(SalesReportRow::orderCount).sum();

        return new SalesReportResponse(from, to, totalRevenue, totalOrders, reportRows);
    }

    public byte[] exportCsv(LocalDate from, LocalDate to) {
        SalesReportResponse report = getDailySalesReport(from, to);
        StringBuilder sb = new StringBuilder("Tarih,Sipariş Sayısı,Gelir (₺)\n");
        for (SalesReportRow row : report.rows()) {
            sb.append(row.date()).append(',')
              .append(row.orderCount()).append(',')
              .append(row.revenue()).append('\n');
        }
        sb.append("Toplam,,").append(report.totalRevenue()).append('\n');
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
