package com.nybutik.module.coupon.service;

import com.nybutik.module.coupon.dto.request.CreateCouponRequest;
import com.nybutik.module.coupon.dto.response.CouponResponse;
import com.nybutik.module.coupon.entity.Coupon;
import com.nybutik.module.coupon.enums.DiscountType;
import com.nybutik.module.coupon.repository.CouponRepository;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ConflictException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;

    public Page<CouponResponse> list(Pageable pageable) {
        return couponRepository.findAll(pageable).map(this::toResponse);
    }

    public CouponResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public CouponResponse create(CreateCouponRequest req) {
        if (couponRepository.findByCodeIgnoreCase(req.code()).isPresent()) {
            throw new ConflictException("Bu kupon kodu zaten mevcut: " + req.code());
        }

        Coupon coupon = Coupon.builder()
                .code(req.code().toUpperCase())
                .discountType(req.discountType())
                .discountValue(req.discountValue())
                .minOrderAmount(req.minOrderAmount())
                .maxUses(req.maxUses())
                .usesPerUser(req.usesPerUser())
                .isActive(true)
                .usedCount(0)
                .startsAt(req.startsAt())
                .expiresAt(req.expiresAt())
                .build();

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse update(Long id, CreateCouponRequest req) {
        Coupon coupon = findById(id);

        couponRepository.findByCodeIgnoreCase(req.code())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new ConflictException("Bu kupon kodu başka bir kupona ait: " + req.code()); });

        coupon.setCode(req.code().toUpperCase());
        coupon.setDiscountType(req.discountType());
        coupon.setDiscountValue(req.discountValue());
        coupon.setMinOrderAmount(req.minOrderAmount());
        coupon.setMaxUses(req.maxUses());
        coupon.setUsesPerUser(req.usesPerUser());
        coupon.setStartsAt(req.startsAt());
        coupon.setExpiresAt(req.expiresAt());

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse toggle(Long id) {
        Coupon coupon = findById(id);
        coupon.setIsActive(!coupon.getIsActive());
        return toResponse(couponRepository.save(coupon));
    }

    // Sepete kupon uygularken çağrılır
    public Coupon validateAndGet(String code, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BusinessException("Geçersiz kupon kodu", HttpStatus.BAD_REQUEST, "INVALID_COUPON"));

        if (!coupon.getIsActive()) {
            throw new BusinessException("Bu kupon aktif değil", HttpStatus.BAD_REQUEST, "COUPON_INACTIVE");
        }

        Instant now = Instant.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new BusinessException("Bu kupon henüz geçerli değil", HttpStatus.BAD_REQUEST, "COUPON_NOT_STARTED");
        }
        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            throw new BusinessException("Bu kuponun süresi dolmuş", HttpStatus.BAD_REQUEST, "COUPON_EXPIRED");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BusinessException("Bu kupon kullanım limitine ulaştı", HttpStatus.BAD_REQUEST, "COUPON_LIMIT_REACHED");
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException(
                    "Minimum sipariş tutarı ₺%s olmalıdır".formatted(coupon.getMinOrderAmount()),
                    HttpStatus.BAD_REQUEST, "COUPON_MIN_AMOUNT");
        }

        return coupon;
    }

    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            return subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
        }
        return coupon.getDiscountValue().min(subtotal);
    }

    @Transactional
    public void incrementUsedCount(Coupon coupon) {
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    public Coupon findById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kupon", id));
    }

    private CouponResponse toResponse(Coupon c) {
        return new CouponResponse(
                c.getId(), c.getCode(), c.getDiscountType(), c.getDiscountValue(),
                c.getMinOrderAmount(), c.getMaxUses(), c.getUsesPerUser(),
                c.getUsedCount(), c.getIsActive(), c.getStartsAt(), c.getExpiresAt()
        );
    }
}
