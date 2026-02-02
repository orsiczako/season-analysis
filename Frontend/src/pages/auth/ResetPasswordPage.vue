<template>
  <AuthLayout title="Jelszó visszaállítása" container-class="reset-container">
    <form novalidate @submit.prevent="handleSubmit">
      <FormInput id="password" v-model="form.password" label="Új jelszó" type="password" placeholder="Új jelszó"
        :error="errors.password" @blur="validateField('password')" />

      <FormInput id="confirmPassword" v-model="form.confirmPassword" label="Jelszó megerősítése" type="password"
        placeholder="Jelszó megerősítése" :error="errors.confirmPassword" @blur="validateField('confirmPassword')" />

      <MessageDisplay :error-message="errorMessage" :success-message="successMessage" />

      <BaseButton type="submit" variant="primary" size="lg" full-width :loading="loading">
        Jelszó beállítása
      </BaseButton>

      <BaseButton type="button" variant="ghost" size="md" full-width @click="backToLogin">
        Vissza a bejelentkezéshez
      </BaseButton>
    </form>
  </AuthLayout>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { userService } from '@/services'
import { useAuth } from '@/composables/useAuth.js'
import { validateForm, fieldValidators } from '@/data/validation-messages.js'
import AuthLayout from '@/layouts/AuthLayout.vue'
import FormInput from '@/components/common/forms/FormInput.vue'
import MessageDisplay from '@/components/common/feedback/MessageDisplay.vue'
import BaseButton from '@/components/common/base/BaseButton.vue'

export default {
  name: 'ResetPasswordView',
  components: {
    AuthLayout,
    FormInput,
    MessageDisplay,
    BaseButton
  },
  setup() {
    const route = useRoute()
    const { errorMessage, successMessage, loading, withLoading, navigateToLogin, setError, setSuccess } = useAuth()
    const form = ref({ password: '', confirmPassword: '' })
    const errors = reactive({})
    const token = ref(null)

    const rules = {
      password: 'password',
      confirmPassword: (value, formData) => fieldValidators.passwordConfirm(value, formData.password)
    }

    onMounted(() => {
      token.value = route.query.token
      if (!token.value) setError('Érvénytelen token')
    })

    const validateField = (field) => {
      const rule = rules[field]
      if (typeof rule === 'string') {
        errors[field] = fieldValidators[rule]?.(form.value[field]) || null
      } else if (typeof rule === 'function') {
        errors[field] = rule(form.value[field], form.value) || null
      }
    }

    const handleSubmit = async () => {
      // Validálás
      const result = validateForm(form.value, rules)
      Object.assign(errors, result.errors)
      if (!result.isValid) return

      if (!token.value) {
        setError('Érvénytelen token')
        return
      }

      await withLoading(async () => {
        const apiResult = await userService.resetPassword(token.value, form.value.password)
        if (apiResult.success) {
          setSuccess('Jelszó sikeresen megváltoztatva!')
          form.value.password = ''
          form.value.confirmPassword = ''
          setTimeout(() => navigateToLogin({ passwordReset: 'true' }), 3000)
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
      backToLogin: navigateToLogin
    }
  }
}
</script>

<style scoped>
/* Auth stílusok a main.js-ből jönnek */
</style>