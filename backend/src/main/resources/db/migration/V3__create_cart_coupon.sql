CREATE TABLE coupons
(
    id               BIGSERIAL PRIMARY KEY,
    code             VARCHAR(50) UNIQUE  NOT NULL,
    discount_type    VARCHAR(20)         NOT NULL,
    discount_value   NUMERIC(10, 2)      NOT NULL,
    min_order_amount NUMERIC(12, 2),
    max_uses         INTEGER,
    uses_per_user    INTEGER             NOT NULL DEFAULT 1,
    used_count       INTEGER             NOT NULL DEFAULT 0,
    is_active        BOOLEAN             NOT NULL DEFAULT true,
    starts_at        TIMESTAMP,
    expires_at       TIMESTAMP,
    created_at       TIMESTAMP           NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP           NOT NULL DEFAULT now()
);

CREATE TABLE carts
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT REFERENCES users (id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    coupon_id  BIGINT REFERENCES coupons (id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_carts_user_id ON carts (user_id);
CREATE INDEX idx_carts_session_id ON carts (session_id);

CREATE TABLE cart_items
(
    id         BIGSERIAL PRIMARY KEY,
    cart_id    BIGINT         NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
    variant_id BIGINT         NOT NULL REFERENCES product_variants (id),
    quantity   INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at TIMESTAMP      NOT NULL DEFAULT now(),
    UNIQUE (cart_id, variant_id)
);
