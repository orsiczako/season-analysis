/**
 * UNIFIED SERVICES FILE
 * All frontend services consolidated for simplicity
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Auth interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function apiCall(axiosCall, errorMessage = 'API hiba történt') {
  try {
    const response = await axiosCall()
    return { success: true, data: response.data }
  } catch (error) {
    const message = error.response?.data?.message || errorMessage
    console.error('API Error:', message, error)
    return { success: false, message, error }
  }
}

export { apiClient }

export const aiService = {
  async chat(message, conversationHistory = [], context = null) {
    return apiCall(
      () => apiClient.post('/api/ai/chat', { message, conversationHistory, context }),
      'AI chat hiba'
    )
  },

  async chatGuest(message, conversationHistory = [], context = null) {
    return apiCall(
      () => apiClient.post('/api/ai/chat-guest', { message, conversationHistory, context }),
      'AI chat hiba'
    )
  },

  async analyzeColorType(conversationHistory, accountId) {
    return apiCall(
      () => apiClient.post('/api/ai/analyze-color', { conversationHistory, accountId }),
      'Színelemzés hiba'
    )
  }
}

export const userService = {
  async login(username, password) {
    return apiCall(
      () => apiClient.post('/api/user/login', { username, password }),
      'Bejelentkezési hiba'
    )
  },

  async register(userData) {
    return apiCall(
      () => apiClient.post('/api/user/register', userData),
      'Regisztrációs hiba'
    )
  },

  async getProfile() {
    return apiCall(
      () => apiClient.get('/api/user/me'),
      'Profil betöltési hiba'
    )
  },

  async changePassword(currentPassword, newPassword) {
    return apiCall(
      () => apiClient.put('/api/user/change-password', { currentPassword, newPassword }),
      'Jelszó változtatási hiba'
    )
  },

  async deleteAccount() {
    return apiCall(
      () => apiClient.delete('/api/user/delete-account'),
      'Fiók törlési hiba'
    )
  },

  async updateColorSeason(season) {
    return apiCall(
      () => apiClient.put('/api/user/color-season', { season }),
      'Színtípus frissítési hiba'
    )
  }
}

export const favoriteColorsService = {
  async getFavoriteColors() {
    return apiCall(
      () => apiClient.get('/api/user/favorite-colors'),
      'Kedvenc színek betöltési hiba'
    )
  },

  async addFavoriteColor(colorHex) {
    return apiCall(
      () => apiClient.post('/api/user/favorite-colors', { colorHex }),
      'Kedvenc szín hozzáadási hiba'
    )
  },

  async removeFavoriteColor(colorHex) {
    return apiCall(
      () => apiClient.delete(`/api/user/favorite-colors/${encodeURIComponent(colorHex)}`),
      'Kedvenc szín törlési hiba'
    )
  }
}

export const authService = {
  async forgotPassword(email, emailTemplate) {
    return apiCall(
      () => apiClient.post('/api/user/forgot-password', { email, emailTemplate }),
      'Jelszó visszaállítási hiba'
    )
  },

  async resetPassword(token, password) {
    return apiCall(
      () => apiClient.post('/api/user/reset-password', { token, password }),
      'Jelszó visszaállítási hiba'
    )
  }
}

class ThemeService {
  constructor() {
    this.currentTheme = 'light'
    this.listeners = []
  }

  init() {
    this.currentTheme = this.getInitialTheme()
    this.applyTheme(this.currentTheme)
    this.setupSystemThemeListener()
  }

  getInitialTheme() {
    const savedTheme = localStorage.getItem('selected-theme')
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) return savedTheme
    
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  }

  setTheme(theme) {
    if (!['light', 'dark'].includes(theme)) return
    
    this.currentTheme = theme
    localStorage.setItem('selected-theme', theme)
    this.applyTheme(theme)
    this.notifyListeners(theme)
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light')
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.className = `theme-${theme}`
  }

  addListener(callback) { this.listeners.push(callback) }
  removeListener(callback) { this.listeners = this.listeners.filter(l => l !== callback) }
  
  addThemeChangeListener(callback) { this.addListener(callback) }
  removeThemeChangeListener(callback) { this.removeListener(callback) }
  
  notifyListeners(theme) { this.listeners.forEach(cb => cb(theme)) }

  setupSystemThemeListener() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
        if (!localStorage.getItem('selected-theme')) {
          this.setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  }
}

export const themeService = new ThemeService()

class ToastService {
  constructor() {
    this.listeners = []
  }

  addListener(callback) { this.listeners.push(callback) }
  removeListener(callback) { this.listeners = this.listeners.filter(l => l !== callback) }
  
  success(message, duration = 4000) { this.show(message, 'success', duration) }
  error(message, duration = 5000) { this.show(message, 'error', duration) }
  warning(message, duration = 4000) { this.show(message, 'warning', duration) }
  info(message, duration = 4000) { this.show(message, 'info', duration) }

  show(message, type = 'success', duration = 4000) {
    const toast = {
      id: Date.now() + Math.random(),
      message, type, duration, visible: true
    }
    this.listeners.forEach(listener => listener(toast))
    return toast.id
  }
}

export const toastService = new ToastService()

export function generatePasswordRecoveryTemplate(recoveryLink, locale = 'hu', userFullName = '') {
  const templates = {
    hu: {
      subject: 'Jelszó visszaállítás kérése',
      greeting: userFullName ? `Kedves ${userFullName}!` : 'Kedves Felhasználó!',
      title: 'Jelszó visszaállítás',
      description: 'Jelszó visszaállítási kérelmet kaptunk a fiókodhoz. Ha te voltál, kattints az alábbi gombra:',
      buttonText: 'Jelszó visszaállítása',
      expiryInfo: 'Ez a link 24 órán belül lejár.',
      notYou: 'Ha nem te kérted ezt a változtatást, kérjük hagyd figyelmen kívül ezt az emailt.',
      footer: 'Üdvözlettel,<br>Czakó Orsolya'
    }
  }

  const content = templates[locale] || templates.hu
  
  return {
    subject: content.subject,
    html: `<!DOCTYPE html><html><head><title>${content.subject}</title></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><div style="background: #ec4899; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;"><h1>${content.title}</h1></div><div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;"><p>${content.greeting}</p><p>${content.description}</p><div style="text-align: center; margin: 30px 0;"><a href="${recoveryLink}" style="background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">${content.buttonText}</a></div><p style="background: #fff3cd; padding: 15px; border-radius: 5px; color: #856404;">${content.expiryInfo}</p><p>${content.notYou}</p><hr><p>${content.footer}</p></div></body></html>`,
    text: `${content.greeting}\n\n${content.title}\n\n${content.description}\n\n${content.buttonText}: ${recoveryLink}\n\n${content.expiryInfo}\n\n${content.notYou}\n\n${content.footer.replace('<br>', '\n')}`
  }
}

export const ThemePlugin = {
  install(app) {
    app.config.globalProperties.$theme = themeService
    app.provide('theme', themeService)
    themeService.init()
  }
}

export const ToastPlugin = {
  install(app) {
    app.config.globalProperties.$toast = toastService
    app.provide('toast', toastService)
  }
}

export default {
  apiCall,
  apiClient,
  aiService,
  userService,
  favoriteColorsService,
  authService,
  themeService,
  toastService,
  generatePasswordRecoveryTemplate,
  ThemePlugin,
  ToastPlugin
}