<template>
  <router-view></router-view>
</template>
<script lang="ts">
import { defineComponent, onBeforeMount } from 'vue'
import { initialAuthCheck } from '@/utils/auth'

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    // 在组件挂载前进行初始认证检查
    onBeforeMount(async () => {
      // 执行初始登录验证
      // 这会尝试从服务器获取当前用户信息，如果session有效会保存到localStorage
      await initialAuthCheck()
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