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
    onBeforeMount(async () => {
      // 只有在非登录页面才进行初始认证检查，避免与登录流程冲突
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        await initialAuthCheck()
      }
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