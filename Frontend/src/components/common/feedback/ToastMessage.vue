<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast-message', `toast-${type}`]" @click="hide">
      <div class="toast-content">
        <span class="toast-text">{{ message }}</span>
        <button class="toast-close" @click="hide">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  message: { type: String, required: true },
  type: { type: String, default: 'success', validator: v => ['success', 'error', 'warning', 'info'].includes(v) },
  duration: { type: Number, default: 4000 },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['hide'])
const hide = () => emit('hide')

watch(() => props.visible, (val) => {
  if (val && props.duration > 0) setTimeout(hide, props.duration)
})
</script>

<style lang="scss" scoped>
@use '@/assets/mixins.scss' as *;

.toast-message {
  position: fixed;
  top: var(--space-5);
  right: var(--space-5);
  z-index: var(--z-tooltip);
  min-width: 300px;
  max-width: 500px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: var(--font-sans);
}

.toast-success {
  background: var(--success);
  border: 1px solid var(--success-dark);
  color: var(--text-inverse);
}

.toast-error {
  background: var(--error);
  border: 1px solid var(--error-dark);
  color: var(--text-inverse);
}

.toast-warning {
  background: var(--warning);
  border: 1px solid var(--warning-dark);
  color: var(--text-inverse);
}

.toast-info {
  background: var(--info);
  border: 1px solid var(--info-dark);
  color: var(--text-inverse);
}

.toast-content {
  @include flex-between;
  padding: var(--space-4) var(--space-5);
  gap: var(--space-3);
}

.toast-text {
  flex: 1;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.toast-close {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  opacity: 0.8;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
  font-size: 1.5rem;
  font-weight: var(--font-bold);
  line-height: 1;
  width: 24px;
  height: 24px;
  @include flex-center;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-base);
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

:global(.theme-dark) .toast-message {
  box-shadow: var(--shadow-xl);
}

@media (max-width: 640px) {
  .toast-message {
    left: var(--space-3);
    right: var(--space-3);
    min-width: auto;
    max-width: none;
  }
}
</style>
