import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from './RootLayout'

const HomePage = lazy(() => import('@/pages/Home/HomePage'))
const ProductListingPage = lazy(() => import('@/pages/ProductListing/ProductListingPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail/ProductDetailPage'))
const LoginPage = lazy(() => import('@/pages/Login/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/Register/RegisterPage'))
const CartPage = lazy(() => import('@/pages/Cart/CartPage'))
const WishlistPage = lazy(() => import('@/pages/Wishlist/WishlistPage'))
const CheckoutPage = lazy(() => import('@/pages/Checkout/CheckoutPage'))
const OrderHistoryPage = lazy(() => import('@/pages/Orders/OrderHistoryPage'))
const OrderDetailPage = lazy(() => import('@/pages/Orders/OrderDetailPage'))
const WalletPage = lazy(() => import('@/pages/Wallet/WalletPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'))
const BlogListPage = lazy(() => import('@/pages/Blog/BlogListPage'))
const BlogDetailPage = lazy(() => import('@/pages/Blog/BlogDetailPage'))
const StaticPageView = lazy(() => import('@/pages/StaticPage/StaticPageView'))

const AdminLayout = lazy(() => import('@/pages/Admin/AdminLayout'))
const AdminDashboardPage = lazy(() => import('@/pages/Admin/Dashboard/AdminDashboardPage'))
const PosBillingPage = lazy(() => import('@/pages/Admin/Pos/PosBillingPage'))
const AdminProductListPage = lazy(() => import('@/pages/Admin/Products/AdminProductListPage'))
const AdminProductFormPage = lazy(() => import('@/pages/Admin/Products/AdminProductFormPage'))
const AdminInventoryPage = lazy(() => import('@/pages/Admin/Inventory/AdminInventoryPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/Admin/Categories/AdminCategoriesPage'))
const AdminCollectionsPage = lazy(() => import('@/pages/Admin/Collections/AdminCollectionsPage'))
const AdminOccasionsPage = lazy(() => import('@/pages/Admin/Occasions/AdminOccasionsPage'))
const AdminOrderListPage = lazy(() => import('@/pages/Admin/Orders/AdminOrderListPage'))
const AdminOrderDetailPage = lazy(() => import('@/pages/Admin/Orders/AdminOrderDetailPage'))
const AdminCustomerListPage = lazy(() => import('@/pages/Admin/Customers/AdminCustomerListPage'))
const AdminCustomerDetailPage = lazy(() => import('@/pages/Admin/Customers/AdminCustomerDetailPage'))
const AdminBannersPage = lazy(() => import('@/pages/Admin/Cms/AdminBannersPage'))
const AdminHomeSectionsPage = lazy(() => import('@/pages/Admin/Cms/AdminHomeSectionsPage'))
const AdminBlogPage = lazy(() => import('@/pages/Admin/Cms/AdminBlogPage'))
const AdminPagesPage = lazy(() => import('@/pages/Admin/Cms/AdminPagesPage'))

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/collections/:categorySlug', element: withSuspense(<ProductListingPage />) },
      { path: '/products', element: withSuspense(<ProductListingPage />) },
      { path: '/products/:productSlug', element: withSuspense(<ProductDetailPage />) },
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
      { path: '/cart', element: withSuspense(<CartPage />) },
      { path: '/wishlist', element: withSuspense(<WishlistPage />) },
      { path: '/checkout', element: withSuspense(<CheckoutPage />) },
      { path: '/orders', element: withSuspense(<OrderHistoryPage />) },
      { path: '/orders/:orderNumber', element: withSuspense(<OrderDetailPage />) },
      { path: '/wallet', element: withSuspense(<WalletPage />) },
      { path: '/blog', element: withSuspense(<BlogListPage />) },
      { path: '/blog/:slug', element: withSuspense(<BlogDetailPage />) },
      { path: '/pages/:slug', element: withSuspense(<StaticPageView />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: '/admin',
    element: withSuspense(<AdminLayout />),
    children: [
      { index: true, element: withSuspense(<AdminDashboardPage />) },
      { path: 'pos', element: withSuspense(<PosBillingPage />) },
      { path: 'products', element: withSuspense(<AdminProductListPage />) },
      { path: 'products/new', element: withSuspense(<AdminProductFormPage />) },
      { path: 'products/:id/edit', element: withSuspense(<AdminProductFormPage />) },
      { path: 'inventory', element: withSuspense(<AdminInventoryPage />) },
      { path: 'categories', element: withSuspense(<AdminCategoriesPage />) },
      { path: 'collections', element: withSuspense(<AdminCollectionsPage />) },
      { path: 'occasions', element: withSuspense(<AdminOccasionsPage />) },
      { path: 'orders', element: withSuspense(<AdminOrderListPage />) },
      { path: 'orders/:orderNumber', element: withSuspense(<AdminOrderDetailPage />) },
      { path: 'customers', element: withSuspense(<AdminCustomerListPage />) },
      { path: 'customers/:userId', element: withSuspense(<AdminCustomerDetailPage />) },
      { path: 'cms/banners', element: withSuspense(<AdminBannersPage />) },
      { path: 'cms/home-sections', element: withSuspense(<AdminHomeSectionsPage />) },
      { path: 'blog', element: withSuspense(<AdminBlogPage />) },
      { path: 'pages', element: withSuspense(<AdminPagesPage />) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
