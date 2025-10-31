import { createRouter, createWebHistory } from 'vue-router'


import LoginPage from '@/pages/auth/LoginPage.vue'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.vue'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.vue'

 
import DashboardPage from '@/pages/dashboard/DashboardPage.vue'
import ProfilePage from '@/pages/profile/ProfilePage.vue'
import AIChatPage from '@/pages/ai-chat/AIChatPage.vue'


const routes = [
  // Redirect root to login
  { 
    path: '/', 
    redirect: '/login' 
  },
  
  // Auth routes (simplified)
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
  
  // Main app routes (flat structure)
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentication guard
router.beforeEach((to, from, next) => {
  // Ellenőrizzük, hogy a route megköveteli-e a bejelentkezést
  const requiresAuth = to.meta.requiresAuth
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('authUser')
  
  if (requiresAuth) {
    // Token és user adatok szükségesek
    if (!token || !user) {
      console.warn('Access denied: No authentication token or user data')
      // Nincs token vagy user, redirect login oldalra
      next('/login')
      return
    }
  }
  
  // Ha már be van jelentkezve és login/register oldalra megy, redirect dashboard-ra
  if ((to.path === '/login' || to.path === '/register') && token && user) {
    next('/dashboard')
    return
  }
  
  // Minden rendben, lehet menni
  next()
})

export default router
