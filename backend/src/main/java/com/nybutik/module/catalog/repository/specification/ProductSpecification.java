package com.nybutik.module.catalog.repository.specification;

import com.nybutik.module.catalog.entity.*;
import com.nybutik.module.catalog.enums.ProductStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> buildFilter(
            Long categoryId,
            List<Long> colorIds,
            List<Long> sizeIds,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search,
            Boolean featured,
            ProductStatus status
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNull(root.get("deletedAt")));
            predicates.add(cb.equal(root.get("status"), status != null ? status : ProductStatus.ACTIVE));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (featured != null && featured) {
                predicates.add(cb.isTrue(root.get("featured")));
            }

            if ((colorIds != null && !colorIds.isEmpty()) || (sizeIds != null && !sizeIds.isEmpty())
                    || minPrice != null || maxPrice != null) {
                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
                variantJoin.on(cb.isTrue(variantJoin.get("isActive")));

                if (colorIds != null && !colorIds.isEmpty()) {
                    predicates.add(variantJoin.get("color").get("id").in(colorIds));
                }
                if (sizeIds != null && !sizeIds.isEmpty()) {
                    predicates.add(variantJoin.get("size").get("id").in(sizeIds));
                }
                if (minPrice != null) {
                    predicates.add(cb.greaterThanOrEqualTo(variantJoin.get("price"), minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(cb.lessThanOrEqualTo(variantJoin.get("price"), maxPrice));
                }
                query.distinct(true);
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("shortDesc")), pattern);
                predicates.add(cb.or(nameLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
