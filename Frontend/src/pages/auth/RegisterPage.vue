<template>
  <AuthLayout title="Regisztráció" container-class="register-container">
    <form novalidate @submit.prevent="handleSubmit">
      <FormInput id="username" v-model="form.username" label="Felhasználónév" type="text" :error="errors.username"
        @blur="validateField('username')" />

      <FormInput id="email" v-model="form.email" label="Email" type="email" :error="errors.email"
        @blur="validateField('email')" />

      <FormInput id="fullName" v-model="form.fullName" label="Teljes név" type="text" :error="errors.fullName"
        @blur="validateField('fullName')" />

      <FormInput id="password" v-model="form.password" label="Jelszó" type="password" :error="errors.password"
        @blur="validateField('password')" />

      <MessageDisplay :error-message="errorMessage" />

      <BaseButton type="submit" variant="primary" size="lg" full-width :loading="loading">
        Regisztráció
      </BaseButton>

      <BaseButton type="button" variant="ghost" size="md" full-width @click="goToLogin">
        Vissza a bejelentkezéshez
      </BaseButton>
    </form>
  </AuthLayout>
</template>

<script>
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { validateForm, fieldValidators, translateError } from '@/data/validation-messages.js'
import AuthLayout from '@/layouts/AuthLayout.vue'
import FormInput from '@/components/common/forms/FormInput.vue'
import MessageDisplay from '@/components/common/feedback/MessageDisplay.vue'
import BaseButton from '@/components/common/base/BaseButton.vue'

export default {
  name: 'RegisterView',
  components: {
    AuthLayout,
    FormInput,
    MessageDisplay,
    BaseButton
  },
  setup() {
    const { register, errorMessage, loading, withLoading, navigateToLogin, setError } = useAuth()

    const form = ref({ username: '', email: '', fullName: '', password: '' })
    const errors = reactive({})

    const rules = {
      username: 'username',
      email: 'email',
      fullName: 'fullName',
      password: 'password'
    }

    const validateField = (field) => {
      errors[field] = fieldValidators[rules[field]]?.(form.value[field]) || null
    }

    const handleSubmit = async () => {
      const result = validateForm(form.value, rules)
      Object.assign(errors, result.errors)

      if (!result.isValid) return

      await withLoading(async () => {
        const regResult = await register(form.value)
        if (regResult.success) {
          navigateToLogin({ registered: '1' })
        } else {
          setError(translateError(regResult.message))
        }
      })
    }

    return {
      form,
      errors,
      errorMessage,
      loading,
      handleSubmit,
      validateField,
      goToLogin: navigateToLogin
    }
  }
}
</script>

<style scoped>
/* Auth stílusok a main.js-ből jönnek */
</style>