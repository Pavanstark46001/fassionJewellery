-- ============================================================================
-- Sri Sai Fashion Jewellery - Sprint 7 schema
-- CMS (blog, static/legal policy pages) + SEO (meta fields on taxonomy).
-- Banners/home_sections/home_section_items already exist from Phase 1 (V1) -
-- this sprint only adds admin write access to them in code, no schema change
-- there.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- blog_posts
-- ----------------------------------------------------------------------------
CREATE TABLE blog_posts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by       VARCHAR(255),
    created_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by       VARCHAR(255),
    updated_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
    version          BIGINT NOT NULL DEFAULT 0,
    is_deleted       BOOLEAN NOT NULL DEFAULT false,
    deleted_date     TIMESTAMPTZ,

    title            VARCHAR(255) NOT NULL,
    slug             VARCHAR(280) NOT NULL,
    excerpt          VARCHAR(500),
    content          TEXT NOT NULL,
    cover_image_url  VARCHAR(500),
    author_name      VARCHAR(255),
    is_published     BOOLEAN NOT NULL DEFAULT false,
    published_date   TIMESTAMPTZ,
    meta_title       VARCHAR(255),
    meta_description VARCHAR(500)
);

CREATE UNIQUE INDEX uq_blog_posts_slug ON blog_posts (slug) WHERE is_deleted = false;
CREATE INDEX idx_blog_posts_published ON blog_posts (is_published, published_date) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- static_pages
-- ----------------------------------------------------------------------------
CREATE TABLE static_pages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by       VARCHAR(255),
    created_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by       VARCHAR(255),
    updated_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
    version          BIGINT NOT NULL DEFAULT 0,
    is_deleted       BOOLEAN NOT NULL DEFAULT false,
    deleted_date     TIMESTAMPTZ,

    slug             VARCHAR(170) NOT NULL,
    title            VARCHAR(255) NOT NULL,
    content          TEXT NOT NULL,
    meta_title       VARCHAR(255),
    meta_description VARCHAR(500)
);

CREATE UNIQUE INDEX uq_static_pages_slug ON static_pages (slug) WHERE is_deleted = false;

-- ----------------------------------------------------------------------------
-- SEO meta fields on taxonomy tables (products already had these since V1)
-- ----------------------------------------------------------------------------
ALTER TABLE categories ADD COLUMN meta_title VARCHAR(255);
ALTER TABLE categories ADD COLUMN meta_description VARCHAR(500);

ALTER TABLE collections ADD COLUMN meta_title VARCHAR(255);
ALTER TABLE collections ADD COLUMN meta_description VARCHAR(500);

ALTER TABLE occasions ADD COLUMN meta_title VARCHAR(255);
ALTER TABLE occasions ADD COLUMN meta_description VARCHAR(500);

-- ----------------------------------------------------------------------------
-- blog_posts seed data (3-4 realistic sample posts, all published)
-- ----------------------------------------------------------------------------
INSERT INTO blog_posts (title, slug, excerpt, content, cover_image_url, author_name, is_published, published_date, meta_title, meta_description)
VALUES
(
    'The Art of Kundan Work',
    'the-art-of-kundan-work',
    'A look at Kundan, one of India''s oldest and most celebrated jewellery-making traditions, and how our artificial pieces recreate its royal look.',
    $post$Kundan is one of the oldest forms of Indian jewellery-making, tracing its roots back to the royal courts of Rajasthan and Gujarat centuries ago. The word "Kundan" refers to the technique of setting stones with a refined gold foil, traditionally used to encase gemstones and glass in an ornate, layered gold setting. The result is a look that is unmistakably regal - dense, colourful, and catching the light from every angle.

At Sri Sai Fashion Jewellery, our Kundan-inspired pieces recreate this centuries-old aesthetic using modern, skin-friendly artificial materials. Each piece is designed to mimic the layered stone-setting and intricate goldwork of traditional Kundan, without the weight or cost of real gold and precious stones. This makes the look accessible for everyday celebrations, not just heirloom occasions.

A genuine Kundan piece can take a skilled artisan days to complete, since every stone is set by hand into a wax-filled mould before the gold foil is pressed in to lock it in place. Our artificial versions borrow the same visual language - the layered stone clusters, the meenakari (enamel work) often found on the reverse side, and the characteristic uncut-stone shapes - while using lightweight alloys and cubic zirconia-style stones that are far easier to wear for long hours at a wedding or festival.

Kundan jewellery pairs beautifully with both traditional and contemporary bridal wear. A statement Kundan necklace with matching jhumkas can transform a simple silk saree or lehenga into a full bridal look, while smaller Kundan studs or a delicate maang tikka work well even with modern fusion outfits. If you're building a bridal trousseau or shopping for a festive occasion, Kundan is a timeless place to start.

Caring for your Kundan-style pieces is simple: store them flat in a soft-lined box away from direct sunlight and moisture, and wipe them gently with a dry, soft cloth after wear to keep the setting looking crisp for years to come.$post$,
    'https://images.srisaifashionjewellery.local/blog/kundan-work-cover.jpg',
    'Priya Sharma',
    true,
    now() - interval '28 days',
    'The Art of Kundan Work | Sri Sai Fashion Jewellery',
    'Discover the history and craftsmanship behind Kundan jewellery, and how our artificial Kundan pieces bring royal Indian elegance to modern occasions.'
),
(
    'How to Care for Artificial Jewellery',
    'how-to-care-for-artificial-jewellery',
    'Simple, practical tips to keep your artificial jewellery looking brand new - from everyday wear to long-term storage.',
    $post$Artificial jewellery has come a long way - today's pieces are designed to closely mimic the shine and detail of fine jewellery, but they do need a slightly different care routine to stay looking their best. With a few simple habits, your favourite pieces can stay lustrous for years.

The single most important rule is "last on, first off." Apply perfume, deodorant, hairspray, and other cosmetics before putting on your jewellery, and remove your jewellery before you shower, swim, or exercise. Chemicals and prolonged moisture are the biggest cause of tarnishing and colour fading in artificial jewellery, far more than everyday wear itself.

Storage matters just as much as wear. Keep each piece separately in a soft pouch or a lined jewellery box rather than tossing them all into one drawer - pieces rubbing against each other can scratch plating and loosen stones. If you live in a humid climate, consider adding a small silica gel packet to your jewellery box to control moisture.

For cleaning, a soft, dry, lint-free cloth is usually all you need after each wear to remove any oils or residue. Avoid soaking artificial jewellery in water or using harsh jewellery cleaners meant for real gold or silver, as these can strip the plating. If a piece looks dull, a very lightly damp cloth followed immediately by a dry one is generally safe for most pieces - but always test on a small area first.

Finally, try to avoid wearing artificial jewellery during activities that involve heavy sweating or direct sun exposure for extended periods, as both heat and salt can accelerate wear on the plating. With this simple routine, your pieces from Sri Sai Fashion Jewellery can stay celebration-ready for years of weddings, festivals, and everyday elegance.$post$,
    'https://images.srisaifashionjewellery.local/blog/jewellery-care-cover.jpg',
    'Anitha Reddy',
    true,
    now() - interval '19 days',
    'How to Care for Artificial Jewellery | Sri Sai Fashion Jewellery',
    'Practical, easy-to-follow tips for cleaning, wearing, and storing artificial jewellery so it stays lustrous and tarnish-free for years.'
),
(
    'Bridal Jewellery Trends 2026',
    'bridal-jewellery-trends-2026',
    'From layered necklaces to statement maang tikkas, here''s what brides are choosing for their big day this year.',
    $post$Bridal jewellery trends shift a little every year, blending traditional craftsmanship with what today's brides actually want to wear - comfortable, photogenic, and true to their personal style. Here's what we're seeing take centre stage for 2026 weddings.

Layered necklaces are having a major moment. Rather than a single heavy piece, brides are pairing a shorter choker with a longer statement necklace for a fuller, more dimensional look that photographs beautifully from every angle. This layered approach also gives brides flexibility - the pieces can be worn together for the main ceremony and separated for the reception or sangeet.

Temple jewellery, inspired by South Indian traditional design with its motifs of deities and intricate goldwork, continues to be a strong favourite for brides wanting a classic, ceremonial look, especially for muhurtham and reception functions. Pair a temple-style necklace with matching jhumkas and a vanki (armlet) for a complete traditional silhouette.

Statement maang tikkas and matha pattis are being chosen even by brides who otherwise prefer minimal jewellery - a single striking headpiece can anchor an entire bridal look without the need for excessive layering elsewhere. We're also seeing more brides choose colour-matched stones (emerald green, ruby red, or pastel pink) to coordinate with their outfit rather than sticking strictly to traditional gold and white.

Finally, comfort is trending as much as style. Brides are increasingly choosing lightweight artificial jewellery for long wedding days that involve multiple functions, saving heavier heirloom pieces for shorter ceremonies. This shift makes it easier to look stunning across a multi-day wedding without jewellery fatigue by the end of the night.

Whatever direction you choose, our bridal collection at Sri Sai Fashion Jewellery is designed to help you build a coordinated look across every function of your wedding.$post$,
    'https://images.srisaifashionjewellery.local/blog/bridal-trends-2026-cover.jpg',
    'Divya Menon',
    true,
    now() - interval '6 days',
    'Bridal Jewellery Trends 2026 | Sri Sai Fashion Jewellery',
    'Explore the top bridal jewellery trends for 2026, from layered necklaces to temple jewellery and statement maang tikkas.'
),
(
    'Choosing the Right Jewellery for Your Saree',
    'choosing-the-right-jewellery-for-your-saree',
    'A quick guide to matching necklaces, earrings, and bangles to different saree styles and necklines.',
    $post$Choosing jewellery to go with a saree can feel overwhelming with so many options, but a few simple guidelines make it much easier to put together a coordinated look for any occasion.

Start with the neckline. A saree blouse with a deep or boat neckline pairs beautifully with a short choker or collar-style necklace, since it sits neatly within the neckline rather than getting lost. A high-neck or closed blouse, on the other hand, works better with a longer necklace that falls below the collar, creating a nice vertical line.

Consider the saree's fabric and print next. Heavily embroidered or zari-work sarees like Kanjivaram or Banarasi silks can carry bold, chunky jewellery - think temple-style sets or layered gold-tone pieces - without looking overdone, since the richness of the fabric matches the richness of the jewellery. Lighter fabrics like georgette, chiffon, or cotton sarees generally look more elegant with simpler, more delicate pieces that don't overwhelm the drape.

Colour coordination is another easy win. For festive or bridal sarees in red, maroon, or gold tones, traditional gold-finish jewellery with kundan or polki-style stones tends to look most natural. For pastel or contemporary-coloured sarees, consider jewellery with matching or complementary coloured stones - a mint green saree with rose gold and white stone jewellery, for example, creates a soft, modern look.

Finally, don't forget bangles and the finishing details. A stack of bangles in a similar tone to your necklace ties the whole look together, and a simple maang tikka or bindi-matching earrings can elevate even a minimally-accessorised saree look. When in doubt, choose one statement piece - usually the necklace or the earrings - and keep the rest of the jewellery simple to let it shine.$post$,
    'https://images.srisaifashionjewellery.local/blog/saree-jewellery-guide-cover.jpg',
    'Priya Sharma',
    true,
    now() - interval '2 days',
    'Choosing the Right Jewellery for Your Saree | Sri Sai Fashion Jewellery',
    'A practical styling guide to matching necklaces, earrings, and bangles to different saree necklines, fabrics, and colours.'
);

-- ----------------------------------------------------------------------------
-- static_pages seed data (genuine, reasonable policy content - a placeholder
-- foundation, not legal advice)
-- ----------------------------------------------------------------------------
INSERT INTO static_pages (slug, title, content, meta_title, meta_description)
VALUES
(
    'privacy-policy',
    'Privacy Policy',
    $page$Sri Sai Fashion Jewellery ("we", "us", "our") respects your privacy and is committed to protecting the personal information you share with us when you use our website and services. This Privacy Policy explains what information we collect, how we use it, and the choices you have.

Information We Collect
We collect information you provide directly to us, such as your name, email address, phone number, shipping and billing addresses, and payment details when you create an account, place an order, or contact customer support. We also automatically collect certain technical information, such as your IP address, browser type, device information, and browsing activity on our site, through cookies and similar technologies.

How We Use Your Information
We use the information we collect to process and fulfil your orders, communicate with you about your orders and account, provide customer support, personalise your shopping experience, send you promotional offers (where you have opted in), and improve our website, products, and services. We do not sell your personal information to third parties.

Sharing Your Information
We may share your information with trusted third-party service providers who help us operate our business, such as payment processors, shipping and logistics partners, and IT service providers. These partners are only permitted to use your information to provide services to us and are required to protect it. We may also disclose information where required by law or to protect our rights.

Data Security
We use reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorised access, loss, or misuse. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.

Cookies
Our website uses cookies to remember your preferences, keep you signed in, and understand how visitors use our site. You can control cookies through your browser settings, though disabling cookies may affect certain site features.

Your Choices
You may access, update, or request deletion of your personal information by contacting our customer support team. You may also opt out of promotional emails at any time using the unsubscribe link included in each email.

Changes to This Policy
We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.

Contact Us
If you have any questions about this Privacy Policy or how we handle your personal information, please contact our customer support team through the contact details listed on our website.$page$,
    'Privacy Policy | Sri Sai Fashion Jewellery',
    'Read how Sri Sai Fashion Jewellery collects, uses, and protects your personal information when you shop with us.'
),
(
    'terms-of-service',
    'Terms of Service',
    $page$Welcome to Sri Sai Fashion Jewellery. These Terms of Service ("Terms") govern your access to and use of our website and the purchase of products from us. By accessing our website or placing an order, you agree to be bound by these Terms.

Use of Our Website
You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of, this site by any third party. You must be at least 18 years old, or have the involvement of a parent or guardian, to place an order with us.

Products and Pricing
All products displayed on our website are artificial/fashion jewellery unless otherwise stated. We make every effort to display product colours, finishes, and details as accurately as possible, but slight variations may occur due to photography, lighting, and screen settings. Prices are listed in Indian Rupees (INR) and are subject to change without prior notice. We reserve the right to correct any pricing errors, even after an order has been placed.

Orders and Payment
By placing an order, you confirm that all information provided is accurate and complete. We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud, pricing errors, or product unavailability. Full payment is required at the time of placing an order through our supported payment methods.

Account Responsibility
If you create an account with us, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Please notify us immediately of any unauthorised use of your account.

Intellectual Property
All content on this website, including images, product designs, logos, and text, is the property of Sri Sai Fashion Jewellery or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use our content for commercial purposes without our prior written consent.

Limitation of Liability
To the fullest extent permitted by law, Sri Sai Fashion Jewellery shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products.

Governing Law
These Terms are governed by the laws of India, and any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts having competent authority.

Changes to These Terms
We may revise these Terms from time to time. Continued use of our website after changes are posted constitutes your acceptance of the revised Terms.$page$,
    'Terms of Service | Sri Sai Fashion Jewellery',
    'Read the terms and conditions that govern your use of the Sri Sai Fashion Jewellery website and the purchase of our products.'
),
(
    'shipping-policy',
    'Shipping Policy',
    $page$We want your jewellery to reach you safely and on time. Please review our shipping policy below for details on delivery timelines, charges, and order tracking.

Processing Time
Orders are typically processed and dispatched within 1-2 business days of order confirmation, excluding weekends and public holidays. During sale periods or festive seasons, processing times may be slightly longer due to higher order volumes.

Delivery Timelines
Once dispatched, standard delivery within India typically takes 4-7 business days depending on your location. Customers in metro cities generally receive orders faster (3-5 business days), while deliveries to remote or rural areas may take a little longer (7-10 business days). Estimated delivery timelines are also shown at checkout based on your pin code.

Shipping Charges
We offer free standard shipping on prepaid orders above a minimum order value, as indicated on our website at checkout. Orders below this threshold, and all cash-on-delivery orders, are subject to a flat shipping fee, which will be clearly displayed before you complete your purchase.

Order Tracking
Once your order is dispatched, you will receive a shipping confirmation email and/or SMS with your tracking number and a link to track your shipment. You can also view your order status at any time by logging into your account and visiting your order history.

Multiple Shipments
If your order contains multiple items, they may occasionally be shipped separately depending on stock availability, though this will not affect your overall shipping charges.

Delayed or Lost Shipments
While we work with trusted courier partners to ensure timely delivery, occasional delays can occur due to factors outside our control, such as weather, courier network issues, or regional restrictions. If your order has not arrived within the estimated delivery window, please contact our customer support team and we will investigate with our courier partner on your behalf.

International Shipping
At this time, we primarily ship within India. Please contact customer support to check current availability for international shipping to your location.$page$,
    'Shipping Policy | Sri Sai Fashion Jewellery',
    'Learn about delivery timelines, shipping charges, and order tracking for Sri Sai Fashion Jewellery orders across India.'
),
(
    'return-policy',
    'Return & Refund Policy',
    $page$We want you to love your jewellery. If something isn't right, our return policy is designed to make the process as simple as possible.

Return Window
You may request a return within 7 days of receiving your order. Return requests raised after this window unfortunately cannot be accepted. To start a return, please contact our customer support team with your order number and reason for return.

Condition Requirements
To be eligible for a return, items must be unused, unworn, and in their original condition, including all original packaging, tags, and any protective covering intact. Jewellery that shows signs of wear, damage, alteration, or missing components will not be accepted for return. For hygiene reasons, earrings and other pierced-ear items cannot be returned unless they arrived defective or damaged.

Non-Returnable Items
Customised or made-to-order pieces, items purchased during clearance or final-sale promotions, and gift cards are not eligible for return or exchange unless they arrive damaged or defective.

How to Initiate a Return
Contact our customer support team with your order number, the item(s) you wish to return, and the reason for the return. Once approved, we will share instructions for shipping the item back to us. We recommend using a trackable shipping method, as we cannot be responsible for items lost in transit back to us.

Refunds
Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds are processed to your original payment method within 7-10 business days. For cash-on-delivery orders, refunds are issued via bank transfer, so please be ready to share your bank account details when requested.

Damaged or Defective Items
If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with photos of the item and packaging, and we will arrange a replacement or full refund at no additional cost to you.

Exchanges
We currently do not offer direct exchanges. If you would like a different size, colour, or design, please return the original item for a refund and place a new order for the item you'd prefer.$page$,
    'Return & Refund Policy | Sri Sai Fashion Jewellery',
    'Understand the return window, condition requirements, and refund process for orders placed with Sri Sai Fashion Jewellery.'
);
