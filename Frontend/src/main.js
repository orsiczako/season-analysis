import { createApp } from 'vue'
import App from './App.vue'

// Router
import router from '@/router'

// CSS importálása
import './assets/design-system.css'
import './assets/view-common.css'
import './assets/auth-common.css'

// Services - unified
import { ThemePlugin } from '@/services'

// Vue alkalmazás létrehozása
const app = createApp(App)
app.use(router)
app.use(ThemePlugin)
app.mount('#app')
