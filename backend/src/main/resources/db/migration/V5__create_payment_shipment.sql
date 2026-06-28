CREATE TABLE payments
(
    id            BIGSERIAL PRIMARY KEY,
    order_id      BIGINT         NOT NULL REFERENCES orders (id),
    provider      VARCHAR(50)    NOT NULL,
    provider_ref  VARCHAR(255),
    amount        NUMERIC(12, 2) NOT NULL,
    currency      VARCHAR(3)     NOT NULL DEFAULT 'TRY',
    status        VARCHAR(30)    NOT NULL,
    error_code    VARCHAR(100),
    error_message TEXT,
    initiated_at  TIMESTAMP      NOT NULL DEFAULT now(),
    completed_at  TIMESTAMP,
    created_at    TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP      NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON payments (order_id);
CREATE INDEX idx_payments_provider_ref ON payments (provider_ref);

CREATE TABLE shipments
(
    id                 BIGSERIAL PRIMARY KEY,
    order_id           BIGINT      NOT NULL REFERENCES orders (id),
    provider           VARCHAR(50) NOT NULL,
    tracking_number    VARCHAR(100),
    tracking_url       VARCHAR(500),
    status             VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    estimated_delivery TIMESTAMP,
    delivered_at       TIMESTAMP,
    created_at         TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_order_id ON shipments (order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments (tracking_number);
