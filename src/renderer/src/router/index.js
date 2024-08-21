import { createRouter, createWebHistory } from "vue-router";
let routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/index.vue')
    },
]
// 路由
const router = createRouter({
    history: createWebHistory(),
    routes
})
// 导出
export default router 