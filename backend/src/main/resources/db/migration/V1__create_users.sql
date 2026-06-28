CREATE TABLE users
(
    id             BIGSERIAL PRIMARY KEY,
    email          VARCHAR(255) UNIQUE  NOT NULL,
    password_hash  VARCHAR(255)         NOT NULL,
    first_name     VARCHAR(100)         NOT NULL,
    last_name      VARCHAR(100)         NOT NULL,
    phone          VARCHAR(20),
    role           VARCHAR(20)          NOT NULL DEFAULT 'CUSTOMER',
    email_verified BOOLEAN              NOT NULL DEFAULT false,
    is_active      BOOLEAN              NOT NULL DEFAULT true,
    created_at     TIMESTAMP            NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP            NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) UNIQUE NOT NULL,
    expires_at  TIMESTAMP   NOT NULL,
    revoked     BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

CREATE TABLE email_verification_tokens
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token      VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE addresses
(
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    label         VARCHAR(100),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(20)  NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city          VARCHAR(100) NOT NULL,
    district      VARCHAR(100) NOT NULL,
    postal_code   VARCHAR(10)  NOT NULL,
    country       VARCHAR(2)   NOT NULL DEFAULT 'TR',
    is_default    BOOLEAN      NOT NULL DEFAULT false,
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON addresses (user_id);
