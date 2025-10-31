import { createApp } from 'vue'
import App from './App.vue'

// Router
import router from '@/router'

// CSS importálása
import './assets/design-system.css'
import './assets/styles.css'
import './assets/components/view-common.css'
import './assets/components/auth-common.css'

// Services - unified
import { themeService, ThemePlugin, ToastPlugin } from '@/services'

// Téma inicializálása
try {
  themeService.init()
} catch (error) {
  console.error('Theme initialization failed:', error)
}

// Vue alkalmazás létrehozása
console.log('Creating Vue app...')
const app = createApp(App)
console.log('Using router...')
app.use(router)
console.log('Using theme plugin...')
app.use(ThemePlugin)
console.log('Using toast plugin...')
app.use(ToastPlugin)
console.log('Mounting app...')
app.mount('#app')
console.log('App mounted successfully!')
