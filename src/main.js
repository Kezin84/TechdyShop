import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import intersect from './directives/intersect.js' // ✅ import đúng

const app = createApp(App)

app.directive('intersect', intersect) // ✅ ĐĂNG KÝ CHÍNH XÁC Ở ĐÂY

app.use(router)
app.use(createPinia())
app.mount('#app')
