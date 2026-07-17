-- V10__resolve_image_urls.sql
-- Update categories to use dynamic, relative image paths
UPDATE categories SET image_url = '/images/categories/necklaces.jpg' WHERE slug = 'necklaces';
UPDATE categories SET image_url = '/images/categories/earrings.jpg' WHERE slug = 'earrings';
UPDATE categories SET image_url = '/images/categories/bangles.jpg' WHERE slug = 'bangles';
UPDATE categories SET image_url = '/images/categories/rings.jpg' WHERE slug = 'rings';
UPDATE categories SET image_url = '/images/categories/bridal-sets.jpg' WHERE slug = 'bridal-sets';

-- Update sub_categories to use dynamic, relative image paths
UPDATE sub_categories SET image_url = '/images/subcategories/chokers-necklaces.jpg' WHERE slug = 'chokers-necklaces';
UPDATE sub_categories SET image_url = '/images/subcategories/long-chains.jpg' WHERE slug = 'long-chains';
UPDATE sub_categories SET image_url = '/images/subcategories/studs.jpg' WHERE slug = 'studs';
UPDATE sub_categories SET image_url = '/images/subcategories/jhumkas.jpg' WHERE slug = 'jhumkas';
UPDATE sub_categories SET image_url = '/images/subcategories/kada.jpg' WHERE slug = 'kada';
UPDATE sub_categories SET image_url = '/images/subcategories/charm-bangles.jpg' WHERE slug = 'charm-bangles';
UPDATE sub_categories SET image_url = '/images/subcategories/cocktail-rings.jpg' WHERE slug = 'cocktail-rings';
UPDATE sub_categories SET image_url = '/images/subcategories/bands.jpg' WHERE slug = 'bands';
UPDATE sub_categories SET image_url = '/images/subcategories/necklace-sets.jpg' WHERE slug = 'necklace-sets';
UPDATE sub_categories SET image_url = '/images/subcategories/maang-tikka-sets.jpg' WHERE slug = 'maang-tikka-sets';

-- Update collections to use dynamic, relative image paths
UPDATE collections SET image_url = '/images/collections/bridal-collection.jpg' WHERE slug = 'bridal-collection';
UPDATE collections SET image_url = '/images/collections/festival-collection.jpg' WHERE slug = 'festival-collection';
UPDATE collections SET image_url = '/images/collections/temple-jewellery.jpg' WHERE slug = 'temple-jewellery';
UPDATE collections SET image_url = '/images/collections/daily-wear.jpg' WHERE slug = 'daily-wear';
UPDATE collections SET image_url = '/images/collections/editors-choice.jpg' WHERE slug = 'editors-choice';

-- Update occasions to use dynamic, relative image paths
UPDATE occasions SET image_url = '/images/occasions/wedding.jpg' WHERE slug = 'wedding';
UPDATE occasions SET image_url = '/images/occasions/festival.jpg' WHERE slug = 'festival';
UPDATE occasions SET image_url = '/images/occasions/daily-wear-occasion.jpg' WHERE slug = 'daily-wear-occasion';
UPDATE occasions SET image_url = '/images/occasions/anniversary.jpg' WHERE slug = 'anniversary';
UPDATE occasions SET image_url = '/images/occasions/party.jpg' WHERE slug = 'party';

-- Update banners to use dynamic, relative image paths
UPDATE banners SET image_url = '/images/banners/bridal-edit-banner.jpg' WHERE title = 'The Bridal Edit';
UPDATE banners SET image_url = '/images/banners/festival-ready-banner.jpg' WHERE title = 'Festival Ready';
UPDATE banners SET image_url = '/images/banners/new-arrivals-banner.jpg' WHERE title = 'New Arrivals';

-- Update blog_posts to use dynamic, relative cover image paths
UPDATE blog_posts SET cover_image_url = '/images/blog/kundan-work-cover.jpg' WHERE slug = 'the-art-of-kundan-work';
UPDATE blog_posts SET cover_image_url = '/images/blog/jewellery-care-cover.jpg' WHERE slug = 'how-to-care-for-artificial-jewellery';
UPDATE blog_posts SET cover_image_url = '/images/blog/bridal-trends-2026-cover.jpg' WHERE slug = 'bridal-jewellery-trends-2026';
UPDATE blog_posts SET cover_image_url = '/images/blog/saree-jewellery-guide-cover.jpg' WHERE slug = 'choosing-the-right-jewellery-for-your-saree';

-- Update seeded product_images to use high-quality dynamic category-based product images
UPDATE product_images pi
SET image_url = CASE 
    WHEN c.slug = 'necklaces' THEN '/images/products/product-necklaces.jpg'
    WHEN c.slug = 'earrings' THEN '/images/products/product-earrings.jpg'
    WHEN c.slug = 'bangles' THEN '/images/products/product-bangles.jpg'
    WHEN c.slug = 'rings' THEN '/images/products/product-rings.jpg'
    WHEN c.slug = 'bridal-sets' THEN '/images/products/product-bridal-sets.jpg'
    ELSE '/images/products/product-necklaces.jpg'
END
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE pi.product_id = p.id AND (pi.image_url LIKE 'https://dummyimage.com%' OR pi.image_url LIKE 'https://images.srisaifashionjewellery.local%');
