import { createRouter, createWebHistory } from 'vue-router'


import LoginPage from '@/pages/auth/LoginPage.vue'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.vue'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.vue'


import DashboardPage from '@/pages/dashboard/DashboardPage.vue'
import ProfilePage from '@/pages/profile/ProfilePage.vue'
import AIChatPage from '@/pages/ai-chat/AIChatPage.vue'
import SkinAnalysisPage from '@/pages/skin-analysis/SkinAnalysisPage.vue'
import ResultsPage from '@/pages/results/ResultsPage.vue'


const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordPage
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordPage
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'chat',
    component: AIChatPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/skin-analysis',
    name: 'skin-analysis',
    component: SkinAnalysisPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/results',
    name: 'results',
    component: ResultsPage,
    meta: { requiresAuth: true }
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('authUser')

  // 1. Védett útvonalak ellenőrzése
  if (requiresAuth) {
    // Ha nincs token vagy user adat, irány a login
    if (!token || !user) {
      console.warn('Access denied: Authentication required')
      next('/login')
      return
    }
  }

  // 2. Már bejelentkezett felhasználó visszairányítása
  // Ha be van lépve, ne engedjük vissza a Login/Register oldalra
  if ((to.path === '/login' || to.path === '/register') && token && user) {
    next('/dashboard')
    return
  }

  // 3. Minden rendben, mehet tovább
  next()
})

export default router