<template>
  <AuthLayout title="Elfelejtett jelszó" description="Adja meg az email címét a jelszó visszaállító link elküldéséhez."
    container-class="forgot-container">
    <form novalidate @submit.prevent="handleSubmit">
      <FormInput id="email" v-model="form.email" label="Email" type="email" placeholder="Email" :error="errors.email"
        @blur="validateField('email')" />

      <MessageDisplay :error-message="errorMessage" :success-message="successMessage" />

      <BaseButton type="submit" variant="primary" size="lg" full-width :loading="loading">
        Link küldése
      </BaseButton>

      <BaseButton type="button" variant="ghost" size="md" full-width @click="backToLogin">
        Vissza a bejelentkezéshez
      </BaseButton>
    </form>
  </AuthLayout>
</template>

<script>
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { userService, generatePasswordRecoveryTemplate } from '@/services'
import { validateForm, fieldValidators } from '@/data/validation-messages.js'
import AuthLayout from '@/layouts/AuthLayout.vue'
import FormInput from '@/components/common/forms/FormInput.vue'
import MessageDisplay from '@/components/common/feedback/MessageDisplay.vue'
import BaseButton from '@/components/common/base/BaseButton.vue'

export default {
  name: 'ForgotPasswordView',
  components: {
    AuthLayout,
    FormInput,
    MessageDisplay,
    BaseButton
  },
  setup() {
    const { errorMessage, successMessage, loading, withLoading, navigateToLogin, setSuccess } = useAuth()
    const form = ref({ email: '' })
    const errors = reactive({})

    const rules = { email: 'email' }

    const validateField = (field) => {
      errors[field] = fieldValidators[rules[field]]?.(form.value[field]) || null
    }

    const handleSubmit = async () => {
      const result = validateForm(form.value, rules)
      Object.assign(errors, result.errors)
      if (!result.isValid) return

      await withLoading(async () => {
        const recoveryLink = '{recoveryLink}'
        const emailTemplate = generatePasswordRecoveryTemplate(recoveryLink, 'hu', '{userFullName}')
        const apiResult = await userService.forgotPassword(form.value.email, emailTemplate)
        if (apiResult.success) {
          setSuccess('Email elküldve!')
          form.value.email = ''
          errors.email = null
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