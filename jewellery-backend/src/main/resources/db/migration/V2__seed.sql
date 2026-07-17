-- ============================================================================
-- Sri Sai Fashion Jewellery - Phase 1 sample/seed data
-- Realistic placeholder catalog data for local development and demoing the
-- homepage/catalog browse APIs. All image URLs are dummyimage.com placeholders.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- roles
-- ----------------------------------------------------------------------------
INSERT INTO roles (name, description, created_by, updated_by) VALUES
    ('CUSTOMER', 'Registered storefront customer', 'system', 'system'),
    ('ADMIN', 'Back-office administrator (reserved for a future phase)', 'system', 'system');

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (name, slug, description, image_url, display_order, is_active, created_by, updated_by) VALUES
    ('Necklaces', 'necklaces', 'Statement necklaces, chokers and long chains crafted in artificial gold and silver finishes.', 'https://dummyimage.com/600x400.png&text=Necklaces', 1, true, 'system', 'system'),
    ('Earrings', 'earrings', 'Studs, jhumkas and chandbalis for everyday elegance and festive glam.', 'https://dummyimage.com/600x400.png&text=Earrings', 2, true, 'system', 'system'),
    ('Bangles', 'bangles', 'Kadas and charm bangles in oxidized, gold-plated and crystal finishes.', 'https://dummyimage.com/600x400.png&text=Bangles', 3, true, 'system', 'system'),
    ('Rings', 'rings', 'Cocktail rings and everyday bands in imitation gold, rose gold and CZ.', 'https://dummyimage.com/600x400.png&text=Rings', 4, true, 'system', 'system'),
    ('Bridal Sets', 'bridal-sets', 'Complete bridal necklace and maang tikka sets for the big day.', 'https://dummyimage.com/600x400.png&text=Bridal+Sets', 5, true, 'system', 'system');

-- ----------------------------------------------------------------------------
-- sub_categories
-- ----------------------------------------------------------------------------
INSERT INTO sub_categories (category_id, name, slug, description, image_url, display_order, is_active, created_by, updated_by) VALUES
    ((SELECT id FROM categories WHERE slug = 'necklaces'), 'Chokers', 'chokers-necklaces', 'Close-fit statement chokers.', 'https://dummyimage.com/600x400.png&text=Chokers', 1, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'necklaces'), 'Long Chains', 'long-chains', 'Layered and long-length necklaces.', 'https://dummyimage.com/600x400.png&text=Long+Chains', 2, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'earrings'), 'Studs', 'studs', 'Everyday stud earrings.', 'https://dummyimage.com/600x400.png&text=Studs', 1, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'earrings'), 'Jhumkas', 'jhumkas', 'Traditional bell-shaped jhumkas.', 'https://dummyimage.com/600x400.png&text=Jhumkas', 2, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'bangles'), 'Kada', 'kada', 'Broad statement kadas.', 'https://dummyimage.com/600x400.png&text=Kada', 1, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'bangles'), 'Charm Bangles', 'charm-bangles', 'Delicate charm bangles.', 'https://dummyimage.com/600x400.png&text=Charm+Bangles', 2, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'rings'), 'Cocktail Rings', 'cocktail-rings', 'Bold statement cocktail rings.', 'https://dummyimage.com/600x400.png&text=Cocktail+Rings', 1, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'rings'), 'Bands', 'bands', 'Slim everyday bands.', 'https://dummyimage.com/600x400.png&text=Bands', 2, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'bridal-sets'), 'Necklace Sets', 'necklace-sets', 'Complete bridal necklace + earring sets.', 'https://dummyimage.com/600x400.png&text=Necklace+Sets', 1, true, 'system', 'system'),
    ((SELECT id FROM categories WHERE slug = 'bridal-sets'), 'Maang Tikka Sets', 'maang-tikka-sets', 'Maang tikka and headpiece sets.', 'https://dummyimage.com/600x400.png&text=Maang+Tikka+Sets', 2, true, 'system', 'system');

-- ----------------------------------------------------------------------------
-- collections
-- ----------------------------------------------------------------------------
INSERT INTO collections (name, slug, description, image_url, is_featured, display_order, is_active, created_by, updated_by) VALUES
    ('Bridal Collection', 'bridal-collection', 'Everything a bride needs, from kundan sets to maang tikkas.', 'https://dummyimage.com/800x500.png&text=Bridal+Collection', true, 1, true, 'system', 'system'),
    ('Festival Collection', 'festival-collection', 'Vibrant pieces for Diwali, Navratri and every festive occasion.', 'https://dummyimage.com/800x500.png&text=Festival+Collection', true, 2, true, 'system', 'system'),
    ('Temple Jewellery', 'temple-jewellery', 'Classic temple-inspired motifs in antique gold finish.', 'https://dummyimage.com/800x500.png&text=Temple+Jewellery', false, 3, true, 'system', 'system'),
    ('Daily Wear', 'daily-wear', 'Lightweight, comfortable pieces for everyday styling.', 'https://dummyimage.com/800x500.png&text=Daily+Wear', false, 4, true, 'system', 'system'),
    ('Editor''s Choice', 'editors-choice', 'Our stylists'' hand-picked favourites of the season.', 'https://dummyimage.com/800x500.png&text=Editors+Choice', true, 5, true, 'system', 'system');

-- ----------------------------------------------------------------------------
-- occasions
-- ----------------------------------------------------------------------------
INSERT INTO occasions (name, slug, description, image_url, display_order, is_active, created_by, updated_by) VALUES
    ('Wedding', 'wedding', 'Bridal-ready statement pieces.', 'https://dummyimage.com/600x400.png&text=Wedding', 1, true, 'system', 'system'),
    ('Festival', 'festival', 'Festive-season favourites.', 'https://dummyimage.com/600x400.png&text=Festival', 2, true, 'system', 'system'),
    ('Daily Wear', 'daily-wear-occasion', 'Comfortable pieces for everyday.', 'https://dummyimage.com/600x400.png&text=Daily+Wear', 3, true, 'system', 'system'),
    ('Anniversary', 'anniversary', 'Special-occasion pieces to celebrate milestones.', 'https://dummyimage.com/600x400.png&text=Anniversary', 4, true, 'system', 'system'),
    ('Party', 'party', 'Statement pieces that stand out on a night out.', 'https://dummyimage.com/600x400.png&text=Party', 5, true, 'system', 'system');

-- ----------------------------------------------------------------------------
-- products ("ornaments")
-- ----------------------------------------------------------------------------
INSERT INTO products (
    ornament_id, name, slug, short_description, description, base_price, discounted_price,
    metal_type, weight_grams, category_id, sub_category_id, is_active, is_featured, stock_status,
    meta_title, meta_description, created_by, updated_by
) VALUES
    ('ORN-000001', 'Kundan Choker Necklace', 'kundan-choker-necklace', 'Handcrafted kundan choker with pearl drops.', 'A statement kundan choker necklace finished with delicate pearl drops, perfect for weddings and receptions. Plated for long-lasting shine.', 8500.00, 7200.00, 'GOLD_PLATED', 45.50, (SELECT id FROM categories WHERE slug = 'necklaces'), (SELECT id FROM sub_categories WHERE slug = 'chokers-necklaces'), true, true, 'IN_STOCK', 'Kundan Choker Necklace | Sri Sai Fashion Jewellery', 'Shop the Kundan Choker Necklace - handcrafted artificial jewellery for weddings.', 'system', 'system'),
    ('ORN-000002', 'Polki Long Haar Necklace', 'polki-long-haar-necklace', 'Layered polki-style long necklace.', 'A long, layered polki-style haar with cubic zirconia accents, designed to be the centrepiece of any bridal ensemble.', 12500.00, NULL, 'CZ', 62.00, (SELECT id FROM categories WHERE slug = 'necklaces'), (SELECT id FROM sub_categories WHERE slug = 'long-chains'), true, true, 'IN_STOCK', 'Polki Long Haar Necklace | Sri Sai Fashion Jewellery', 'Layered polki-style long necklace with CZ stone work.', 'system', 'system'),
    ('ORN-000003', 'Temple Coin Necklace', 'temple-coin-necklace', 'Antique temple coin motif necklace.', 'Traditional temple jewellery necklace featuring coin and goddess motifs in an antique gold finish.', 6800.00, NULL, 'GOLD_PLATED', 38.00, (SELECT id FROM categories WHERE slug = 'necklaces'), (SELECT id FROM sub_categories WHERE slug = 'long-chains'), true, false, 'COMING_SOON', 'Temple Coin Necklace | Sri Sai Fashion Jewellery', 'Antique-finish temple coin necklace.', 'system', 'system'),
    ('ORN-000004', 'Meenakari Choker', 'meenakari-choker', 'Colourful meenakari enamel choker.', 'Vibrant meenakari enamel work choker with a contemporary silhouette, ideal for festive dressing.', 5400.00, 4600.00, 'GOLD_PLATED', 32.00, (SELECT id FROM categories WHERE slug = 'necklaces'), (SELECT id FROM sub_categories WHERE slug = 'chokers-necklaces'), true, false, 'IN_STOCK', 'Meenakari Choker | Sri Sai Fashion Jewellery', 'Colourful meenakari enamel choker necklace.', 'system', 'system'),
    ('ORN-000005', 'Pearl Drop Studs', 'pearl-drop-studs', 'Minimal pearl drop stud earrings.', 'Everyday stud earrings featuring a single freshwater-style pearl drop on a sterling-silver-finish base.', 1450.00, NULL, 'SILVER', 6.20, (SELECT id FROM categories WHERE slug = 'earrings'), (SELECT id FROM sub_categories WHERE slug = 'studs'), true, false, 'IN_STOCK', 'Pearl Drop Studs | Sri Sai Fashion Jewellery', 'Minimal pearl drop stud earrings for everyday wear.', 'system', 'system'),
    ('ORN-000006', 'Antique Jhumka Earrings', 'antique-jhumka-earrings', 'Oxidized silver jhumka earrings.', 'Classic bell-shaped jhumka earrings in an oxidized silver finish with intricate carved detailing.', 2200.00, NULL, 'OXIDIZED', 12.50, (SELECT id FROM categories WHERE slug = 'earrings'), (SELECT id FROM sub_categories WHERE slug = 'jhumkas'), true, true, 'IN_STOCK', 'Antique Jhumka Earrings | Sri Sai Fashion Jewellery', 'Oxidized silver antique jhumka earrings.', 'system', 'system'),
    ('ORN-000007', 'CZ Solitaire Studs', 'cz-solitaire-studs', 'Sparkling CZ solitaire studs.', 'Simple, elegant solitaire studs set with a single brilliant-cut cubic zirconia stone.', 1800.00, NULL, 'CZ', 4.80, (SELECT id FROM categories WHERE slug = 'earrings'), (SELECT id FROM sub_categories WHERE slug = 'studs'), true, false, 'IN_STOCK', 'CZ Solitaire Studs | Sri Sai Fashion Jewellery', 'Sparkling cubic zirconia solitaire stud earrings.', 'system', 'system'),
    ('ORN-000008', 'Chandbali Jhumkas', 'chandbali-jhumkas', 'Crescent-style chandbali earrings.', 'Elegant crescent-moon chandbali earrings finished in imitation gold with a jhumka drop.', 3200.00, 2700.00, 'GOLD_PLATED', 15.00, (SELECT id FROM categories WHERE slug = 'earrings'), (SELECT id FROM sub_categories WHERE slug = 'jhumkas'), true, false, 'IN_STOCK', 'Chandbali Jhumkas | Sri Sai Fashion Jewellery', 'Crescent-style chandbali jhumka earrings.', 'system', 'system'),
    ('ORN-000009', 'Oxidized Silver Kada', 'oxidized-silver-kada', 'Bold oxidized kada bangle.', 'A single broad kada bangle in a deep oxidized silver finish with traditional engraving.', 2600.00, NULL, 'OXIDIZED', 28.00, (SELECT id FROM categories WHERE slug = 'bangles'), (SELECT id FROM sub_categories WHERE slug = 'kada'), true, false, 'IN_STOCK', 'Oxidized Silver Kada | Sri Sai Fashion Jewellery', 'Bold oxidized silver-finish kada bangle.', 'system', 'system'),
    ('ORN-000010', 'Gold Plated Charm Bangle Set', 'gold-plated-charm-bangle-set', 'Set of 4 charm bangles.', 'A stackable set of four delicate charm bangles in a warm imitation-gold finish.', 4200.00, NULL, 'GOLD_PLATED', 34.00, (SELECT id FROM categories WHERE slug = 'bangles'), (SELECT id FROM sub_categories WHERE slug = 'charm-bangles'), true, true, 'IN_STOCK', 'Gold Plated Charm Bangle Set | Sri Sai Fashion Jewellery', 'Stackable set of four gold-plated charm bangles.', 'system', 'system'),
    ('ORN-000011', 'Rajwadi Kada Pair', 'rajwadi-kada-pair', 'Royal Rajwadi-style kada pair.', 'A pair of broad Rajwadi-style kadas with intricate relief work, finished in antique gold.', 5600.00, NULL, 'GOLD_PLATED', 58.00, (SELECT id FROM categories WHERE slug = 'bangles'), (SELECT id FROM sub_categories WHERE slug = 'kada'), true, false, 'IN_STOCK', 'Rajwadi Kada Pair | Sri Sai Fashion Jewellery', 'Royal Rajwadi-style kada bangle pair.', 'system', 'system'),
    ('ORN-000012', 'Crystal Charm Bangle', 'crystal-charm-bangle', 'Delicate crystal-studded bangle.', 'A slim bangle finished with sparkling crystal accents, easy to stack or wear alone.', 1900.00, NULL, 'CZ', 18.00, (SELECT id FROM categories WHERE slug = 'bangles'), (SELECT id FROM sub_categories WHERE slug = 'charm-bangles'), true, false, 'IN_STOCK', 'Crystal Charm Bangle | Sri Sai Fashion Jewellery', 'Delicate crystal-studded charm bangle.', 'system', 'system'),
    ('ORN-000013', 'Rose Gold Cocktail Ring', 'rose-gold-cocktail-ring', 'Statement rose gold ring.', 'A bold cocktail ring in a rose-gold-plated finish, set with a large centre stone.', 2400.00, NULL, 'ROSE_GOLD_PLATED', 8.50, (SELECT id FROM categories WHERE slug = 'rings'), (SELECT id FROM sub_categories WHERE slug = 'cocktail-rings'), true, false, 'IN_STOCK', 'Rose Gold Cocktail Ring | Sri Sai Fashion Jewellery', 'Statement rose-gold-plated cocktail ring.', 'system', 'system'),
    ('ORN-000014', 'CZ Solitaire Band', 'cz-solitaire-band', 'Slim CZ solitaire band.', 'A slim everyday band set with a single cubic zirconia solitaire stone.', 1600.00, NULL, 'CZ', 3.60, (SELECT id FROM categories WHERE slug = 'rings'), (SELECT id FROM sub_categories WHERE slug = 'bands'), true, false, 'IN_STOCK', 'CZ Solitaire Band | Sri Sai Fashion Jewellery', 'Slim cubic zirconia solitaire band ring.', 'system', 'system'),
    ('ORN-000015', 'Adjustable Floral Ring', 'adjustable-floral-ring', 'Brass floral adjustable ring.', 'A free-size adjustable ring in a floral motif, finished in a warm brass tone.', 1200.00, NULL, 'BRASS', 5.20, (SELECT id FROM categories WHERE slug = 'rings'), (SELECT id FROM sub_categories WHERE slug = 'cocktail-rings'), true, false, 'IN_STOCK', 'Adjustable Floral Ring | Sri Sai Fashion Jewellery', 'Adjustable brass floral motif ring.', 'system', 'system'),
    ('ORN-000016', 'Statement Peacock Ring', 'statement-peacock-ring', 'Peacock-motif cocktail ring.', 'An eye-catching peacock-motif cocktail ring finished in imitation gold with coloured stone inlay.', 2100.00, 1800.00, 'GOLD_PLATED', 9.80, (SELECT id FROM categories WHERE slug = 'rings'), (SELECT id FROM sub_categories WHERE slug = 'cocktail-rings'), true, true, 'IN_STOCK', 'Statement Peacock Ring | Sri Sai Fashion Jewellery', 'Peacock-motif gold-plated cocktail ring.', 'system', 'system'),
    ('ORN-000017', 'Bridal Kundan Necklace Set', 'bridal-kundan-necklace-set', 'Complete bridal kundan set with earrings.', 'A complete bridal set including a kundan necklace and matching earrings, finished in 22k-look imitation gold plating.', 15000.00, 13200.00, 'GOLD_PLATED', 95.00, (SELECT id FROM categories WHERE slug = 'bridal-sets'), (SELECT id FROM sub_categories WHERE slug = 'necklace-sets'), true, true, 'IN_STOCK', 'Bridal Kundan Necklace Set | Sri Sai Fashion Jewellery', 'Complete bridal kundan necklace and earring set.', 'system', 'system'),
    ('ORN-000018', 'Polki Maang Tikka Set', 'polki-maang-tikka-set', 'Polki-style maang tikka with earrings.', 'A matching maang tikka and earring set in polki-inspired cubic zirconia work, designed for bridal looks.', 9800.00, NULL, 'CZ', 48.00, (SELECT id FROM categories WHERE slug = 'bridal-sets'), (SELECT id FROM sub_categories WHERE slug = 'maang-tikka-sets'), true, true, 'IN_STOCK', 'Polki Maang Tikka Set | Sri Sai Fashion Jewellery', 'Polki-style maang tikka and earring set.', 'system', 'system'),
    ('ORN-000019', 'Bridal Temple Necklace Set', 'bridal-temple-necklace-set', 'Temple-motif bridal necklace set.', 'A temple-jewellery-inspired bridal set combining a statement necklace with matching earrings.', 14200.00, NULL, 'GOLD_PLATED', 88.00, (SELECT id FROM categories WHERE slug = 'bridal-sets'), (SELECT id FROM sub_categories WHERE slug = 'necklace-sets'), true, false, 'IN_STOCK', 'Bridal Temple Necklace Set | Sri Sai Fashion Jewellery', 'Temple-motif bridal necklace and earring set.', 'system', 'system'),
    ('ORN-000020', 'Ruby Kundan Maang Tikka', 'ruby-kundan-maang-tikka', 'Ruby-accented kundan maang tikka.', 'A regal maang tikka finished in a platinum-look plating with ruby-red stone accents.', 7600.00, 6400.00, 'PLATINUM_PLATED', 22.00, (SELECT id FROM categories WHERE slug = 'bridal-sets'), (SELECT id FROM sub_categories WHERE slug = 'maang-tikka-sets'), true, false, 'LOW_STOCK', 'Ruby Kundan Maang Tikka | Sri Sai Fashion Jewellery', 'Ruby-accented kundan maang tikka headpiece.', 'system', 'system');

-- ----------------------------------------------------------------------------
-- product_images (one primary image per product)
-- ----------------------------------------------------------------------------
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary, created_by, updated_by)
SELECT id,
       'https://dummyimage.com/600x600.png&text=' || replace(name, ' ', '+'),
       name,
       0,
       true,
       'system', 'system'
FROM products;

-- ----------------------------------------------------------------------------
-- product_collections
-- ----------------------------------------------------------------------------
INSERT INTO product_collections (product_id, collection_id, created_by, updated_by) VALUES
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000001'), (SELECT id FROM collections WHERE slug = 'bridal-collection'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000017'), (SELECT id FROM collections WHERE slug = 'bridal-collection'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000018'), (SELECT id FROM collections WHERE slug = 'bridal-collection'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000019'), (SELECT id FROM collections WHERE slug = 'bridal-collection'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000020'), (SELECT id FROM collections WHERE slug = 'bridal-collection'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000003'), (SELECT id FROM collections WHERE slug = 'festival-collection'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000006'), (SELECT id FROM collections WHERE slug = 'festival-collection'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000009'), (SELECT id FROM collections WHERE slug = 'festival-collection'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000011'), (SELECT id FROM collections WHERE slug = 'festival-collection'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000003'), (SELECT id FROM collections WHERE slug = 'temple-jewellery'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000019'), (SELECT id FROM collections WHERE slug = 'temple-jewellery'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000005'), (SELECT id FROM collections WHERE slug = 'daily-wear'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000007'), (SELECT id FROM collections WHERE slug = 'daily-wear'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000014'), (SELECT id FROM collections WHERE slug = 'daily-wear'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000015'), (SELECT id FROM collections WHERE slug = 'daily-wear'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000002'), (SELECT id FROM collections WHERE slug = 'editors-choice'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000010'), (SELECT id FROM collections WHERE slug = 'editors-choice'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000016'), (SELECT id FROM collections WHERE slug = 'editors-choice'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000017'), (SELECT id FROM collections WHERE slug = 'editors-choice'), 'system', 'system');

-- ----------------------------------------------------------------------------
-- product_occasions
-- ----------------------------------------------------------------------------
INSERT INTO product_occasions (product_id, occasion_id, created_by, updated_by) VALUES
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000001'), (SELECT id FROM occasions WHERE slug = 'wedding'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000017'), (SELECT id FROM occasions WHERE slug = 'wedding'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000018'), (SELECT id FROM occasions WHERE slug = 'wedding'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000019'), (SELECT id FROM occasions WHERE slug = 'wedding'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000020'), (SELECT id FROM occasions WHERE slug = 'wedding'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000003'), (SELECT id FROM occasions WHERE slug = 'festival'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000006'), (SELECT id FROM occasions WHERE slug = 'festival'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000009'), (SELECT id FROM occasions WHERE slug = 'festival'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000011'), (SELECT id FROM occasions WHERE slug = 'festival'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000018'), (SELECT id FROM occasions WHERE slug = 'festival'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000005'), (SELECT id FROM occasions WHERE slug = 'daily-wear-occasion'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000007'), (SELECT id FROM occasions WHERE slug = 'daily-wear-occasion'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000014'), (SELECT id FROM occasions WHERE slug = 'daily-wear-occasion'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000015'), (SELECT id FROM occasions WHERE slug = 'daily-wear-occasion'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000002'), (SELECT id FROM occasions WHERE slug = 'anniversary'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000010'), (SELECT id FROM occasions WHERE slug = 'anniversary'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000013'), (SELECT id FROM occasions WHERE slug = 'anniversary'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000016'), (SELECT id FROM occasions WHERE slug = 'anniversary'), 'system', 'system'),

    ((SELECT id FROM products WHERE ornament_id = 'ORN-000006'), (SELECT id FROM occasions WHERE slug = 'party'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000008'), (SELECT id FROM occasions WHERE slug = 'party'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000012'), (SELECT id FROM occasions WHERE slug = 'party'), 'system', 'system'),
    ((SELECT id FROM products WHERE ornament_id = 'ORN-000013'), (SELECT id FROM occasions WHERE slug = 'party'), 'system', 'system');

-- ----------------------------------------------------------------------------
-- banners
-- ----------------------------------------------------------------------------
INSERT INTO banners (title, subtitle, image_url, link_url, display_order, is_active, created_by, updated_by) VALUES
    ('The Bridal Edit', 'Kundan, polki and temple sets for your big day', 'https://dummyimage.com/1600x600.png&text=The+Bridal+Edit', '/collections/bridal-collection', 1, true, 'system', 'system'),
    ('Festival Ready', 'Shop the Festival Collection', 'https://dummyimage.com/1600x600.png&text=Festival+Ready', '/collections/festival-collection', 2, true, 'system', 'system'),
    ('New Arrivals', 'Fresh drops every week', 'https://dummyimage.com/1600x600.png&text=New+Arrivals', '/products?featured=true', 3, true, 'system', 'system');

-- ----------------------------------------------------------------------------
-- home_sections + home_section_items
-- ----------------------------------------------------------------------------

-- Section 1: Shop by Category (CATEGORY_GRID)
INSERT INTO home_sections (title, subtitle, section_type, display_order, is_active, created_by, updated_by)
VALUES ('Shop by Category', 'Find your perfect piece', 'CATEGORY_GRID', 1, true, 'system', 'system');

INSERT INTO home_section_items (home_section_id, reference_type, reference_id, display_order, created_by, updated_by)
SELECT (SELECT id FROM home_sections WHERE title = 'Shop by Category'), 'CATEGORY', id, display_order, 'system', 'system'
FROM categories;

-- Section 2: Featured Collections (COLLECTION_SHOWCASE)
INSERT INTO home_sections (title, subtitle, section_type, display_order, is_active, created_by, updated_by)
VALUES ('Featured Collections', 'Curated edits for every celebration', 'COLLECTION_SHOWCASE', 2, true, 'system', 'system');

INSERT INTO home_section_items (home_section_id, reference_type, reference_id, display_order, created_by, updated_by)
SELECT (SELECT id FROM home_sections WHERE title = 'Featured Collections'), 'COLLECTION', id, display_order, 'system', 'system'
FROM collections
WHERE is_featured = true;

-- Section 3: New Arrivals (PRODUCT_CAROUSEL) - featured products
INSERT INTO home_sections (title, subtitle, section_type, display_order, is_active, created_by, updated_by)
VALUES ('New Arrivals', 'Fresh picks handpicked for you', 'PRODUCT_CAROUSEL', 3, true, 'system', 'system');

INSERT INTO home_section_items (home_section_id, reference_type, reference_id, display_order, created_by, updated_by)
SELECT (SELECT id FROM home_sections WHERE title = 'New Arrivals'), 'PRODUCT', id, row_number() OVER (ORDER BY ornament_id), 'system', 'system'
FROM products
WHERE is_featured = true;

-- Section 4: Shop by Occasion (OCCASION_LIST)
INSERT INTO home_sections (title, subtitle, section_type, display_order, is_active, created_by, updated_by)
VALUES ('Shop by Occasion', 'Jewellery for every moment', 'OCCASION_LIST', 4, true, 'system', 'system');

INSERT INTO home_section_items (home_section_id, reference_type, reference_id, display_order, created_by, updated_by)
SELECT (SELECT id FROM home_sections WHERE title = 'Shop by Occasion'), 'OCCASION', id, display_order, 'system', 'system'
FROM occasions;
