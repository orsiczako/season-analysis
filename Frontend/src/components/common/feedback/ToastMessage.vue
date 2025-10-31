

<template>
  <Transition name="toast">
    <!-- Vue beépített transition komponense 
     toast-message az az alapstílus, és a toast-${type} a típus szerinti stílus
     pl ha type= success akkor toast-success -->
    <div 
      v-if="visible" 
      :class="['toast-message', `toast-${type}`]"
      @click="hide"
    >
    <!-- Toast tartalom 
     Itt jelennek meg a toast üzenetek tartalmai 
     -->
      <div class="toast-content">
        <span class="toast-text">{{ message }}</span>
        <button @click="hide" class="toast-close">
          ×
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  /**Majd így lehet <ToastMessage message="Üzenet" /> */
  name: 'ToastMessage',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 4000
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  /**Automatikus eltüntetés */
  watch: {
    visible(newVal) {
      if (newVal && this.duration > 0) {
        setTimeout(() => {
          this.hide()
        }, this.duration)
      }
    }
  },
  methods: {
    hide() {
      this.$emit('hide')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/mixins.scss';
.toast-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
}

.toast-success {
  background: rgba(34, 197, 94, 0.95);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: white;
}

.toast-error {
  background: rgba(239, 68, 68, 0.95);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: white;
}

.toast-warning {
  background: rgba(245, 158, 11, 0.95);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: white;
}

.toast-info {
  background: rgba(59, 130, 246, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: white;
}

.toast-content {
  @include flex-between;
  padding: 1rem 1.25rem;
  gap: 0.75rem;
}

.toast-text {
  flex: 1;
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  width: 24px;
  height: 24px;
  @include flex-center;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

/* Transition animációk */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Dark mode támogatás */
[data-theme="dark"] .toast-message {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}



/* Responsive */
@media (max-width: 640px) {
  .toast-message {
    left: 10px;
    right: 10px;
    min-width: auto;
    max-width: none;
  }
}
</style>