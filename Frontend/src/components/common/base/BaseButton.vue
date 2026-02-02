<template>
  <component :is="tag" :type="nativeType" :disabled="disabled || loading" :class="buttonClasses" @click="handleClick">
    <span v-if="loading" class="btn-spinner" />
    <slot v-else />
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  tag: {
    type: String,
    default: 'button'
  },
  nativeType: {
    type: String,
    default: 'button'
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => [
  'base-btn',
  `base-btn--${props.variant}`,
  `base-btn--${props.size}`,
  {
    'base-btn--full': props.fullWidth,
    'base-btn--loading': props.loading,
    'base-btn--disabled': props.disabled
  }
])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  text-align: center;
  text-decoration: none;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  user-select: none;
}

.base-btn:focus {
  outline: none;
  box-shadow: var(--input-focus-shadow);
}

.base-btn:active:not(.base-btn--disabled):not(.base-btn--loading) {
  transform: scale(0.98);
}

.base-btn--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  min-height: var(--touch-target);
}

.base-btn--md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  min-height: var(--touch-target-comfortable);
}

.base-btn--lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
  min-height: 52px;
}

.base-btn--full {
  width: 100%;
}

/* Variants */
.base-btn--primary {
  background: var(--secondary-500);
  color: var(--text-inverse);
  border-color: var(--secondary-500);
  box-shadow: var(--shadow-sm);
}

.base-btn--primary:hover:not(.base-btn--disabled):not(.base-btn--loading) {
  background: var(--secondary-600);
  border-color: var(--secondary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.base-btn--secondary {
  background: transparent;
  color: var(--secondary-500);
  border-color: var(--secondary-500);
}

.base-btn--secondary:hover:not(.base-btn--disabled):not(.base-btn--loading) {
  background: var(--secondary-50);
  border-color: var(--secondary-600);
  color: var(--secondary-600);
}

.base-btn--ghost {
  background: transparent;
  color: var(--text-primary);
}

.base-btn--ghost:hover:not(.base-btn--disabled):not(.base-btn--loading) {
  background: var(--bg-tertiary);
}

.base-btn--danger {
  background: var(--error);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.base-btn--danger:hover:not(.base-btn--disabled):not(.base-btn--loading) {
  background: var(--error-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* States */
.base-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-btn--loading {
  cursor: wait;
  pointer-events: none;
}

/* Spinner */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
