<template>
  <div class="form-group" :class="{ 'has-error': error }">
    <label v-if="label" :for="id">{{ label }}</label>
    <input :type="type" :id="id" :placeholder="placeholder" :disabled="disabled" :autocomplete="autocomplete"
      :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')" class="input"
      :class="{ 'input-error': error }">
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue', 'blur'])
</script>

<style scoped lang="scss">
@use '@/assets/mixins.scss' as *;

.form-group {
  margin-bottom: var(--space-5);

  label {
    @include label-style;
    display: block;
    margin-bottom: var(--space-2);
    color: #3D3D3D;
  }
}

.theme-dark .form-group label {
  color: #F5F5F5;
}

.form-group .input {
  @include input-field;
  padding: 14px 16px;
}

/* Error states */
.form-group .input-error {
  border-color: var(--error);

  &:focus {
    border-color: var(--error);
    box-shadow: 0 0 0 3px var(--error-light);
  }
}

.error-message {
  display: block;
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--error);
  line-height: var(--leading-normal);
}

.has-error label {
  color: var(--error);
}
</style>
