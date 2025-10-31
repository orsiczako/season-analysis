<template>
  <div class="content-wrapper">
    <AnimatedBackground />
    <div class="header-controls">
      <ThemeSwitcher />
    </div>
    <div class="forgot-container">
      <h2>Elfelejtett jelszó</h2>
      <p class="description">Add meg az email címed és küldünk egy helyreállító linket.</p>
      <form @submit.prevent="handleSubmit">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="form.email" required placeholder="Email">
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success">{{ successMessage }}</div>
        <button type="submit" :disabled="loading">{{ loading ? 'Küldés...' : 'Link küldése' }}</button>
        <button type="button" @click="backToLogin" class="back-btn">Vissza a bejelentkezéshez</button>
      </form>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { authService, generatePasswordRecoveryTemplate } from '@/services'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'
import AnimatedBackground from '@/components/layout/AnimatedBackground.vue'
export default {
  name: 'ForgotPasswordView',
  components: { ThemeSwitcher, AnimatedBackground },
  setup() {
    const { errorMessage, successMessage, loading, validateForm, withLoading, navigateToLogin, setSuccess } = useAuth()
    const form = ref({ email: '' })
    const handleSubmit = async () => {
      if (!validateForm(form.value, ['email'])) return
      await withLoading(async () => {
        const recoveryLink = '{recoveryLink}'
        const emailTemplate = generatePasswordRecoveryTemplate(recoveryLink, 'hu', '{userFullName}')
        const result = await authService.forgotPassword(form.value.email, emailTemplate)
        if (result.success) {
          setSuccess('Email elküldve!')
          form.value.email = ''
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
.description { color: var(--text-secondary); text-align: center; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5; }
</style>