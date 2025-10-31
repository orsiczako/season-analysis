import { ref } from 'vue'

export function useFormValidation() {
  const errors = ref({})

  const validators = {
    required: (value, fieldName) => {
      if (!value || value.toString().trim() === '') {
        return `${fieldName} mező kötelező`
      }
      return null
    }
  }

  return {
    validators
  }
}
