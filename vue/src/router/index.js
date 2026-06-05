import { createRouter, createWebHashHistory } from 'vue-router'
import UserPage from '@/components/user.vue'
import ProductsPage from '@/components/Products.vue'
import ProductDetailPage from '@/components/ProductDetail.vue'
import FavoritesPage from '@/components/Favorites.vue'
import AdminPage from '@/components/Admin.vue'
import AdminUsersPage from '@/components/AdminUsers.vue'
import AdminManagersPage from '@/components/AdminManagers.vue'
import AdminProductsPage from '@/components/AdminProducts.vue'
import AdminCatalogPage from '@/components/AdminCatalog.vue'
import AdminCommentsPage from '@/components/AdminComments.vue'
import LoginPage from '@/components/Login.vue'
import RegisterPage from '@/components/Register.vue'
import AdminLoginPage from '@/components/AdminLogin.vue'
import ForgetPasswordPage from '@/components/ForgetPassword.vue'
import { clearAuthSession, getAuthToken, getAuthUser } from '@/utils/auth'

function getRoleHome(user) {
  return user && user.accountType === 'ADMIN' ? '/admin/users' : '/products'
}

function getRoleLogin(role) {
  return role === 'ADMIN' ? '/admin-login' : '/login'
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/user', component: UserPage, meta: { requiresAuth: true, role: 'USER' } },
    { path: '/products', component: ProductsPage, meta: { requiresAuth: true, role: 'USER' } },
    { path: '/products/:id', component: ProductDetailPage, meta: { requiresAuth: true, role: 'USER' } },
    { path: '/favorites', component: FavoritesPage, meta: { requiresAuth: true, role: 'USER' } },
    {
      path: '/admin',
      component: AdminPage,
      redirect: '/admin/users',
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        { path: 'users', component: AdminUsersPage },
        { path: 'managers', component: AdminManagersPage, meta: { requiresSuperAdmin: true } },
        { path: 'catalog', component: AdminCatalogPage },
        { path: 'comments', component: AdminCommentsPage },
        { path: 'products', redirect: '/admin/products/phone' },
        { path: 'products/phone', component: AdminProductsPage, props: { categoryName: '手机' } },
        { path: 'products/computer', component: AdminProductsPage, props: { categoryName: '电脑' } }
      ]
    },
    { path: '/login', component: LoginPage, meta: { guestOnly: true } },
    { path: '/register', component: RegisterPage, meta: { guestOnly: true } },
    { path: '/admin-login', component: AdminLoginPage, meta: { guestOnly: true } },
    { path: '/forget', component: ForgetPasswordPage, meta: { guestOnly: true } }
  ]
})

router.beforeEach((to) => {
  const token = getAuthToken()
  const user = getAuthUser()

  if (to.meta.requiresAuth && (!token || !user)) {
    clearAuthSession()
    return {
      path: getRoleLogin(to.meta.role),
      query: { redirect: to.fullPath }
    }
  }

  if (to.meta.requiresAuth && to.meta.role !== user.accountType) {
    return getRoleHome(user)
  }

  if (to.meta.requiresSuperAdmin && user.role !== '超级管理员') {
    return '/admin/users'
  }

  if (to.meta.guestOnly && token && user) {
    return getRoleHome(user)
  }

  if (to.meta.guestOnly && token && !user) {
    clearAuthSession()
  }

  return true
})

export default router
