package com.nybutik.module.return_.service;

import com.nybutik.module.order.entity.Order;
import com.nybutik.module.order.entity.OrderItem;
import com.nybutik.module.order.enums.OrderStatus;
import com.nybutik.module.order.repository.OrderRepository;
import com.nybutik.module.return_.dto.request.AdminUpdateReturnRequest;
import com.nybutik.module.return_.dto.request.CreateReturnRequest;
import com.nybutik.module.return_.dto.request.ReturnItemRequest;
import com.nybutik.module.return_.dto.response.ReturnItemResponse;
import com.nybutik.module.return_.dto.response.ReturnResponse;
import com.nybutik.module.return_.dto.response.ReturnSummaryResponse;
import com.nybutik.module.return_.entity.Return;
import com.nybutik.module.return_.entity.ReturnItem;
import com.nybutik.module.return_.enums.ReturnStatus;
import com.nybutik.module.return_.repository.ReturnRepository;
import com.nybutik.module.user.entity.User;
import com.nybutik.module.user.repository.UserRepository;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import com.nybutik.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReturnResponse createReturn(Long userId, CreateReturnRequest req) {
        Order order = orderRepository.findByIdAndUserIdWithItems(req.orderId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş", req.orderId()));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessException(
                    "İade sadece teslim edilmiş siparişler için yapılabilir",
                    HttpStatus.BAD_REQUEST);
        }

        Map<Long, OrderItem> orderItemMap = order.getItems().stream()
                .collect(Collectors.toMap(OrderItem::getId, i -> i));

        for (ReturnItemRequest itemReq : req.items()) {
            OrderItem orderItem = orderItemMap.get(itemReq.orderItemId());
            if (orderItem == null) {
                throw new BusinessException(
                        "Sipariş kalemi bulunamadı: " + itemReq.orderItemId(),
                        HttpStatus.BAD_REQUEST);
            }
            if (itemReq.quantity() > orderItem.getQuantity()) {
                throw new BusinessException(
                        "İade miktarı sipariş miktarından fazla olamaz (kalem: " + itemReq.orderItemId() + ")",
                        HttpStatus.BAD_REQUEST);
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı", userId));

        Return returnEntity = Return.builder()
                .order(order)
                .user(user)
                .status(ReturnStatus.REQUESTED)
                .reason(req.reason())
                .description(req.description())
                .build();

        for (ReturnItemRequest itemReq : req.items()) {
            ReturnItem returnItem = ReturnItem.builder()
                    .returnRequest(returnEntity)
                    .orderItemId(itemReq.orderItemId())
                    .quantity(itemReq.quantity())
                    .build();
            returnEntity.getItems().add(returnItem);
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        orderRepository.save(order);

        Return saved = returnRepository.save(returnEntity);
        return toResponse(saved);
    }

    public PageResponse<ReturnSummaryResponse> getMyReturns(Long userId, Pageable pageable) {
        return PageResponse.from(
                returnRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(this::toSummary)
        );
    }

    public ReturnResponse getMyReturn(Long userId, Long returnId) {
        Return returnEntity = returnRepository.findByIdWithItems(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("İade", returnId));
        if (!returnEntity.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("İade", returnId);
        }
        return toResponse(returnEntity);
    }

    public PageResponse<ReturnSummaryResponse> adminListReturns(ReturnStatus status, Pageable pageable) {
        var page = status != null
                ? returnRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : returnRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(page.map(this::toSummary));
    }

    public ReturnResponse adminGetReturn(Long id) {
        Return returnEntity = returnRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("İade", id));
        return toResponse(returnEntity);
    }

    @Transactional
    public ReturnResponse adminUpdateReturn(Long id, AdminUpdateReturnRequest req, Long adminId) {
        Return returnEntity = returnRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("İade", id));

        returnEntity.setStatus(req.status());

        if (req.adminNote() != null) {
            returnEntity.setAdminNote(req.adminNote());
        }
        if (req.returnTracking() != null) {
            returnEntity.setReturnTracking(req.returnTracking());
        }

        if (req.status() == ReturnStatus.RECEIVED) {
            returnEntity.getOrder().setStatus(OrderStatus.RETURNED);
            orderRepository.save(returnEntity.getOrder());
        }

        if (req.status() == ReturnStatus.REFUNDED && req.refundAmount() != null) {
            returnEntity.setRefundAmount(req.refundAmount());
        }

        Return saved = returnRepository.save(returnEntity);
        return toResponse(saved);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private ReturnResponse toResponse(Return r) {
        Map<Long, OrderItem> orderItemMap = r.getOrder().getItems().stream()
                .collect(Collectors.toMap(OrderItem::getId, i -> i));

        List<ReturnItemResponse> itemResponses = r.getItems().stream().map(ri -> {
            OrderItem orderItem = orderItemMap.get(ri.getOrderItemId());
            String productName = orderItem != null ? orderItem.getProductName() : null;
            String sku = orderItem != null ? orderItem.getSku() : null;
            return new ReturnItemResponse(ri.getId(), ri.getOrderItemId(), productName, sku, ri.getQuantity());
        }).toList();

        return new ReturnResponse(
                r.getId(),
                r.getOrder().getId(),
                r.getOrder().getOrderNumber(),
                r.getStatus(),
                r.getReason(),
                r.getDescription(),
                r.getAdminNote(),
                r.getReturnTracking(),
                r.getRefundAmount(),
                itemResponses,
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private ReturnSummaryResponse toSummary(Return r) {
        int itemCount = r.getItems().stream().mapToInt(ReturnItem::getQuantity).sum();
        return new ReturnSummaryResponse(
                r.getId(),
                r.getOrder().getId(),
                r.getOrder().getOrderNumber(),
                r.getStatus(),
                r.getReason(),
                itemCount,
                r.getRefundAmount(),
                r.getCreatedAt()
        );
    }
}
