import { createRouter, createWebHashHistory } from 'vue-router'
import UserPage from '@/components/user.vue'
import ProductsPage from '@/components/Products.vue'
import AdminUsersPage from '@/components/AdminUsers.vue'
import LoginPage from '@/components/Login.vue'
import RegisterPage from '@/components/Register.vue'
import AdminLoginPage from '@/components/AdminLogin.vue'
import ForgetPasswordPage from '@/components/ForgetPassword.vue'
import { clearAuthSession, getAuthToken, getAuthUser } from '@/utils/auth'

function getRoleHome(user) {
  return user && user.accountType === 'ADMIN' ? '/admin/users' : '/user'
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
    { path: '/admin/users', component: AdminUsersPage, meta: { requiresAuth: true, role: 'ADMIN' } },
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

  if (to.meta.guestOnly && token && user) {
    return getRoleHome(user)
  }

  if (to.meta.guestOnly && token && !user) {
    clearAuthSession()
  }

  return true
})

export default router
