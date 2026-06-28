-- Temel renkler
INSERT INTO colors (name, hex_code, slug) VALUES
    ('Siyah',   '#000000', 'siyah'),
    ('Beyaz',   '#FFFFFF', 'beyaz'),
    ('Ekru',    '#F5F5DC', 'ekru'),
    ('Bej',     '#F5DEB3', 'bej'),
    ('Gri',     '#808080', 'gri'),
    ('Lacivert','#002FA7', 'lacivert'),
    ('Kahverengi','#8B4513','kahverengi'),
    ('Bordo',   '#800020', 'bordo'),
    ('Haki',    '#8B864E', 'haki'),
    ('Pembe',   '#FFC0CB', 'pembe'),
    ('Mavi',    '#0000FF', 'mavi'),
    ('Yeşil',   '#008000', 'yesil'),
    ('Sarı',    '#FFFF00', 'sari'),
    ('Turuncu', '#FFA500', 'turuncu'),
    ('Mor',     '#800080', 'mor'),
    ('Kırmızı', '#FF0000', 'kirmizi');

-- Alfa bedenler
INSERT INTO sizes (name, size_group, sort_order) VALUES
    ('XS',  'ALPHA', 10),
    ('S',   'ALPHA', 20),
    ('M',   'ALPHA', 30),
    ('L',   'ALPHA', 40),
    ('XL',  'ALPHA', 50),
    ('XXL', 'ALPHA', 60),
    ('3XL', 'ALPHA', 70);

-- Numerik bedenler (Türkiye kadın giyim)
INSERT INTO sizes (name, size_group, sort_order) VALUES
    ('34', 'NUMERIC', 110),
    ('36', 'NUMERIC', 120),
    ('38', 'NUMERIC', 130),
    ('40', 'NUMERIC', 140),
    ('42', 'NUMERIC', 150),
    ('44', 'NUMERIC', 160),
    ('46', 'NUMERIC', 170),
    ('48', 'NUMERIC', 180),
    ('50', 'NUMERIC', 190),
    ('52', 'NUMERIC', 200);

-- Temel 2 seviyeli kategoriler
INSERT INTO categories (name, slug, display_order) VALUES
    ('Kıyafet',     'kiyafet',      1),
    ('Üst Giyim',   'ust-giyim',    2),
    ('Alt Giyim',   'alt-giyim',    3),
    ('Dış Giyim',   'dis-giyim',    4),
    ('Aksesuarlar', 'aksesuarlar',  5);

-- Alt kategoriler (parent = Kıyafet)
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Elbise',   'elbise',   1   FROM categories WHERE slug = 'kiyafet';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Takım',    'takim',    2   FROM categories WHERE slug = 'kiyafet';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Tulum',    'tulum',    3   FROM categories WHERE slug = 'kiyafet';

-- Alt kategoriler (Üst Giyim)
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Bluz',     'bluz',     1   FROM categories WHERE slug = 'ust-giyim';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Gömlek',   'gomlek',   2   FROM categories WHERE slug = 'ust-giyim';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Tunik',    'tunik',    3   FROM categories WHERE slug = 'ust-giyim';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Kazak',    'kazak',    4   FROM categories WHERE slug = 'ust-giyim';

-- Alt kategoriler (Alt Giyim)
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Pantolon', 'pantolon', 1   FROM categories WHERE slug = 'alt-giyim';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Etek',     'etek',     2   FROM categories WHERE slug = 'alt-giyim';

-- Alt kategoriler (Dış Giyim)
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Mont',     'mont',     1   FROM categories WHERE slug = 'dis-giyim';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Kaban',    'kaban',    2   FROM categories WHERE slug = 'dis-giyim';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Trençkot', 'trenckot', 3  FROM categories WHERE slug = 'dis-giyim';

-- Alt kategoriler (Aksesuarlar)
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Eşarp',    'esarp',    1   FROM categories WHERE slug = 'aksesuarlar';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Çanta',    'canta',    2   FROM categories WHERE slug = 'aksesuarlar';
INSERT INTO categories (parent_id, name, slug, display_order)
SELECT id, 'Kemer',    'kemer',    3   FROM categories WHERE slug = 'aksesuarlar';
