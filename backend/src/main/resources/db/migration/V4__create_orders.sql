CREATE TABLE orders
(
    id               BIGSERIAL PRIMARY KEY,
    order_number     VARCHAR(30) UNIQUE   NOT NULL,
    user_id          BIGINT               NOT NULL REFERENCES users (id),
    status           VARCHAR(30)          NOT NULL DEFAULT 'PENDING_PAYMENT',
    coupon_id        BIGINT REFERENCES coupons (id),
    subtotal         NUMERIC(12, 2)       NOT NULL,
    discount_amount  NUMERIC(12, 2)       NOT NULL DEFAULT 0,
    shipping_amount  NUMERIC(12, 2)       NOT NULL DEFAULT 0,
    tax_amount       NUMERIC(12, 2)       NOT NULL DEFAULT 0,
    total_amount     NUMERIC(12, 2)       NOT NULL,
    notes            TEXT,
    shipping_name    VARCHAR(200)         NOT NULL,
    shipping_phone   VARCHAR(20)          NOT NULL,
    shipping_address1 VARCHAR(255)        NOT NULL,
    shipping_address2 VARCHAR(255),
    shipping_city    VARCHAR(100)         NOT NULL,
    shipping_district VARCHAR(100)        NOT NULL,
    shipping_postal  VARCHAR(10)          NOT NULL,
    shipping_country VARCHAR(2)           NOT NULL DEFAULT 'TR',
    billing_name     VARCHAR(200)         NOT NULL,
    billing_phone    VARCHAR(20)          NOT NULL,
    billing_address1 VARCHAR(255)         NOT NULL,
    billing_address2 VARCHAR(255),
    billing_city     VARCHAR(100)         NOT NULL,
    billing_district VARCHAR(100)         NOT NULL,
    billing_postal   VARCHAR(10)          NOT NULL,
    billing_country  VARCHAR(2)           NOT NULL DEFAULT 'TR',
    created_at       TIMESTAMP            NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP            NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_order_number ON orders (order_number);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

CREATE TABLE order_items
(
    id           BIGSERIAL PRIMARY KEY,
    order_id     BIGINT         NOT NULL REFERENCES orders (id),
    variant_id   BIGINT         NOT NULL REFERENCES product_variants (id),
    product_name VARCHAR(300)   NOT NULL,
    sku          VARCHAR(100)   NOT NULL,
    color_name   VARCHAR(100),
    size_name    VARCHAR(50),
    image_url    VARCHAR(500),
    quantity     INTEGER        NOT NULL,
    unit_price   NUMERIC(12, 2) NOT NULL,
    sale_price   NUMERIC(12, 2),
    line_total   NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

CREATE TABLE order_status_history
(
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT      NOT NULL REFERENCES orders (id),
    status     VARCHAR(30) NOT NULL,
    note       TEXT,
    changed_by BIGINT REFERENCES users (id),
    created_at TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_history_order_id ON order_status_history (order_id, created_at DESC);
