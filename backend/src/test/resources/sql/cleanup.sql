TRUNCATE TABLE
    product_images, product_tags, product_attributes, product_variants, products,
    categories, cart_items, carts, refresh_tokens, users
    RESTART IDENTITY CASCADE;
