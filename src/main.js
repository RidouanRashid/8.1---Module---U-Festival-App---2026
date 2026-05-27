import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import { setupI18n } from './locales/index.js'
import './style.css'

const i18n = await setupI18n()
const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
