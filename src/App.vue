<template>
  <router-view></router-view>
</template>
<script lang="ts">
import { defineComponent, onBeforeMount } from 'vue'
import router from './router'
import { initialAuthCheck, verifyAuthStatus } from '@/utils/auth'

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    // 在组件挂载前验证登录状态
    onBeforeMount(async () => {
      // 执行初始登录验证
      await initialAuthCheck()
      
      // 监听路由变化，在进入受保护路由前验证登录状态
      router.beforeEach(async (to, from, next) => {
        // 定义需要登录的路由
        const protectedRoutes = ['/personal', '/admin']
        
        // 检查当前路由是否需要登录验证
        const requiresAuth = protectedRoutes.some(path => to.path.startsWith(path))
        
        if (requiresAuth) {
          // 验证登录状态
          const isAuthenticated = await verifyAuthStatus()
          
          if (!isAuthenticated) {
            // 如果未登录，重定向到登录页
            ElMessage.warning('请先登录')
            next('/login')
            return
          }
        }
        
        // 继续导航
        next()
      })
    })

    return {}
  }
})
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #eef2ff;
}
</style>