<template>
  <div class="layout-container">
    <!-- 左侧导航 -->
    <div class="sidebar">
      <div class="header">
        <h1>面试斩刷题平台</h1>
      </div>
      <div class="nav-list">
        <router-link v-for="(nav, index) in navList" :key="index" :to="{ name: nav.key }"
          :class="{ 'active': currentNav === nav.key }">
          <component :is="nav.icon" class="icon" />
          {{ nav.label }}
        </router-link>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <Header />

      <!-- 动态内容 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute} from 'vue-router';
import { HomeOutlined, FileTextOutlined, FolderOutlined, UserOutlined} from '@ant-design/icons-vue';
import Header from './Header.vue';

const route = useRoute();
const currentNav = ref(route.name as string);

const navList = [
  { key: 'dashboard', label: '数据概览', icon: HomeOutlined },
  { key: 'question', label: '题目管理', icon: FileTextOutlined },
  { key: 'questionbank', label: '题库管理', icon: FolderOutlined },
  { key: 'user', label: '用户管理', icon: UserOutlined }
];

watch(
  () => route.name,
  (newName) => {
    currentNav.value = newName as string;
  }
);
</script>

<style scoped>
@import "../../assets/styles/manager/Layout.css";
</style>