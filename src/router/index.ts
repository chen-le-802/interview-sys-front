import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/frontend/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/banks',
      name: 'banks',
      component: () => import('@/views/frontend/Banks.vue'),
    },
    {
      path: '/bank',
      name: 'bank',
      component: () => import('@/views/frontend/Bank.vue'),
    },
  ],
})

export default router
