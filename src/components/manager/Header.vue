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
            <a-menu-item @click="goToFront">
              <HomeOutlined />
              回到前台
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
          <span class="user-name">{{ userName || 'A' }}</span>
        </div>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { UserOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import { userLogout } from '@/apis/authApi';
import { clearAuth, getUserInfo } from '@/utils/auth';
import { computed } from 'vue';

const router = useRouter();
const userInfo = computed(() => getUserInfo() || {});
const userName = computed(() => userInfo.value?.userName || '');

const goToProfile = () => {
  router.push({ name: 'personal' });
};

const goToFront = () => {
  router.push({ name: 'home' });
};

const logout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    async onOk() {
      try {
        await userLogout();
        
        clearAuth();
        
        message.success('已成功退出登录');
        
        window.location.href = '/login';
      } catch (error) {
        console.error('登出失败:', error);
        
        clearAuth();
        
        message.warning('登出接口调用失败，但已清除本地登录状态');
        window.location.href = '/login';
      }
    }
  });
};
</script>

<style scoped>
@import "../../assets/styles/manager/Header.css";
</style>