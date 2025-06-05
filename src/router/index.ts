import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, isAdmin } from '@/utils/auth'
import { ElMessage } from 'element-plus'

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
      meta: { allowAnyState: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { allowAnyState: true },
    },
    {
      path: '/banks',
      name: 'banks',
      component: () => import('@/views/frontend/Banks.vue'),
    },
    {
      path: '/bank/:id',
      name: 'bank',
      component: () => import('@/views/frontend/Bank.vue'),
    },
    {
      path: '/roadmaps',
      name: 'roadmaps',
      component: () => import('@/views/frontend/Roadmaps.vue'),
    },
    {
      path: '/roadmap',
      name: 'roadmap',
      component: () => import('@/views/frontend/Roadmap.vue'),
    },
    {
      path: '/admin/home',
      name: 'admin-home',
      component: () => import('@/components/manager/Layout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/manager/Dashboard.vue'),
        },
        {
          path: 'questionManager',
          name: 'questionManager',
          component: () => import('@/views/manager/QuestionsManager.vue'),
        },
        {
          path: 'questionbank',
          name: 'questionbank',
          component: () => import('@/views/manager/QuestionBanksManager.vue'),
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/manager/UsersManager.vue'),
        },
      ],
    },
    {
      path: '/personal',
      name: 'personal',
      component: () => import('@/views/PersonalCenter.vue'),
    },
    {
      path: '/category',
      name: 'category',
      component: () => import('@/views/frontend/Category.vue'),
    },
    {
      path: '/question',
      name: 'question',
      component: () => import('@/views/frontend/Question.vue'),
    },
    {
      path: '/ai-interview',
      name: 'ai-interview',
      component: () => import('@/views/frontend/AiInterview.vue'),
    },
    {
      path: '/daily-list',
      name: 'daily-list',
      component: () => import('@/views/frontend/DailyList.vue'),
    },
    {
      path: '/rank-list',
      name: 'rank-list',
      component: () => import('@/views/frontend/RankListView.vue'),
    },
    {
      path:'/error-notebook',
      name:'error-notebook',
      component: () => import('@/views/frontend/ErrorNoteBook.vue'),
    },
    {
      path:'/exam',
      name:'exam',
      component: () => import('@/views/frontend/Exam.vue'),
    }
  ],
  // 添加滚动行为配置
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', from.path, '->', to.path)

  // 始终允许访问登录和注册页面
  const isPublicPage = to.matched.some((record) => record.meta.allowAnyState)
  if (isPublicPage) {
    return next()
  }

  // 检查是否需要管理员权限
  const adminRequired = to.matched.some((record) => record.meta.requiresAdmin)

  // 需要认证且未登录
  if (!isAuthenticated() && to.path !== '/') {
    ElMessage.warning('请先登录')
    return next('/login')
  }

  // 需要管理员权限但不是管理员
  if (adminRequired && !isAdmin()) {
    ElMessage.error('无权访问此页面')
    return next('/')
  }

  // 默认放行
  next()
})

export default router