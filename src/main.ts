import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/reset.css'
import 'ant-design-vue/dist/reset.css'
import { RollbackOutlined } from '@ant-design/icons-vue';

const app = createApp(App)

app.component('RollbackOutlined', RollbackOutlined);

app.use(createPinia())
app.use(router)

app.mount('#app')
