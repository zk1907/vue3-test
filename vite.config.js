import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:81', 
                changeOrigin: true
            },
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                math: "always", // 括号内才使用数学计算
                globalVars: {
                  // 全局变量
                    mainColor: "red",
                },
            },
        },
    },
})