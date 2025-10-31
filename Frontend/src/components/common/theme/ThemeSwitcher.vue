<template>
  <!-- Wrapper témaváltó gombnak, accessibility szempont is figyelembevéve (title, aria-label) -->
  <div class="theme-switcher">
    <button
      @click="toggleTheme"
      class="theme-btn"
      title="Téma váltás"
      aria-label="Téma váltás"
    >
    <!-- Ha világos -> napocska, ha sötét -> hold -->
      <svg
        v-if="currentTheme === 'light'"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="theme-icon"
      >
      <!--Forrás:https://cam.macfar.land/light-dark-css-theming/  -->
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="theme-icon"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  </div>
</template>

<script>
/** Itt importáljuk a téma szolgáltatást , már a servicesben létrehoztuk a függvényeket*/
import { themeService } from '@/services'

export default {
  name: 'ThemeSwitcher',
  data() {
    return {
      currentTheme: 'light'
    }
  },
  methods: {
    /**Itt vannak azok a függvények, amiket a komponens hívhat */
    /**Téma váltó függvény */
    toggleTheme() {
      themeService.toggleTheme()
    },
    /**Frissíti a currentTheme változót a szolgáltatásból */
    updateTheme() {
      this.currentTheme = themeService.getCurrentTheme()
    }
  },
  //DOM életciklus hook, elkészült a dom, hozzá lehet nyúlni az elemhez
  mounted() {
    // Kezdeti téma beállítása
    this.updateTheme()
    
    // Téma változások figyelése
    themeService.addThemeChangeListener(this.updateTheme)
  },
  beforeUnmount() {
    // Event listener eltávolítása
    themeService.removeThemeChangeListener(this.updateTheme)
  }
}
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
