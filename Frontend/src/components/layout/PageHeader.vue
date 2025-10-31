<template>
  <header class="page-header">
    <!-- Bal felső sarok -->
    <div class="header-left">
      <!-- Dashboard mód: Hamburger + Név -->
      <template v-if="isDashboard">
        <button @click="$emit('toggle-sidebar')" class="menu-toggle">
          <span class="hamburger-icon">☰</span>
        </button>
        <div v-if="userName" class="user-info">
          <span class="user-name">{{ userName }}</span>
        </div>
      </template>
      
      <!-- Aloldal mód: Vissza gomb -->
      <button v-else @click="goBack" class="back-button">
        <span class="back-icon">←</span>
        Vissza
      </button>
    </div>

    <!-- Jobb felső sarok - Témaváltó -->
    <div class="header-right">
      <ThemeSwitcher />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'

const props = defineProps({
  // Dashboard mód (hamburger + név) vagy aloldal (vissza gomb)
  isDashboard: {
    type: Boolean,
    default: false
  },
  // Felhasználó neve (csak dashboard módban)
  userName: {
    type: String,
    default: ''
  },
  // Vissza gomb route (csak aloldal módban)
  backRoute: {
    type: String,
    default: '/dashboard'
  }
})
//Szól a szülőnek, hogy kattintottak a hamburgerre, a szülő eldönti mit kezd ezzel az infóval
//Jelen esetben a DashboardPage.vue fogja kezelni
const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()

const goBack = () => {
  router.push(props.backRoute)
}

</script>

<style scoped lang="scss">
@import '@/assets/mixins.scss';

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--header-bg);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--border-primary);
  @include flex-between;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: var(--shadow-md);
}

.header-left {
  @include flex-center;
  gap: 15px;
}

/* Dashboard mód - Hamburger */
.menu-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  @include flex-center;
  width: 40px;
  height: 40px;
}

.menu-toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary);
}

.hamburger-icon {
  font-size: 1.2rem;
  color: var(--text-primary);
}

/* Dashboard mód - User info */
.user-info {
  @include flex-center;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.user-name {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

/* Aloldal mód - Vissza gomb */
.back-button {
  @include flex-center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-secondary);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.back-button:hover {
  background: var(--bg-accent);
  border-color: var(--border-accent);
  transform: translateX(-2px);
}

.back-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.header-right {
  @include flex-center;
  gap: 10px;
  z-index: 1001;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 0 10px;
    height: 55px;
  }
  
  .back-button {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>