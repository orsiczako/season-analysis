<template>
  <div class="dashboard-page">
    <!-- Header container-->
    <header class="page-header">
      <!-- Hamburger Menu és a User felhasználóneve-->
      <div class="header-left">
        <button class="menu-toggle" @click="toggleSidebar">
          <span class="hamburger-icon" />
        </button>
        <!--Kell a feltétel, hogy ne dobjon hibát -->
        <div v-if="user?.fullName" class="user-info">
          <span class="user-name">{{ user.fullName }}</span>
        </div>
      </div>

      <!--- Navigációs linkek csak desktopon -->
      <nav class="header-nav">
        <router-link to="/chat" class="nav-link">
          Színtípuselemzés
        </router-link>
        <router-link to="/skin-analysis" class="nav-link">
          Bőrelemzés
        </router-link>
        <router-link to="/results" class="nav-link">
          Eredményeim
        </router-link>
      </nav>

      <div class="header-right">
        <ThemeSwitcher />
      </div>
    </header>

    <!-- Csak akkor létezik a div, ha sidebarOpen true, ha kívülre kattint, bezáródik -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar" />
    <!--Maga a sidebar (:class = dinamikus osztály), ha nyitva van -> érvényes a CSS-->
    <aside class="side-navigation" :class="{ 'is-open': sidebarOpen }">
      <div class="nav-header">
        <div v-if="user" class="user-profile">
          <!--A usernek mini avatar a kezdőbetűjéből-->
          <div class="user-avatar">
            {{ ((user.fullName).charAt(0).toUpperCase()) }}
          </div>
          <div class="user-details">
            <div class="user-name">
              {{ user.fullName }}
            </div>
            <div class="user-email">
              {{ user.email }}
            </div>
          </div>
        </div>
        <button class="close-btn" @click="closeSidebar">
          ×
        </button>
      </div>

      <!--Kattintásra bezáródik a sidebar (ez mobilon fontos), amelyik url aktív (tehát, amin állunk), annak a színe más a sidebarban-->
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item" :class="{ 'is-active': $route.path === '/dashboard' }"
          @click="closeSidebar">
          <span class="nav-label">Kezdőlap</span>
        </router-link>

        <router-link to="/profile" class="nav-item" :class="{ 'is-active': $route.path === '/profile' }"
          @click="closeSidebar">
          <span class="nav-label">Profil</span>
        </router-link>

        <!-- Navigációs gombok csak mobilon (és desktopon is, ha a header-nav rejtve van) -->
        <div class="sidebar-mobile-links">
          <router-link to="/chat" class="nav-item" :class="{ 'is-active': $route.path === '/chat' }"
            @click="closeSidebar">
            <span class="nav-label">Színtípuselemzés</span>
          </router-link>
          <router-link to="/skin-analysis" class="nav-item" :class="{ 'is-active': $route.path === '/skin-analysis' }"
            @click="closeSidebar">
            <span class="nav-label">Bőrelemzés</span>
          </router-link>
          <router-link to="/results" class="nav-item" :class="{ 'is-active': $route.path === '/results' }"
            @click="closeSidebar">
            <span class="nav-label">Eredményeim</span>
          </router-link>
        </div>
      </nav>

      <div class="nav-footer">
        <button class="nav-item logout-btn" @click="handleLogout">
          <span class="nav-label">Kijelentkezés</span>
        </button>
      </div>
    </aside>

    <div class="scroll-container">
      <!-- A section teljesen kitölti az oldal magasságát -->
      <section class="fullscreen-section hero-section">
        <AnimatedBackground />
        <div class="section-content">
          <!--Az első section -->
          <div class="hero-wrapper">
            <!-- Szöveges tartalom -->
            <div class="hero-text">
              <!-- Hero Label, Title, Description, ezt dashboardContent.hero innen importáljuk  -->
              <span class="hero-label">{{ hero.label }}</span>
              <h1 class="hero-title">
                {{ hero.title }}
              </h1>
              <p class="hero-description">
                {{ hero.description }}
              </p>
              <p v-if="user" class="user-greeting">
                {{ hero.greeting }}, {{ user.fullName }}
              </p>
            </div>
          </div>

          <!-- Scroll jelzés -->
          <div class="scroll-indicator">
            <span class="scroll-text">Görgess</span>
            <span class="scroll-arrow-text">↓</span>
          </div>
        </div>
      </section>

      <!-- A dashboard-content modules tömbjén végigmegyünk, és egyesével mindnek létrehozzuk a sectiont -->
      <section v-for="(module, index) in modules" :key="module.id" class="fullscreen-section feature-section"
        @click="openModule(module.route)">
        <div class="section-content">
          <div class="feature-wrapper">
            <div class="section-number">
              <div class="number-line" />
              <span class="number-text">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>

            <div class="feature-main">
              <div class="feature-header">
                <h2 class="feature-title">
                  {{ module.title }}
                </h2>
                <span class="feature-badge">
                  {{ module.badge }}
                </span>
              </div>

              <p class="feature-subtitle">
                {{ module.subtitle }}
              </p>
              <p class="feature-description">
                {{ module.fullDescription }}
              </p>

              <ul v-if="module.features" class="feature-list">
                <li v-for="feature in module.features" :key="feature">
                  <span class="feature-check">✓</span>
                  <span>{{ feature }}</span>
                </li>
              </ul>

              <div class="feature-cta">
                <span class="cta-text">{{ module.ctaText }}</span>
                <span class="cta-arrow-text">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { dashboardContent } from '@/data/dashboard-content.js'

import AnimatedBackground from '@/layouts/AnimatedBackground.vue'
import ThemeSwitcher from '@/components/common/theme/ThemeSwitcher.vue'

const router = useRouter()
const { user, logout } = useAuth()

// Eleinte zárva van a sidebar
const sidebarOpen = ref(false)

// Dashboard szöveg
const hero = dashboardContent.hero
const modules = dashboardContent.modules

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
<style lang="scss">
@use '@/assets/mixins.scss' as *;

/* Ne lehessen jobbra görgetni (a blob miatt) */
html,
body {
  @include no-horizontal-scroll;
}

.dashboard-page {
  height: 100vh;
  @include no-horizontal-scroll;
  overflow-y: visible;
  position: relative;
}

/* Fullscreen Scroll Container - Scroll Snap */
.scroll-container {
  height: 100vh;
  overflow-x: hidden !important;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
}

/* Each Section Takes Full Viewport */
.fullscreen-section {
  @include fullscreen-section;
}

.section-content {
  @include content-container;
  z-index: 2;
}

.hero-section {
  background: transparent;
  position: relative;
}

.hero-wrapper {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--space-12);
  align-items: center;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-text {
  max-width: 700px;
}

.hero-label {
  @include uppercase-label;
  margin-bottom: var(--space-3);
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.hero-title {
  @include hero-title;
  margin-bottom: var(--space-4);
}

.hero-description {
  @include hero-description;
  margin-bottom: var(--space-6);
}

.user-greeting {
  @include outline-btn;
  box-shadow: none;
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.8s both;
}

/* Scroll Indicator */
.scroll-indicator {
  @include flex-col-center;
  position: absolute;
  bottom: -6em;
  left: 50%;
  transform: translateX(-50%);
  gap: var(--space-2);
  animation: bounce 2s ease-in-out infinite;
  /* Most már van definíciója! */
}

.scroll-text {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.scroll-arrow-text {
  color: var(--secondary-500);
  opacity: 0.7;
  font-size: var(--text-lg);
}

.feature-section {
  cursor: pointer;
  transition: background-color 0.5s ease;
  overflow: hidden;
}

.feature-wrapper {
  display: grid;
  grid-template-columns: 80px minmax(600px, 800px) 80rem;
  gap: var(--space-8);
  align-items: center;
  animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Section Number */
.section-number {
  @include flex-col-center;
  gap: var(--space-3);
  position: relative;
}

.number-line {
  width: 2px;
  height: 60px;
  background: linear-gradient(to bottom, transparent, var(--secondary-500), transparent);
  opacity: 0.5;
}

.number-text {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--secondary-500);
  opacity: 0.8;
  letter-spacing: -0.02em;
}

/* Feature Main Content */
.feature-main {
  @include glass-card;
  @include flex-col;
  gap: var(--space-4);
  max-width: 800px;
  padding: var(--space-8);
  position: relative;
  z-index: 2;
}

.feature-header {
  @include flex-center;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: flex-start;
}

.feature-title {
  @include page-title;
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin: 0;
}

.feature-badge {
  @include badge-outline;
}

.feature-subtitle {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
  opacity: 0.8;

  .theme-dark & {
    color: #F5F5F5;
  }
}

.feature-description {
  @include custom-scrollbar;
  font-size: var(--text-base);
  color: var(--text-secondary);
  /* A felesleges #3D3D3D sort töröltem */
  line-height: 1.6;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  padding-right: var(--space-2);
}

.theme-dark .feature-description {
  color: var(--text-secondary);
}

/* Feature List */
.feature-list {
  @include flex-col;
  list-style: none;
  padding: 0;
  margin: var(--space-3) 0 0;
  gap: var(--space-2);
}

.feature-list li {
  @include flex-center;
  gap: var(--space-2);
  justify-content: flex-start;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.feature-check {
  color: var(--secondary-500);
  font-weight: var(--font-bold);
  flex-shrink: 0;
}

/* Feature CTA */
.feature-cta {
  @include solid-cta-btn;
  margin-top: var(--space-3);
}

.feature-section:hover .feature-cta {
  gap: var(--space-4);
  background: #2D2D2D;

  .theme-dark & {
    background: #E5E5E5;
  }
}

.cta-text {
  line-height: 1;
}

.cta-arrow-text {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-block;
}

.feature-section:hover .cta-arrow-text {
  transform: translateX(4px);
}



@media (max-width: 1023px) {

  /* 1. A szekciók pontosan akkorák legyenek, mint a képernyő */
  .fullscreen-section {
    height: 100dvh;
    /* Dynamic viewport height */
    padding: 60px var(--space-3) var(--space-3);
    /* Kisebb padding, több hely a tartalomnak */
    align-items: center;
    overflow: hidden;
    /* Megakadályozzuk, hogy maga az oldal görgessen */
  }

  /* 2. A Wrapper töltse ki a helyet, de ne lógjon ki */
  .feature-wrapper {
    height: 100%;
    max-height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    /* Fontos! */
    gap: 0;
    /* A gap-et a kártyán belül kezeljük inkább */
  }

  /* A kártya */
  .feature-main {
    display: flex;
    /* Flexbox */
    flex-direction: column;
    width: 100%;
    /* A kártya maximum akkora lehet, amennyi hely van, mínusz egy kis margó */
    max-height: 100%;
    padding: var(--space-4);
    box-sizing: border-box;
    overflow: hidden;
    /* Hogy a belső scroll működjön */
  }

  /* 4. Fix elemek (Cím, Alcím, Badge) - NE görgessenek ki */
  .feature-header {
    flex-shrink: 0;
    /* Tilos összenyomni */
    margin-bottom: var(--space-2);
  }

  .feature-title {
    font-size: clamp(1.4rem, 6vw, 1.8rem);
    margin: 0;
  }

  .feature-subtitle {
    flex-shrink: 0;
    margin-bottom: var(--space-2);
    font-size: var(--text-sm);
  }

  /* 5. A LEÍRÁS - Ez az egyetlen, ami görgethető és rugalmas */
  .feature-description {
    flex-grow: 1;
    /* Kitölti az összes maradék helyet */
    flex-shrink: 1;
    /* Ha kell, összébb megy */
    overflow-y: auto;
    /* Csak ezen belül jelenjen meg a görgetősáv */
    min-height: 50px;
    /* Minimum magasság, hogy ne tűnjön el teljesen */
    margin-bottom: var(--space-2);
    padding-right: 5px;
    /* Hogy a scrollbar ne takarja a szöveget */
    font-size: var(--text-xs);
    /* Opcionális: Szebb scrollbar mobilon */
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
  }

  /* 6. Lista és Gomb - Mindig láthatóak maradnak alul */
  .feature-list {
    flex-shrink: 0;
    /* Tilos összenyomni */
    margin-top: 0;
    padding-bottom: var(--space-2);
  }

  .feature-list>li {
    font-size: var(--text-xs) !important;
    margin-bottom: 2px;
  }

  .feature-cta {
    flex-shrink: 0;
    /* A gomb sosem tűnhet el! */
    margin: 0 auto;
    font-size: var(--text-xs);
  }

  /* UI elemek rejtése */
  .scroll-indicator,
  .number-line,
  .number-text,
  .header-nav {
    display: none !important;
  }

  /* Hero Section igazítás */
  .hero-section {
    padding-top: 80px !important;
    /* Hely a fejlécnek */
    padding-bottom: 20px !important;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
    /* Fontos: ha a tartalom kicsi, legyen középen, ha nagy, induljon fentről */
    justify-content: center;
    height: 100dvh;
    overflow: hidden;
  }

  .hero-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Függőlegesen középre */
    align-items: center;
    text-align: center;
    width: 100%;
    height: 100%;
    /* Max height biztosítja, hogy ne lógjon ki */
    max-height: 100%;
    overflow: hidden;
  }

  .hero-text {
    width: 100%;
    /* Ez a kulcs: ha nem fér ki, akkor ITT görgessen, ne az oldalt tolja el */
    max-height: 100%;
    overflow-y: auto;
    padding: 0 5px;
    /* Kicsi padding a scrollbar miatt */
  }

  /* 2. Cím méretének drasztikus csökkentése mobilon */
  .hero-title {
    /* clamp(min, ideal, max) - lejjebb vettem a minimumot 2rem-re */
    font-size: clamp(2rem, 7vw, 3rem);
    line-height: 1.1;
    margin-bottom: var(--space-3);
  }

  .hero-label {
    font-size: 0.75rem;
    /* Kisebb címke */
    margin-bottom: var(--space-2);
  }

  .hero-description {
    font-size: 0.95rem;
    /* Kisebb leírás */
    line-height: 1.4;
    margin-bottom: var(--space-4);
  }

  /* Sidebar és Header igazítások */
  .side-navigation {
    width: 280px;
    left: -280px;
  }

  .sidebar-mobile-links {
    display: block;
  }

  .menu-toggle {
    min-width: 30px;
    min-height: 30px;
    padding: 5px;
  }

  .page-header {
    padding: 0 var(--space-3);
  }
}

@media (min-width: 1024px) and (max-width: 1200px) {

  /* A teljes szekció paddingjának csökkentése, hogy kiférjen */
  .fullscreen-section {
    padding: 80px var(--space-4) var(--space-4);
  }

  .section-content {
    max-width: 100%;
  }

  /* A Hero cím betűméretét kicsit visszavesszük tableten */
  .hero-title {
    font-size: clamp(3rem, 6vw, 5rem);
  }

  /* A legfontosabb: A Feature Wrapper Grid átméretezése */
  /* Eredetileg 80px + 600px + 80rem volt, ez túl széles iPadre. */
  .feature-wrapper {
    grid-template-columns: 50px 1fr;
    /* A 3. oszlopot (kép helye) elrejtjük vagy összenyomjuk */
    gap: var(--space-6);
  }

  /* A számjelzés kisebb legyen */
  .number-text {
    font-size: var(--text-xl);
  }

  .number-line {
    height: 40px;
  }

  /* A kártya töltsön ki mindent, ami maradt */
  .feature-main {
    max-width: 100%;
    padding: var(--space-6);
  }

}

/* Sidebar Navigation Styles */
.sidebar-overlay {
  @include sidebar-overlay;
}

.side-navigation {
  @include sidebar-panel;
}

.nav-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--border-primary);
  @include flex-center;
  justify-content: space-between;
  background: var(--bg-primary);
}

.user-profile {
  @include flex-center;
  gap: 0.75rem;
  flex: 1;
}

.user-avatar {
  @include avatar-wrapper(40px);
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

.user-details>.user-name {
  color: var(--text-primary);
}

.user-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
  @include text-ellipsis;
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.8rem;
  @include text-ellipsis;
}

.close-btn {
  @include icon-btn;
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
  @include nav-item;
}

.logout-btn {
  color: var(--error) !important;

  &:hover {
    background: var(--error-bg) !important;
    color: var(--error) !important;
  }
}

.nav-label {
  font-weight: 500;
}


/* PageHeader Styles */
.page-header {
  @include fixed-header;
}

.header-left {
  @include flex-center;
  gap: var(--space-3);
}

/**Hamburger Menü gomb */
.menu-toggle {
  @include icon-btn;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  min-width: var(--touch-target);
  min-height: var(--touch-target);

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary);
  }
}

/**Maguk a hamburger vonalak */
.hamburger-icon {
  @include hamburger-icon;
}

.user-info {
  @include user-info-badge;
}

.user-name {
  color: #ffffff;
  font-family: var(--type-ui-font);
  font-weight: var(--font-semibold);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.15em;

  .theme-dark & {
    color: #3D3D3D;
  }
}

.header-nav {
  display: none;
  @include flex-center;
  gap: var(--space-8);
}

.nav-link {
  @include header-nav-link;
}

.header-right {
  @include flex-center;
  gap: var(--space-2);
  z-index: 1001;
}
</style>