CREATE TABLE categories
(
    id            BIGSERIAL PRIMARY KEY,
    parent_id     BIGINT REFERENCES categories (id),
    name          VARCHAR(150) NOT NULL,
    slug          VARCHAR(150) UNIQUE NOT NULL,
    description   TEXT,
    image_url     VARCHAR(500),
    display_order INTEGER      NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_is_active ON categories (is_active);

CREATE TABLE products
(
    id            BIGSERIAL PRIMARY KEY,
    category_id   BIGINT       NOT NULL REFERENCES categories (id),
    name          VARCHAR(300) NOT NULL,
    slug          VARCHAR(300) UNIQUE NOT NULL,
    short_desc    VARCHAR(500),
    description   TEXT,
    status        VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    featured      BOOLEAN      NOT NULL DEFAULT false,
    search_vector TSVECTOR,
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMP
);

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_search_vector ON products USING GIN (search_vector);
CREATE INDEX idx_products_featured ON products (featured) WHERE featured = true;

CREATE OR REPLACE FUNCTION update_product_search_vector()
    RETURNS trigger AS
$$
BEGIN
    NEW.search_vector :=
            setweight(to_tsvector('turkish', coalesce(NEW.name, '')), 'A') ||
            setweight(to_tsvector('turkish', coalesce(NEW.short_desc, '')), 'B') ||
            setweight(to_tsvector('turkish', coalesce(NEW.description, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_update
    BEFORE INSERT OR UPDATE OF name, short_desc, description
    ON products
    FOR EACH ROW
EXECUTE FUNCTION update_product_search_vector();

CREATE TABLE product_tags
(
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT      NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    tag        VARCHAR(100) NOT NULL,
    UNIQUE (product_id, tag)
);

CREATE TABLE product_attributes
(
    id            BIGSERIAL PRIMARY KEY,
    product_id    BIGINT       NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    attr_key      VARCHAR(100) NOT NULL,
    attr_value    VARCHAR(255) NOT NULL,
    display_order INTEGER      NOT NULL DEFAULT 0,
    UNIQUE (product_id, attr_key)
);

CREATE TABLE colors
(
    id       BIGSERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    hex_code VARCHAR(7),
    slug     VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE sizes
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    size_group VARCHAR(50),
    sort_order INTEGER     NOT NULL DEFAULT 0,
    UNIQUE (name)
);

CREATE TABLE product_variants
(
    id             BIGSERIAL PRIMARY KEY,
    product_id     BIGINT         NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    color_id       BIGINT REFERENCES colors (id),
    size_id        BIGINT REFERENCES sizes (id),
    sku            VARCHAR(100) UNIQUE NOT NULL,
    price          NUMERIC(12, 2) NOT NULL,
    sale_price     NUMERIC(12, 2),
    stock_quantity INTEGER        NOT NULL DEFAULT 0,
    is_active      BOOLEAN        NOT NULL DEFAULT true,
    created_at     TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP      NOT NULL DEFAULT now(),
    UNIQUE (product_id, color_id, size_id)
);

CREATE INDEX idx_variants_product_id ON product_variants (product_id);
CREATE INDEX idx_variants_sku ON product_variants (sku);
CREATE INDEX idx_variants_stock ON product_variants (stock_quantity);

CREATE TABLE product_images
(
    id            BIGSERIAL PRIMARY KEY,
    product_id    BIGINT       NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    variant_id    BIGINT REFERENCES product_variants (id) ON DELETE SET NULL,
    url           VARCHAR(500) NOT NULL,
    alt_text      VARCHAR(255),
    display_order INTEGER      NOT NULL DEFAULT 0,
    is_primary    BOOLEAN      NOT NULL DEFAULT false,
    created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_images_product_id ON product_images (product_id);
CREATE INDEX idx_images_variant_id ON product_images (variant_id);
