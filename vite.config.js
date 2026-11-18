import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {VitePWA} from 'vite-plugin-pwa'
import { register } from 'node:module'
import { initAccordions } from 'flowbite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest:{
        name: 'PWA PROYECTO ESCUELA',
        short_name: 'PPE',
        description:'Aplicacion web progresiva hecha en la uni',
        start_url:'/',
        display:'standalone',
        background_color:'#ffff',
        theme_color: '#43916a',
        icons:[{
          src:'/images/iconos/CORVETTE.jpg',
          sizes:'128x128',
          type:'image/jpg'
        },
        {
          src:'/images/iconos/CHEVY.png',
          sizes:'512x512',
          type:'image/png'
        }
      
      ]




      }
}),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
