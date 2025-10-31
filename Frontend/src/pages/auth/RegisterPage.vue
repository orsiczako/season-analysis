<template>
  <div class="content-wrapper">
    <AnimatedBackground />
    <div class="header-controls">
      <ThemeSwitcher />
    </div>
    <div class="register-container">
      <h2>Regisztráció</h2>
      <form @submit.prevent="handleSubmit">
        <label for="username">Felhasználónév</label>
        <input type="text" id="username" v-model="form.username" required>
        <label for="email">Email</label>
        <input type="email" id="email" v-model="form.email" required>
        <label for="fullName">Teljes név</label>
        <input type="text" id="fullName" v-model="form.fullName" required>
        <label for="password">Jelszó</label>
        <input type="password" id="password" v-model="form.password" required>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <button type="submit" :disabled="loading">{{ loading ? 'Regisztráció...' : 'Regisztráció' }}</button>
        <button type="button" @click="goToLogin">Vissza a bejelentkezéshez</button>
      </form>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'
import AnimatedBackground from '@/components/layout/AnimatedBackground.vue'
export default {
  name: 'RegisterView',
  components: { ThemeSwitcher, AnimatedBackground },
  setup() {
    const { register, errorMessage, loading, validateForm, withLoading, navigateToLogin } = useAuth()
    const form = ref({ username: '', email: '', fullName: '', password: '' })
    const handleSubmit = async () => {
      if (!validateForm(form.value, ['username', 'email', 'fullName', 'password'])) return
      await withLoading(async () => {
        const result = await register(form.value)
        if (result.success) navigateToLogin({ registered: '1' })
      })
    }
    const goToLogin = () => navigateToLogin()
    return { form, errorMessage, loading, handleSubmit, goToLogin }
  }
}
</script>
<style scoped>
@import '@/assets/components/auth-common.css';
</style>