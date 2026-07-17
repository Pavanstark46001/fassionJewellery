/**
 * TypeScript contracts for the admin back-office API (`/api/v1/admin/**`).
 * Mirrors the real Java DTOs in `jewellery-backend/.../admin/**` field-for-field —
 * kept separate from `types/api.ts` because a couple of the storefront's existing
 * types (e.g. `MetalType`, `ProductDetail`) don't actually match their backend
 * DTOs and the admin surface needs the true shapes.
 */

import type { OrderStatus, PaymentMethod, PaymentStatus } from './api'

/** Mirrors `product/entity/MetalType.java` exactly (the storefront's `MetalType` union in api.ts is stale). */
export type AdminMetalType =
  | 'GOLD_PLATED'
  | 'SILVER'
  | 'BRASS'
  | 'CZ'
  | 'OXIDIZED'
  | 'ROSE_GOLD_PLATED'
  | 'PLATINUM_PLATED'

/** Mirrors `product/entity/StockStatus.java`. */
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'COMING_SOON'

/** Mirrors `common/dto/PageResponse.java`. */
export interface AdminPageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

/* -------------------------------------------------------------------- */
/* Dashboard                                                             */
/* -------------------------------------------------------------------- */

/** Mirrors `admin/dashboard/dto/AdminDashboardSummaryDto.java`. */
export interface AdminDashboardSummary {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  ordersByStatus: Partial<Record<OrderStatus, number>>
  recentOrders: AdminOrderSummary[]
}

/* -------------------------------------------------------------------- */
/* Products                                                              */
/* -------------------------------------------------------------------- */

/** Mirrors `product/dto/ProductSummaryDto.java`. */
export interface AdminProductSummary {
  id: string
  ornamentId: string
  name: string
  slug: string
  shortDescription: string | null
  basePrice: number
  discountedPrice: number | null
  metalType: AdminMetalType
  isFeatured: boolean
  stockStatus: StockStatus
  primaryImageUrl: string | null
  categoryName: string | null
  categorySlug: string | null
}

/** Mirrors `product/dto/ProductImageDto.java`. */
export interface AdminProductImage {
  id: string
  imageUrl: string
  altText: string | null
  displayOrder: number | null
  isPrimary: boolean
}

/** Mirrors `product/dto/ProductDetailDto.java` — the real response shape for admin product get/create/update. */
export interface AdminProductDetail {
  id: string
  ornamentId: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  basePrice: number
  discountedPrice: number | null
  metalType: AdminMetalType
  weightGrams: number | null
  categoryId: string
  categoryName: string | null
  categorySlug: string | null
  subCategoryId: string | null
  subCategoryName: string | null
  subCategorySlug: string | null
  isActive: boolean
  isFeatured: boolean
  stockStatus: StockStatus
  metaTitle: string | null
  metaDescription: string | null
  images: AdminProductImage[]
  collectionSlugs: string[]
  occasionSlugs: string[]
  averageRating: number | null
  reviewCount: number
}

/** Mirrors `admin/product/dto/AdminProductImageRequest.java`. */
export interface AdminProductImagePayload {
  imageUrl: string
  altText?: string
  displayOrder?: number
  isPrimary: boolean
}

/** Mirrors `admin/product/dto/AdminProductRequest.java`. */
export interface AdminProductPayload {
  name: string
  slug?: string
  shortDescription?: string
  description?: string
  basePrice: number
  discountedPrice?: number | null
  metalType: AdminMetalType
  weightGrams?: number | null
  categoryId: string
  subCategoryId?: string | null
  isActive?: boolean
  isFeatured?: boolean
  stockStatus?: StockStatus
  metaTitle?: string
  metaDescription?: string
  images: AdminProductImagePayload[]
  collectionIds?: string[]
  occasionIds?: string[]
}

export interface AdminProductListParams {
  q?: string
  categorySlug?: string
  isActive?: boolean
  page?: number
  size?: number
  sort?: string
}

/* -------------------------------------------------------------------- */
/* Categories / sub-categories / collections / occasions                 */
/* -------------------------------------------------------------------- */

/** Mirrors `category/dto/CategoryDto.java` (Sprint 7 added `metaTitle`/`metaDescription`). */
export interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number | null
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
}

/** Mirrors `category/dto/SubCategoryDto.java`. */
export interface AdminSubCategory {
  id: string
  categoryId: string
  categoryName: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number | null
  isActive: boolean
}

/** Mirrors `admin/category/dto/AdminCategoryRequest.java` and `AdminSubCategoryRequest.java` (identical shape). */
export interface AdminCategoryPayload {
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  displayOrder?: number
  isActive?: boolean
  metaTitle?: string
  metaDescription?: string
}

export type AdminSubCategoryPayload = AdminCategoryPayload

/** Mirrors `collection/dto/CollectionDto.java` (Sprint 7 added `metaTitle`/`metaDescription`). */
export interface AdminCollection {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isFeatured: boolean
  displayOrder: number | null
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
}

/** Mirrors `admin/collection/dto/AdminCollectionRequest.java`. */
export interface AdminCollectionPayload {
  name: string
  slug?: string
  description?: string
  imageUrl?: string
  isFeatured?: boolean
  displayOrder?: number
  isActive?: boolean
  metaTitle?: string
  metaDescription?: string
}

/** Mirrors `occasion/dto/OccasionDto.java` (Sprint 7 added `metaTitle`/`metaDescription`). */
export interface AdminOccasion {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  displayOrder: number | null
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
}

/** Mirrors `admin/occasion/dto/AdminOccasionRequest.java`. */
export type AdminOccasionPayload = AdminCategoryPayload

/* -------------------------------------------------------------------- */
/* Orders                                                                */
/* -------------------------------------------------------------------- */

/** Mirrors `admin/order/dto/AdminOrderSummaryDto.java`. */
export interface AdminOrderSummary {
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  placedAt: string
  customerEmail: string
  customerName: string
}

/** Mirrors `order/dto/OrderItemDto.java`. */
export interface AdminOrderItem {
  productId: string
  ornamentId: string
  productName: string
  productImageUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

/** Mirrors `order/dto/ShippingAddressDto.java`. */
export interface AdminShippingAddress {
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

/** Mirrors `admin/order/dto/AdminOrderDetailDto.java`. */
export interface AdminOrderDetail {
  orderNumber: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReference: string | null
  subtotal: number
  shippingFee: number
  totalAmount: number
  shippingAddress: AdminShippingAddress
  items: AdminOrderItem[]
  placedAt: string
  updatedAt: string
  customerId: string
  customerEmail: string
  customerName: string
}

/* -------------------------------------------------------------------- */
/* Customers                                                             */
/* -------------------------------------------------------------------- */

/** Mirrors `admin/customer/dto/AdminCustomerSummaryDto.java`. */
export interface AdminCustomerSummary {
  id: string
  email: string
  fullName: string
  phoneNumber: string | null
  isActive: boolean
  createdDate: string
  orderCount: number
}

/** Mirrors `order/dto/OrderSummaryDto.java`, embedded in the customer detail page. */
export interface AdminCustomerOrderSummary {
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  itemCount: number
  placedAt: string
}

/** Mirrors `admin/customer/dto/AdminCustomerDetailDto.java`. */
export interface AdminCustomerDetail {
  id: string
  email: string
  fullName: string
  phoneNumber: string | null
  isActive: boolean
  createdDate: string
  orders: AdminPageResponse<AdminCustomerOrderSummary>
}

/* -------------------------------------------------------------------- */
/* Sprint 6: POS / in-store billing                                      */
/* -------------------------------------------------------------------- */

/** Mirrors `order/entity/PaymentMethod.java` — the full enum. The storefront's
 * `PaymentMethod` in api.ts only has `COD`/`ONLINE`, predating Sprint 6's
 * `CASH`/`CARD` additions for POS. */
export type AdminPaymentMethod = 'COD' | 'ONLINE' | 'CASH' | 'CARD'

/** Mirrors `order/entity/OrderChannel.java`. */
export type AdminOrderChannel = 'WEB' | 'POS'

/** The subset of `AdminPaymentMethod` a POS sale may be paid with — mirrors
 * `PosService.ALLOWED_POS_PAYMENT_METHODS` (COD is web-checkout-only). */
export type PosPaymentMethod = 'CASH' | 'CARD' | 'ONLINE'

/** Mirrors `pos/dto/PosProductLookupDto.java` — result row for
 * `GET /admin/pos/lookup`. Always returned as a list: 0-1 items for an exact
 * `ORN-NNNNNN` match, up to 8 for a name-fallback search. */
export interface PosProductLookup {
  id: string
  ornamentId: string
  name: string
  primaryImageUrl: string | null
  basePrice: number
  discountedPrice: number | null
  metalType: AdminMetalType
  stockStatus: StockStatus
  categoryName: string | null
}

/** Mirrors `pos/dto/PosCustomerSearchDto.java` — result row for
 * `GET /admin/pos/customers/search`. */
export interface PosCustomerSearchResult {
  id: string
  fullName: string
  email: string
  phoneNumber: string
}

/** Mirrors `pos/dto/PosCreateCustomerRequest.java` — body for
 * `POST /admin/pos/customers`. `email` is optional; the backend derives a
 * placeholder from the phone number when omitted. */
export interface PosCreateCustomerPayload {
  fullName: string
  phoneNumber: string
  email?: string
}

/** Mirrors `pos/dto/PosSaleItemRequest.java`. */
export interface PosSaleItemPayload {
  productId: string
  quantity: number
}

/** Mirrors `pos/dto/PosSaleRequest.java` — body for `POST /admin/pos/sales`.
 * Exactly one of `customerId` or `walkInCustomerName`/`walkInCustomerPhone`
 * normally applies; a nameless walk-in with neither is also accepted
 * server-side (defaults to "Walk-in Customer"). */
export interface PosSalePayload {
  customerId?: string
  walkInCustomerName?: string
  walkInCustomerPhone?: string
  items: PosSaleItemPayload[]
  discountAmount?: number
  paymentMethod: PosPaymentMethod
}

/** Mirrors `order/dto/OrderDetailDto.java` — the response shape for
 * `POST /admin/pos/sales` (Sprint 6 added `channel`, `discountAmount`,
 * `gstAmount` and `walkInCustomerName` to this same DTO so it can represent
 * both a WEB order and a POS sale). */
export interface PosSaleResult {
  orderNumber: string
  status: OrderStatus
  channel: AdminOrderChannel
  paymentMethod: AdminPaymentMethod
  paymentStatus: PaymentStatus
  paymentReference: string | null
  subtotal: number
  discountAmount: number
  gstAmount: number
  shippingFee: number
  totalAmount: number
  walkInCustomerName: string | null
  shippingAddress: AdminShippingAddress
  items: AdminOrderItem[]
  placedAt: string
  updatedAt: string
}

/* -------------------------------------------------------------------- */
/* Sprint 7: CMS (banners, home sections), blog, static pages            */
/* -------------------------------------------------------------------- */

/** Mirrors `cms/dto/BannerDto.java` — response shape for the admin banner endpoints. */
export interface AdminBanner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  displayOrder: number | null
  isActive: boolean
}

/** Mirrors `admin/cms/dto/AdminBannerRequest.java`. */
export interface AdminBannerPayload {
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  displayOrder?: number
  isActive?: boolean
}

/** Mirrors `cms/entity/SectionType.java`. */
export type AdminSectionType = 'CATEGORY_GRID' | 'COLLECTION_SHOWCASE' | 'PRODUCT_CAROUSEL' | 'OCCASION_LIST'

/** Mirrors `cms/entity/ReferenceType.java`. */
export type AdminReferenceType = 'CATEGORY' | 'SUBCATEGORY' | 'COLLECTION' | 'OCCASION' | 'PRODUCT'

/** Mirrors `admin/cms/dto/AdminHomeSectionItemDto.java` — raw (unresolved) pointer, not the
 * public homepage's resolved `data` payload. */
export interface AdminHomeSectionItem {
  id: string
  homeSectionId: string
  referenceType: AdminReferenceType
  referenceId: string
  displayOrder: number | null
  overrideImageUrl: string | null
}

/** Mirrors `admin/cms/dto/AdminHomeSectionItemRequest.java`. */
export interface AdminHomeSectionItemPayload {
  referenceType: AdminReferenceType
  referenceId: string
  displayOrder?: number
  overrideImageUrl?: string
}

/** Mirrors `admin/cms/dto/AdminHomeSectionDto.java`. */
export interface AdminHomeSection {
  id: string
  title: string
  subtitle: string | null
  sectionType: AdminSectionType
  displayOrder: number | null
  isActive: boolean
  items: AdminHomeSectionItem[]
}

/** Mirrors `admin/cms/dto/AdminHomeSectionRequest.java`. */
export interface AdminHomeSectionPayload {
  title: string
  subtitle?: string
  sectionType: AdminSectionType
  displayOrder?: number
  isActive?: boolean
}

/** Mirrors `admin/cms/dto/AdminReorderRequest.java` — body for `PATCH .../home-sections/{id}/reorder`. */
export interface AdminReorderPayload {
  displayOrder: number
}

/** Mirrors `blog/dto/BlogPostDto.java` — the same shape is used for the admin list/get/create/update API. */
export interface AdminBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  authorName: string | null
  isPublished: boolean
  publishedDate: string | null
  metaTitle: string | null
  metaDescription: string | null
}

/** Mirrors `admin/blog/dto/AdminBlogPostRequest.java`. */
export interface AdminBlogPostPayload {
  title: string
  slug?: string
  excerpt?: string
  content: string
  coverImageUrl?: string
  authorName?: string
  isPublished?: boolean
  metaTitle?: string
  metaDescription?: string
}

/** Mirrors `page/dto/StaticPageDto.java` — same shape used for the admin list/get/create/update API. */
export interface AdminStaticPage {
  id: string
  slug: string
  title: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
}

/** Mirrors `admin/page/dto/AdminStaticPageRequest.java`. */
export interface AdminStaticPagePayload {
  slug?: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
}

/* -------------------------------------------------------------------- */
/* Sprint 8: real inventory tracking (stock quantity/location/movements) */
/* -------------------------------------------------------------------- */

/** Mirrors `inventory/entity/MovementType.java`. */
export type MovementType = 'PURCHASE_ENTRY' | 'DAMAGE_ENTRY' | 'RETURN_ENTRY' | 'STOCK_TRANSFER' | 'SALE_DEDUCTION'

/** The subset of `MovementType` an admin may record manually — `SALE_DEDUCTION`
 * is excluded since the backend only ever writes it automatically from
 * `InventoryService.deductStock` (see `StockMovementRequest.java`). */
export type ManualMovementType = Exclude<MovementType, 'SALE_DEDUCTION'>

/** Mirrors `admin/inventory/dto/AdminProductInventoryDto.java` — one row of
 * `GET /admin/inventory/products`. Deliberately has no image/category field;
 * the real backend DTO doesn't carry them. */
export interface AdminProductInventory {
  productId: string
  ornamentId: string
  name: string
  stockQuantity: number
  lowStockThreshold: number
  stockStatus: StockStatus
  warehouseName: string | null
  rackCode: string | null
  shelfCode: string | null
}

export interface AdminInventoryListParams {
  q?: string
  lowStockOnly?: boolean
  page?: number
  size?: number
  sort?: string
}

/** Mirrors `admin/inventory/dto/InventoryLocationRequest.java` — body for
 * `PUT /admin/inventory/products/{id}/location`. */
export interface InventoryLocationPayload {
  warehouseName?: string | null
  rackCode?: string | null
  shelfCode?: string | null
}

/** Mirrors `admin/inventory/dto/StockMovementDto.java`. */
export interface AdminStockMovement {
  id: string
  productId: string
  ornamentId: string
  productName: string
  movementType: MovementType
  quantityChange: number
  note: string | null
  referenceOrderNumber: string | null
  performedBy: string | null
  createdDate: string
}

/** Mirrors `admin/inventory/dto/StockMovementRequest.java` — body for
 * `POST /admin/inventory/movements`. `quantityChange` is signed by the
 * caller (positive for purchase/return entries, negative for damage). */
export interface StockMovementPayload {
  productId: string
  movementType: ManualMovementType
  quantityChange: number
  note?: string
}

export interface AdminMovementListParams {
  productId?: string
  page?: number
  size?: number
  sort?: string
}
