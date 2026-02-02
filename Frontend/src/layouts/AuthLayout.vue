<template>
  <div class="content-wrapper">
    <AnimatedBackground />

    <div v-if="backTo" class="header-back">
      <BaseBackButton :to="backTo" />
    </div>

    <div class="header-controls">
      <ThemeSwitcher />
    </div>

    <div :class="['auth-container', containerClass]">
      <h2>{{ title }}</h2>
      <p v-if="description" class="description">
        {{ description }}
      </p>
      <slot />
    </div>
  </div>
</template>

<script setup>
import AnimatedBackground from '@/layouts/AnimatedBackground.vue'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'
import BaseBackButton from '@/components/common/base/BaseBackButton.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  backTo: { type: String, default: '' },
  containerClass: { type: String, default: '' }
})
</script>

<style scoped>
.content-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-7);
  position: relative;
}

.header-controls {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  z-index: 100;
}

.header-back {
  position: fixed;
  top: var(--space-5);
  left: var(--space-6);
  z-index: 100;
}

.auth-container {
  position: relative;
  width: 100%;
  max-width: 620px;
  z-index: 1;
  padding: var(--space-8);
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(20px);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-container h2 {
  text-align: center;
  margin-bottom: var(--space-6);
  color: #3D3D3D;
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.theme-dark .auth-container h2 {
  color: #F5F5F5;
}

.description {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--space-6);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
}

/* Link stílusok */
.auth-container :deep(a) {
  color: var(--secondary-500);
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: color var(--transition-fast);
}

.auth-container :deep(a:hover) {
  color: var(--secondary-600);
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: var(--space-4);
  }

  .header-controls {
    top: var(--space-4);
    right: var(--space-4);
  }

  .header-back {
    top: var(--space-4);
    left: var(--space-4);
  }

  .auth-container {
    padding: var(--space-6);
    border-radius: var(--radius-lg);
  }

  .auth-container h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-5);
  }
}
</style>
