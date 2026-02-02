<template>
  <div class="theme-switcher">
    <button @click="toggleTheme" class="theme-btn" title="Téma váltás" aria-label="Téma váltás">
      <Sun v-if="currentTheme === 'light'" :size="20" class="theme-icon" />
      <Moon v-else :size="20" class="theme-icon" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { themeService } from '@/services'
import { Sun, Moon } from 'lucide-vue-next'

const currentTheme = ref('light')

const toggleTheme = () => themeService.toggleTheme()
const updateTheme = () => { currentTheme.value = themeService.getCurrentTheme() }

onMounted(() => {
  updateTheme()
  themeService.addThemeChangeListener(updateTheme)
})

onBeforeUnmount(() => {
  themeService.removeThemeChangeListener(updateTheme)
})
</script>

<style scoped lang="scss">
@import '@/assets/mixins.scss';

.theme-switcher {
  @include flex-center;
}

.theme-btn {
  @include flex-center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-secondary);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 50%;
  cursor: pointer;
  @include transition-normal;
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--bg-accent);
    border-color: var(--border-accent);
    box-shadow: var(--shadow-md);
    @include hover-scale-small;
  }

  &:active {
    transform: scale(0.95);
  }
}

.theme-icon {
  @include transition-normal;

  .theme-btn:hover & {
    color: var(--text-accent);
  }
}

/* Animáció a témaváltáskor */
.theme-icon {
  animation: themeRotate 0.3s ease-in-out;
}

@keyframes themeRotate {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .theme-btn {
    width: 36px;
    height: 36px;
  }
  
  .theme-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
