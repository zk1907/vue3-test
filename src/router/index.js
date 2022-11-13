import { createRouter, createWebHashHistory } from "vue-router";
const routes= [
    { 
        path: '/', 
        redirect: '/11',
    },
    { 
        path: '/11', 
        component: () => import('../components/index.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router;