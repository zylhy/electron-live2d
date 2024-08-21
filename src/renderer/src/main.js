import { createApp } from 'vue'
import './assets/css/base.scss'
import router from "./router/index.js";
import App from './App.vue'
createApp(App).use(router).mount('#app')
