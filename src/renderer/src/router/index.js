import { createRouter, createWebHashHistory } from "vue-router";
let routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/index.vue')
    },
]
// 路由
const router = createRouter({
    history: createWebHashHistory(),
    routes
})
// 导出
export default router 