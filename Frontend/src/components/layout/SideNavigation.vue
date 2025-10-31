<template>
  <div v-if="isOpen" class="sidebar-overlay" @click="$emit('close')"></div>
  <aside class="side-navigation" :class="{ 'is-open': isOpen }">
    <div class="nav-header">
      <div class="user-profile" v-if="user">
        <div class="user-avatar">{{ (user.fullName || user.username).charAt(0).toUpperCase() }}</div>
        <div class="user-details">
          <div class="user-name">{{ user.fullName || user.username }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
      </div>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>

    <nav class="nav-menu">
      <router-link
        to="/dashboard"
        class="nav-item"
        :class="{ 'is-active': $route.path === '/dashboard' }"
        @click="$emit('close')"
      >
        <span class="nav-label">Dashboard</span>
      </router-link>
      
      <router-link
        v-for="item in menuItems"
        :key="item.id"
        :to="item.route"
        class="nav-item"
        :class="{ 'is-active': $route.path === item.route }"
        @click="$emit('close')"
      >
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="nav-footer">
      <button @click="handleLogout" class="nav-item logout-btn">
        <span class="nav-label">Kijelentkezés</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'logout'])

const menuItems = computed(() => [
  {
    id: 'profile',
    route: '/profile',
    label: 'Profil'
  }
])

const handleLogout = () => {
  emit('logout')
  emit('close')
}
</script>

<style scoped lang="scss">
@import '@/assets/mixins.scss';

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  backdrop-filter: blur(2px);
}

.side-navigation {
  position: fixed;
  left: -300px;
  top: 0;
  bottom: 0;
  width: 300px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  @include flex-col;
  z-index: 1600;
  transition: left 0.3s ease;
  box-shadow: var(--shadow-lg);
}

.side-navigation.is-open {
  left: 0;
}

.nav-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--border-primary);
  @include flex-between;
  background: var(--bg-primary);
}

.user-profile {
  @include flex-center;
  gap: 0.75rem;
  flex: 1;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  @include flex-center;
  font-weight: 600;
  font-size: 1.1rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  @include flex-center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-menu {
  flex: 1;
  padding: 1.5rem 0;
}

.nav-footer {
  padding: 1rem 0;
  border-top: 1px solid var(--border-primary);
}

.nav-item {
  @include flex-center;
  justify-content: flex-start;
  padding: 1rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.is-active {
  background: var(--primary);
  color: white;
}

.logout-btn {
  color: var(--error) !important;
}

.logout-btn:hover {
  background: var(--error-bg) !important;
  color: var(--error) !important;
}

.nav-label {
  font-weight: 500;
}

@media (max-width: 768px) {
  .side-navigation {
    width: 280px;
    left: -280px;
  }
}
</style>