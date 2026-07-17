-- V11__unique_product_images.sql
-- Give every product its own distinct photo instead of sharing one generic
-- image per category, and add a second gallery image where available.

UPDATE product_images pi SET image_url = '/images/products/necklaces/kundan-choker-necklace.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000001' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/necklaces/polki-long-haar-necklace.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000002' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/necklaces/temple-coin-necklace.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000003' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/necklaces/meenakari-choker.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000004' AND pi.is_primary = true;

UPDATE product_images pi SET image_url = '/images/products/earrings/pearl-drop-studs.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000005' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/earrings/antique-jhumka-earrings.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000006' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/earrings/cz-solitaire-studs.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000007' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/earrings/chandbali-jhumkas.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000008' AND pi.is_primary = true;

UPDATE product_images pi SET image_url = '/images/products/bangles/oxidized-silver-kada.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000009' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/bangles/gold-plated-charm-bangle-set.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000010' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/bangles/rajwadi-kada-pair.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000011' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/bangles/crystal-charm-bangle.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000012' AND pi.is_primary = true;

UPDATE product_images pi SET image_url = '/images/products/rings/rose-gold-cocktail-ring.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000013' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/rings/cz-solitaire-band.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000014' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/rings/adjustable-floral-ring.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000015' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/rings/statement-peacock-ring.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000016' AND pi.is_primary = true;

UPDATE product_images pi SET image_url = '/images/products/bridal-sets/bridal-kundan-necklace-set.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000017' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/bridal-sets/polki-maang-tikka-set.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000018' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/bridal-sets/bridal-temple-necklace-set.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000019' AND pi.is_primary = true;
UPDATE product_images pi SET image_url = '/images/products/bridal-sets/ruby-kundan-maang-tikka.jpg'
    FROM products p WHERE pi.product_id = p.id AND p.ornament_id = 'ORN-000020' AND pi.is_primary = true;

-- Second gallery image for products where a distinct extra photo is available
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary, created_by, updated_by)
SELECT p.id, v.image_url, p.name, 1, false, 'system', 'system'
FROM products p
JOIN (VALUES
    ('ORN-000001', '/images/products/necklaces/gallery-1.jpg'),
    ('ORN-000002', '/images/products/necklaces/gallery-2.jpg'),
    ('ORN-000003', '/images/products/necklaces/gallery-3.jpg'),
    ('ORN-000005', '/images/products/earrings/gallery-1.jpg'),
    ('ORN-000006', '/images/products/earrings/gallery-2.jpg'),
    ('ORN-000009', '/images/products/bangles/gallery-1.jpg'),
    ('ORN-000010', '/images/products/bangles/gallery-2.jpg'),
    ('ORN-000013', '/images/products/rings/gallery-1.jpg'),
    ('ORN-000017', '/images/products/bridal-sets/gallery-1.jpg')
) AS v(ornament_id, image_url) ON v.ornament_id = p.ornament_id;
