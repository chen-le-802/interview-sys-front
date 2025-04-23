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
      path: '/admin/home',
      name: 'admin-home',
      component: () => import('@/components/manager/Layout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/manager/Dashboard.vue')
        },
        {
          path: 'question',
          name: 'question',
          component: () => import('@/views/manager/QuestionsManager.vue')
        },
        {
          path: 'questionbank',
          name: 'questionbank',
          component: () => import('@/views/manager/QuestionBanksManager.vue')
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/manager/UsersManager.vue')
        }
      ]
    },
    {
      path: '/personal',
      name: 'personal',
      component: () => import('@/views/PersonalCenter.vue'),
    },
  ],
})

export default router
