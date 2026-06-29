package com.nybutik.module.user.service;

import com.nybutik.module.user.dto.response.CustomerResponse;
import com.nybutik.module.user.dto.response.CustomerSummaryResponse;
import com.nybutik.module.user.entity.User;
import com.nybutik.module.user.enums.Role;
import com.nybutik.module.user.repository.UserRepository;
import com.nybutik.shared.exception.ResourceNotFoundException;
import com.nybutik.shared.response.PageResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final EntityManager em;

    public PageResponse<CustomerSummaryResponse> listCustomers(Pageable pageable) {
        return PageResponse.from(
                userRepository.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER, pageable)
                        .map(u -> new CustomerSummaryResponse(
                                u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(),
                                u.isActive(), u.getCreatedAt()
                        ))
        );
    }

    public CustomerResponse getCustomer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Müşteri", id));

        List<Object[]> stats = em.createQuery(
                        "SELECT COUNT(o), COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.id = :uid",
                        Object[].class
                )
                .setParameter("uid", id)
                .getResultList();

        int orderCount = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;
        if (!stats.isEmpty()) {
            orderCount = ((Number) stats.get(0)[0]).intValue();
            totalSpent = new BigDecimal(stats.get(0)[1].toString());
        }

        return toResponse(user, orderCount, totalSpent);
    }

    @Transactional
    public CustomerResponse toggleActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Müşteri", id));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return toResponse(user, 0, BigDecimal.ZERO);
    }

    private CustomerResponse toResponse(User u, int orderCount, BigDecimal totalSpent) {
        return new CustomerResponse(
                u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(),
                u.isActive(), u.getRole().name(), u.getCreatedAt(),
                orderCount, totalSpent
        );
    }
}
