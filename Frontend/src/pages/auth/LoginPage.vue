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
        
        <div class="guest-section">
          <hr class="divider">
          <p class="guest-text">Nem szeretnél regisztrálni?</p>
          <button type="button" @click="goToGuestMode" class="guest-btn">
            Kipróbálás vendégként
          </button>
          <p class="guest-disclaimer">
            Vendég módban is beszélhetsz az AI-al.
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
    const router = useRouter()
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

    const goToGuestMode = () => {
      // Vendég módba lépés - meglévő chat oldalra irányítás guest paraméterrel
      router.push('/chat?guest=true')
    }

    return {
      form,
      errorMessage,
      successMessage,
      loading,
      handleSubmit,
      goToRegister,
      goToForgotPassword,
      goToGuestMode
    }
  }
}
</script>

<style scoped>
@import '@/assets/components/auth-common.css';

.guest-section {
  margin-top: 2rem;
  text-align: center;
}

.divider {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1.5rem 0;
  opacity: 0.3;
}

.guest-text {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.guest-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  width: 100%;
}

.guest-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.guest-disclaimer {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.4;
  margin-top: 0.5rem;
}
</style>
