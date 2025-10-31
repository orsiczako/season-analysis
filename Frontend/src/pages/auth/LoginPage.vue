<template>
  <div class="content-wrapper">
    <!-- Animált háttér komponens -->
    <AnimatedBackground />

    <!-- Fejléc komponensek -->
    <div class="header-controls">
      <ThemeSwitcher />
    </div>

    <!-- Bejelentkezési form -->
    <div class="login-container">
      <h2>Bejelentkezés</h2>
      <form @submit.prevent="handleSubmit">
        <label for="username">Felhasználónév</label>
        <input 
          type="text" 
          id="username" 
          v-model="form.username" 
          placeholder="Felhasználónév"
          autocomplete="username"
          required
        >
        
        <label for="password">Jelszó</label>
        <input 
          type="password" 
          id="password" 
          v-model="form.password" 
          placeholder="Jelszó"
          autocomplete="current-password"
          required
        >
        
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success">{{ successMessage }}</div>
        
        <button type="submit" :disabled="loading" @click="handleSubmit">
          {{ loading ? 'Bejelentkezés...' : 'Belépés' }}
        </button>
        
        <button type="button" @click="goToRegister">
          Regisztráció
        </button>
        
        <button type="button" @click="goToForgotPassword" class="forgot-password-btn">
          Elfelejtettem a jelszót
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
  import { useAuth } from '@/composables/useAuth.js'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'
import AnimatedBackground from '@/components/layout/AnimatedBackground.vue'

export default {
  name: 'LoginView',
  components: {
    ThemeSwitcher,
    AnimatedBackground
  },
  setup() {
    const route = useRoute()
    const { login, errorMessage, successMessage, loading, validateForm, withLoading, checkQueryMessages, navigateToRegister, navigateToForgotPassword, navigateToDashboard, setError } = useAuth()

    // Local form state
    const form = ref({
      username: '',
      password: ''
    })
    const errors = ref({})

    onMounted(() => {
      checkQueryMessages(route)
    })

    const handleSubmit = async () => {
      if (!validateForm(form.value, ['username', 'password'])) {
        return
      }

      await withLoading(async () => {
        const result = await login(form.value.username, form.value.password)

        if (result.success) {
          navigateToDashboard()
        } else {
          setError(result.message || 'auth.login_error')
        }
      })
    }

    const goToRegister = () => {
      navigateToRegister()
    }

    const goToForgotPassword = () => {
      navigateToForgotPassword()
    }

    return {
      form,
      errorMessage,
      successMessage,
      loading,
      handleSubmit,
      goToRegister,
      goToForgotPassword
    }
  }
}
</script>

<style scoped>
@import '@/assets/components/auth-common.css';
</style>
