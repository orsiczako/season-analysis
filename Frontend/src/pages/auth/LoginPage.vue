<template>
  <AuthLayout title="Bejelentkezés" container-class="login-container">
    <form novalidate @submit.prevent="handleSubmit">
      <FormInput id="username" v-model="form.username" label="Felhasználónév" type="text" placeholder="Felhasználónév"
        autocomplete="username" :error="errors.username" @blur="validateField('username')" />

      <FormInput id="password" v-model="form.password" label="Jelszó" type="password" placeholder="Jelszó"
        autocomplete="current-password" :error="errors.password" @blur="validateField('password')" />

      <MessageDisplay :error-message="errorMessage" :success-message="successMessage" />

      <BaseButton type="submit" variant="primary" size="lg" full-width :loading="loading">
        Belépés
      </BaseButton>

      <BaseButton type="button" variant="secondary" size="md" full-width @click="goToRegister">
        Regisztráció
      </BaseButton>

      <BaseButton type="button" variant="secondary" size="md" full-width @click="goToForgotPassword">
        Elfelejtettem a jelszót
      </BaseButton>
    </form>
  </AuthLayout>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { validateForm, fieldValidators, translateError } from '@/data/validation-messages.js'
import AuthLayout from '@/layouts/AuthLayout.vue'
import FormInput from '@/components/common/forms/FormInput.vue'
import MessageDisplay from '@/components/common/feedback/MessageDisplay.vue'
import BaseButton from '@/components/common/base/BaseButton.vue'

export default {
  name: 'LoginView',
  components: {
    AuthLayout,
    FormInput,
    MessageDisplay,
    BaseButton
  },
  setup() {
    const route = useRoute()
    const { login, errorMessage, successMessage, loading, withLoading, checkQueryMessages, navigateToRegister, navigateToForgotPassword, navigateToDashboard, setError } = useAuth()

    const form = ref({
      username: '',
      password: ''
    })
    const errors = reactive({})

    // Validációs szabályok
    const rules = {
      username: 'required',
      password: 'required'
    }

    onMounted(() => {
      checkQueryMessages(route)
    })

    const validateField = (field) => {
      const validator = rules[field]
      if (typeof validator === 'string') {
        errors[field] = fieldValidators[validator]?.(form.value[field]) || null
      }
    }

    const handleSubmit = async () => {
      // Validálás
      const result = validateForm(form.value, rules)
      Object.assign(errors, result.errors)

      // Ha van hiba, nem küldünk
      if (!result.isValid) return

      await withLoading(async () => {
        const loginResult = await login(form.value.username, form.value.password)

        if (loginResult.success) {
          navigateToDashboard()
        } else {
          setError(translateError(loginResult.message))
        }
      })
    }

    return {
      form,
      errors,
      errorMessage,
      successMessage,
      loading,
      handleSubmit,
      validateField,
      goToRegister: navigateToRegister,
      goToForgotPassword: navigateToForgotPassword,
    }
  }
}
</script>

<style scoped>
/* Auth stílusok a main.js-ből jönnek */
</style>
