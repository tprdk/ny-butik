CREATE TABLE returns
(
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT      NOT NULL REFERENCES orders (id),
    user_id         BIGINT      NOT NULL REFERENCES users (id),
    status          VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    reason          VARCHAR(50) NOT NULL,
    description     TEXT,
    admin_note      TEXT,
    return_tracking VARCHAR(100),
    refund_amount   NUMERIC(12, 2),
    created_at      TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_returns_order_id ON returns (order_id);
CREATE INDEX idx_returns_user_id ON returns (user_id);
CREATE INDEX idx_returns_status ON returns (status);

CREATE TABLE return_items
(
    id            BIGSERIAL PRIMARY KEY,
    return_id     BIGINT  NOT NULL REFERENCES returns (id) ON DELETE CASCADE,
    order_item_id BIGINT  NOT NULL REFERENCES order_items (id),
    quantity      INTEGER NOT NULL
);
