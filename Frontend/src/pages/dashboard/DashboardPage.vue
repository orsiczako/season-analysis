<template>
  <div class="dashboard-page">
    <AnimatedBackground />
    
    <!-- Header -->
    <PageHeader 
      :isDashboard="true" 
      :userName="user.fullName || user.username"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Sidebar Navigation (toggleable) -->
    <SideNavigation 
      :isOpen="sidebarOpen" 
      :user="user"
      @close="closeSidebar" 
      @logout="handleLogout"
    />

    <!-- Main content -->
    <main class="main-content">
      <div class="dashboard-container">
        <div class="welcome-section">
          <h1 class="app-title">Színanalízis</h1>
          <p class="app-description">Találd ki AI segítségével, hogy melyik színtípusba tartozol!</p>
          <p v-if="user" class="user-greeting">Üdvözöljük, {{ user.fullName || user.username }}!</p>
        </div>

        <div class="features-grid">
          <div
            v-for="module in modules"
            :key="module.id"
            class="feature-card"
            :class="[`feature-card--${module.category}`]"
            @click="openModule(module.route)"
          >
            <div class="feature-card__header">
              <img :src="module.icon" :alt="module.title" class="feature-card__icon" />
              <div class="feature-card__badge">Tanácsadás</div>
            </div>
            
            <div class="feature-card__content">
              <h3 class="feature-card__title">{{ module.title }}</h3>
              <p class="feature-card__subtitle">{{ module.subtitle }}</p>
              <p class="feature-card__description">{{ module.description }}</p>
            </div>
            
            <div class="feature-card__footer">
              <span class="feature-card__cta">Indítás →</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

// Components
import AnimatedBackground from '@/components/layout/AnimatedBackground.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'

// Auth and router
const router = useRouter()
const { user, logout } = useAuth()

// Sidebar state
const sidebarOpen = ref(false)

// Module data
const modules = computed(() => [
  {
    id: 'ai-chat',
    route: '/chat',
    icon: '/media/ai.png',
    title: 'AI Színtanácsadó',
    description: 'Beszélgess az AI-al és fedezd fel a hozzád illő színeket',
    subtitle: 'Személyre szabott színtanácsadás chatbot segítségével',
    category: 'consultation'
  }
])

// Methods
const openModule = (route) => {
  router.push(route)
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const handleLogout = () => {
  logout()
}
</script>

<style scoped lang="scss">
@import '@/assets/mixins.scss';
@import '@/assets/components/view-common.css';

.dashboard-page {
  min-height: 100vh;
  position: relative;
}

.main-content {
  margin-top: 60px;
  padding: 30px 20px 80px 20px;
  position: relative;
  z-index: 10;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  @include text-center;
  margin-bottom: 3rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.app-description {
  font-size: 1.3rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.user-greeting {
  font-size: 1.5rem;
  margin-top: 1rem;
  color: var(--primary);
  font-weight: 500;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  @include card-base;
  @include card-padding;
  cursor: pointer;
  min-height: 280px;
  @include flex-col;
  position: relative;
  overflow: hidden;
  
  &:hover {
    @include hover-lift;
    border-color: var(--primary);
  }
}

.feature-card--consultation {
  background: var(--card-bg);
  color: var(--text-primary);
  border-color: var(--card-border);
  
  .feature-card__badge {
    background: var(--primary);
    color: white;
  }
}

.feature-card__header {
  @include flex-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.feature-card__icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.feature-card__badge {
  background: var(--primary);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-card__content {
  flex: 1;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.feature-card__title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  line-height: 1.2;
}

.feature-card__subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.feature-card__description {
  font-size: 1rem;
  opacity: 0.8;
  line-height: 1.5;
}

.feature-card__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  z-index: 2;
}

.feature-card__cta {
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.3s ease;
  opacity: 0.9;
}

@media (max-width: 1200px) {
  .main-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 15px 70px 15px;
    margin-left: 0;
  }
  
  .welcome-section {
    margin-bottom: 2rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .app-description {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    min-height: 250px;
    padding: 1.5rem;
  }

  .feature-card__icon {
    width: 60px;
    height: 60px;
  }

  .feature-card__title {
    font-size: 1.6rem;
  }
}
</style>
