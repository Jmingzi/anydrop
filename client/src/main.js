import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:windi.css'
import { Server } from './lib/Server'

const server = new Server()

createApp(App).mount('#app')


