<template>
  <div class="top-bar">
    <div class="logo">
      <img src="../../assets/images/common/logo.png">
    </div>
    <div class="user-info">
      <UserInfoDropDown />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserInfoDropDown from '@/components/UserInfoDropDown.vue'

</script>

<style scoped>
@import "../../assets/styles/manager/Header.css";
</style>