/**
 * TypeScript contracts mirroring the Spring Boot backend REST API.
 * Base URL: http://localhost:8090/api/v1
 */

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number
}

export interface SubCategory {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isFeatured: boolean
}

export interface Occasion {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
}

export type MetalType =
  | 'GOLD_PLATED'
  | 'ROSE_GOLD_PLATED'
  | 'SILVER_PLATED'
  | 'PLATINUM_PLATED'
  | 'OXIDIZED'
  | 'BRASS'
  | 'OTHER'

export interface Product {
  id: string
  ornamentId: string
  name: string
  slug: string
  shortDescription: string | null
  basePrice: number
  discountedPrice: number | null
  metalType: MetalType | string
  primaryImageUrl: string | null
  isFeatured: boolean
}

export interface ProductImage {
  id: string
  imageUrl: string
  displayOrder: number
  isPrimary?: boolean
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'COMING_SOON'

/**
 * Response shape for GET /products/{slug}. Extends the listing summary with
 * gallery images, specs, and the review aggregate fields added in Sprint 2.
 * Field names verified against the backend's ProductDetailDto record.
 */
export interface ProductDetail extends Product {
  description: string | null
  weightGrams: number | null
  stockStatus: StockStatus
  isActive: boolean
  categoryId?: string | null
  categoryName?: string | null
  categorySlug?: string | null
  subCategoryId?: string | null
  subCategoryName?: string | null
  subCategorySlug?: string | null
  collectionSlugs: string[]
  occasionSlugs: string[]
  images: ProductImage[]
  averageRating: number | null
  reviewCount: number
  /** Sprint 7: SEO overrides — mirrors `product/dto/ProductDetailDto.java`. */
  metaTitle: string | null
  metaDescription: string | null
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  first?: boolean
  last?: boolean
}

export interface ProductQueryParams {
  page?: number
  size?: number
  sort?: string
  featured?: boolean
  categorySlug?: string
  subCategorySlug?: string
  collectionSlug?: string
  occasionSlug?: string
  minPrice?: number
  maxPrice?: number
  metalType?: string
  q?: string
}

/* -------------------------------------------------------------------- */
/* Sprint 2: auth, cart, wishlist, addresses, reviews                    */
/* -------------------------------------------------------------------- */

export interface AuthUser {
  id: string
  email: string
  fullName: string
  phoneNumber?: string | null
  roles?: string[]
  /** Sprint 8: this user's own shareable referral code — only present on the
   * `/auth/me` response (`UserProfileResponse`), not on login/register's
   * `JwtResponse`. */
  referralCode?: string | null
}

/** POST /auth/login and /auth/register both resolve to this shape (backend's JwtResponse record). */
export interface AuthResponse {
  accessToken: string
  tokenType: string
  userId: string
  email: string
  fullName: string
  roles: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  phoneNumber: string
  /** Sprint 8: optional — another user's shareable referral code. Omit rather
   * than sending an empty string when the field wasn't filled in. */
  referralCode?: string
}

export interface Address {
  id: string
  label?: string | null
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface CreateAddressPayload {
  label?: string
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  lineTotal: number
}

export interface Cart {
  items: CartItem[]
  itemCount: number
  subtotal: number
}

export interface Review {
  id: string
  userId: string
  reviewerName?: string | null
  rating: number
  title: string
  comment: string
  isVerifiedPurchase: boolean
  createdDate: string
}

export interface ReviewPayload {
  rating: number
  title: string
  comment: string
}

export interface HomeBanner {
  id: number
  title: string
  subtitle: string | null
  imageUrl: string
  mobileImageUrl: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  displayOrder: number
}

export type HomeSectionType =
  | 'CATEGORY_GRID'
  | 'COLLECTION_SHOWCASE'
  | 'PRODUCT_CAROUSEL'
  | 'BANNER_STRIP'
  | 'OCCASION_GRID'

export type HomeSectionReferenceType = 'CATEGORY' | 'COLLECTION' | 'PRODUCT' | 'OCCASION'

export interface HomeSectionItem {
  referenceType: HomeSectionReferenceType
  referenceId: number
  displayOrder: number
  overrideImageUrl: string | null
  // Resolved summary fields vary by referenceType; kept loose intentionally.
  name?: string
  slug?: string
  imageUrl?: string
  description?: string | null
  basePrice?: number
  discountedPrice?: number | null
}

export interface HomeSection {
  id: number
  sectionType: HomeSectionType
  title: string
  subtitle: string | null
  displayOrder: number
  items: HomeSectionItem[]
}

/* -------------------------------------------------------------------- */
/* Sprint 3: checkout, orders                                            */
/* -------------------------------------------------------------------- */

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export type PaymentMethod = 'COD' | 'ONLINE'

export type PaymentStatus = 'PENDING' | 'PAID'

export interface CreateOrderPayload {
  addressId: string
  paymentMethod: PaymentMethod
  /** Sprint 8: optional wallet amount to redeem against this order. The
   * server caps the actually-deducted amount at
   * min(this value, wallet balance, order total) — this is only a client-side
   * estimate. Omit (rather than 0) to redeem nothing. */
  useWalletAmount?: number
}

/** GET /orders — lightweight row shape for the order history list. */
export interface OrderSummary {
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  placedAt: string
}

export interface OrderItem {
  productId: string
  ornamentId: string
  productName: string
  productImageUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

/** Shipping address as embedded (snapshotted) in an order — no id/label/isDefault. */
export interface OrderShippingAddress {
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

/** POST /orders and GET /orders/{orderNumber} both resolve to this shape. */
export interface OrderDetail {
  orderNumber: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReference?: string | null
  subtotal: number
  shippingFee: number
  totalAmount: number
  shippingAddress: OrderShippingAddress
  items: OrderItem[]
  placedAt: string
  updatedAt: string
}

/* -------------------------------------------------------------------- */
/* Sprint 7: public blog + static/legal pages                            */
/* -------------------------------------------------------------------- */

/** GET /blog — lightweight row shape for the listing grid. Mirrors `blog/dto/BlogPostSummaryDto.java`. */
export interface BlogPostSummary {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  authorName: string | null
  publishedDate: string
}

/** GET /blog/{slug} — full post shape. Mirrors `blog/dto/BlogPostDto.java`. */
export interface BlogPostDetail {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  authorName: string | null
  isPublished: boolean
  publishedDate: string
  metaTitle: string | null
  metaDescription: string | null
}

/** GET /pages/{slug} — public static/legal page. Mirrors `page/dto/StaticPageDto.java`. */
export interface StaticPage {
  id: string
  slug: string
  title: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
}

/* -------------------------------------------------------------------- */
/* Sprint 8: wallet / rewards / referral                                 */
/* -------------------------------------------------------------------- */

/** Mirrors `loyalty/entity/TransactionType.java`. */
export type WalletTransactionType = 'PURCHASE_REWARD' | 'REFERRAL_BONUS' | 'REDEMPTION' | 'ADMIN_ADJUSTMENT'

/**
 * Mirrors `loyalty/dto/WalletTransactionDto.java`. `amount` is signed —
 * positive for credits (purchase rewards, referral bonuses), negative for
 * debits (redemptions) — use the sign directly for display (colour, +/-)
 * rather than branching on `transactionType`.
 */
export interface WalletTransaction {
  id: string
  amount: number
  transactionType: WalletTransactionType
  description: string
  referenceOrderNumber: string | null
  createdDate: string
}

/** Mirrors `loyalty/dto/WalletResponse.java` — response shape for `GET /wallet`. */
export interface WalletResponse {
  balance: number
  transactions: PaginatedResponse<WalletTransaction>
}
