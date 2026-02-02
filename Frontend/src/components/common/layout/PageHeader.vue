<template>
  <header class="page-header">
    <div class="header-left">
      <slot name="left">
        <BaseBackButton v-if="backTo" :to="backTo" />
      </slot>
    </div>
    <div v-if="$slots.center" class="header-center">
      <slot name="center" />
    </div>
    <div class="header-right">
      <slot name="right">
        <ThemeSwitcher />
      </slot>
    </div>
  </header>
</template>

<script setup>
import { useSlots } from 'vue'
import BaseBackButton from '@/components/common/base/BaseBackButton.vue'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'

defineProps({ backTo: { type: String, default: '/dashboard' } })
const $slots = useSlots()
</script>

<style>
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-6);
  z-index: var(--z-fixed);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .page-header {
    padding: 0 var(--space-4);
  }
}
</style>
