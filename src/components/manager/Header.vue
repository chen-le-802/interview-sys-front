<template>
  <div class="top-bar">
    <div class="logo">
      <img src="../../assets/images/common/logo.png">
    </div>
    <div class="user-info">
      <a-dropdown :trigger="['hover']" overlayClassName="custom-dropdown">
        <template #overlay>
          <a-menu>
            <a-menu-item @click="goToProfile">
              <UserOutlined />
              个人中心
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item @click="logout" style="color: #cd1e27;">
              <LogoutOutlined />
              退出登录
            </a-menu-item>
          </a-menu>
        </template>
        <div class="user-dropdown">
          <a-avatar />
          <span class="user-name">A</span>
        </div>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons-vue';

const router = useRouter();

const goToProfile = () => {
  router.push({ name: 'personal' });
};

const logout = () => {
  console.log('退出登录');
  router.push({ name: 'login' });
};
</script>

<style scoped>
@import "../../assets/styles/manager/Header.css";
</style>