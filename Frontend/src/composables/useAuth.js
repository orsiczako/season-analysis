import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService, userService } from '@/services'
import { useFormValidation } from './useFormValidation'

// Állapot tárolása localStorage-ban, elmentve token és user adatokat
//JWT token tárolása, meg a felhasználó adatai
const token = ref(localStorage.getItem('authToken'))
const user = ref(JSON.parse(localStorage.getItem('authUser') || 'null'))

export function useAuth() {
  //navigációs eszköz
  const router = useRouter()
  const { validators } = useFormValidation()
  
  // van-e bejelentkezve
  const isAuthenticated = computed(() => !!token.value)
  const errorMessage = ref('')
  const successMessage = ref('')
  const loading = ref(false)

  
  const login = async (username, password) => {

    //Backend login hívás
    const result = await userService.login(username, password)
    
    //Ha sikeres, eltároljuk a token-t és user adatokat localStorage-ban és memóriában
    if (result.success && result.data?.token) {
      token.value = result.data.token
      user.value = result.data.user
      localStorage.setItem('authToken', result.data.token)
      localStorage.setItem('authUser', JSON.stringify(result.data.user))
      return { success: true }
    }

    //Ha nem sikeres, visszaadjuk az üzenetet
    return { success: false, message: result.message || 'auth.login_failed' }
  }

  //Kijelentkezéskor nulla értékre állítjuk a token-t és user-t, töröljük a localStorage-ból, és átirányítjuk a login oldalra
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    router.push('/login')
  }


  const register = async (userData) => {
    const result = await userService.register(userData)
    if (result.success) {
      return { success: true }
    }
    return { success: false, message: result.message || 'auth.registration_failed' }
  }

  const forgotPassword = async (email, emailTemplate) => {
    const result = await authService.forgotPassword(email, emailTemplate)
    if (result.success) {
      return { success: true }
    }
    return { success: false, message: result.message || 'auth.forgot_password_failed' }
  }

  const resetPassword = async (token, password) => {
    const result = await authService.resetPassword(token, password)
    if (result.success) {
      return { success: true }
    }
    return { success: false, message: result.message || 'auth.reset_password_failed' }
  }

  // Token érvényesség ellenőrzése
  const validateToken = () => {
    if (!token.value) return false
    
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const now = Date.now() / 1000
      
      //Ha lejárt, kijelentkeztetjük
      if (payload.exp && payload.exp < now) {
        logout()
        return false
      }
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  // Inicializálás: ellenőrizzük a token érvényességét
  const initAuth = () => {
    if (token.value && !validateToken()) {
      logout()
    }
  }

  // Üzenetkezelés
  const setError = (message) => {
    errorMessage.value = message
    successMessage.value = ''
  }

  const setSuccess = (message) => {
    successMessage.value = message
    errorMessage.value = ''
  }

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const setLoading = (value) => {
    loading.value = value
  }

  // Űrlap validációs segédfüggvények
  const validateForm = (form, requiredFields) => {
    for (const field of requiredFields) {
      const error = validators.required(form[field], field)
      if (error) {
        setError('auth.missing_fields')
        return false
      }
    }
    return true
  }

  const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      setError('auth.passwords_dont_match')
      return false
    }
    return true
  }

  /**Átveszünk egy aszinkron függvényt és kezeli a betöltési állapotot
   * tisztítja az üzeneteket, beállítja a loading állapotot, majd visszaállítja
   */
  const withLoading = async (asyncFn) => {
    clearMessages()
    setLoading(true)
    
    try {
      const result = await asyncFn()
      setLoading(false)
      return result
    } catch (error) {
      console.error('Auth error:', error)
      setError('common.server_error')
      setLoading(false)
      return { success: false, error }
    }
  }

  const handleApiResponse = (result, successMsg = null) => {
    if (result.success) {
      if (successMsg) setSuccess(successMsg)
      return true
    } else {
      setError(result.message || 'common.server_error')
      return false
    }
  }

  // Navigation helpers
  const navigateToLogin = (query = {}) => router.push({ path: '/login', query })
  const navigateToRegister = () => router.push('/register')
  const navigateToForgotPassword = () => router.push('/forgot-password')
  const navigateToDashboard = () => router.push('/dashboard')

  const checkQueryMessages = (route) => {
    if (route.query.registered) setSuccess('auth.registration_success')
    if (route.query.passwordReset) setSuccess('auth.password_reset_success')
  }

  return {
    
    token: computed(() => token.value),
    user: computed(() => user.value),
    isAuthenticated,
    errorMessage,
    successMessage,
    loading,

    // Auth methods
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    initAuth,

    // Form helpers
    validateForm,
    validatePasswordMatch,
    setError,
    setSuccess,
    clearMessages,
    setLoading,
    withLoading,
    handleApiResponse,
    checkQueryMessages,

    // Navigation
    navigateToLogin,
    navigateToRegister,
    navigateToForgotPassword,
    navigateToDashboard
  }
}