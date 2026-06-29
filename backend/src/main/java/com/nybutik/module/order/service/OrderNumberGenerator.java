package com.nybutik.module.order.service;

import com.nybutik.module.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Component
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final OrderRepository orderRepository;

    public synchronized String generate() {
        String dateStr = LocalDate.now().format(DATE_FMT);
        long seq = orderRepository.count() + 1;
        return "NY-%s-%05d".formatted(dateStr, seq);
    }
}
