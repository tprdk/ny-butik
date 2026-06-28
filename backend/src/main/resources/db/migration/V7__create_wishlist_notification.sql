CREATE TABLE wishlists
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    product_id BIGINT    NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists (user_id);

CREATE TABLE notification_logs
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users (id),
    channel      VARCHAR(20)  NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    recipient    VARCHAR(255) NOT NULL,
    subject      VARCHAR(255),
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    provider_ref VARCHAR(255),
    error        TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT now(),
    sent_at      TIMESTAMP
);

CREATE INDEX idx_notification_logs_user_id ON notification_logs (user_id);
CREATE INDEX idx_notification_logs_status ON notification_logs (status);
