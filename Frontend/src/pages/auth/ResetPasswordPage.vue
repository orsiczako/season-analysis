<template>
  <div class="content-wrapper">
    <AnimatedBackground />
    <div class="header-controls">
      <ThemeSwitcher />
    </div>
    <div class="reset-container">
      <h2>Jelszó visszaállítása</h2>
      <form @submit.prevent="handleSubmit">
        <label for="password">Új jelszó</label>
        <input type="password" id="password" v-model="form.password" required placeholder="Új jelszó">
        <label for="confirmPassword">Jelszó megerősítése</label>
        <input type="password" id="confirmPassword" v-model="form.confirmPassword" required placeholder="Jelszó megerősítése">
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success">{{ successMessage }}</div>
        <button type="submit" :disabled="loading">{{ loading ? 'Mentés...' : 'Jelszó beállítása' }}</button>
        <button type="button" @click="backToLogin" class="back-btn">Vissza a bejelentkezéshez</button>
      </form>
    </div>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '@/services'
import { useAuth } from '@/composables/useAuth.js'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'
import AnimatedBackground from '@/components/layout/AnimatedBackground.vue'
export default {
  name: 'ResetPasswordView',
  components: { ThemeSwitcher, AnimatedBackground },
  setup() {
    const route = useRoute()
    const { errorMessage, successMessage, loading, validateForm, withLoading, navigateToLogin, setError, setSuccess } = useAuth()
    const form = ref({ password: '', confirmPassword: '' })
    const token = ref(null)
    onMounted(() => {
      token.value = route.query.token
      if (!token.value) setError('Érvénytelen token')
    })
    const handleSubmit = async () => {
      if (!validateForm(form.value, ['password', 'confirmPassword'])) return
      if (form.value.password !== form.value.confirmPassword) {
        setError('A jelszavak nem egyeznek')
        return
      }
      if (!token.value) {
        setError('Érvénytelen token')
        return
      }
      await withLoading(async () => {
        const result = await authService.resetPassword(token.value, form.value.password)
        if (result.success) {
          setSuccess('Jelszó sikeresen megváltoztatva!')
          form.value.password = ''
          form.value.confirmPassword = ''
          setTimeout(() => navigateToLogin({ passwordReset: 'true' }), 3000)
        }
      })
    }
    const backToLogin = () => navigateToLogin()
    return { form, errorMessage, successMessage, loading, handleSubmit, backToLogin }
  }
}
</script>
<style scoped>
@import '@/assets/components/auth-common.css';
</style>