<template>
    <div class="bank-icon-container"
        :class="{ 'small': size === 'small', 'medium': size === 'medium', 'large': size === 'large' }">
        <img :src="iconSrc" :alt="name || '题库图标'" class="bank-icon" @error="handleIconError" />
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

interface Props {
    name?: string;
    iconName?: string;
    size?: 'small' | 'medium' | 'large'; 
    customIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    iconName: 'default',
    size: 'medium',
    customIcon: ''
});

// 图标映射
const ICON_MAP: Record<string, string> = {
    'default': '/src/assets/images/icon/default.png',
    'database': '/src/assets/images/icon/数据库.png',
    'network': '/src/assets/images/icon/计算机网络.png',
    'os': '/src/assets/images/icon/操作系统.png',
    'java': '/src/assets/images/icon/java.png',
    'distributed': '/src/assets/images/icon/分布式系统.png',
    'algorithm': '/src/assets/images/icon/算法.png',
    'o&m': '/src/assets/images/icon/系统运维.png',
    'Android': '/src/assets/images/icon/Android.png',
    'C++': '/src/assets/images/icon/C++.png',
    'css': '/src/assets/images/icon/css.png',
    'html': '/src/assets/images/icon/html.png',
    'javascript': '/src/assets/images/icon/JavaScript.png',
    'typescript': '/src/assets/images/icon/typescript.png',
    'python': '/src/assets/images/icon/Python.png',
    'react': '/src/assets/images/icon/React.png',
    'vue': '/src/assets/images/icon/Vue.png',
    'webpack': '/src/assets/images/icon/Webpack.png',
    'spring': '/src/assets/images/icon/spring.png',
    'springboot': '/src/assets/images/icon/SPRINGBOOT.png',
    'springcloud': '/src/assets/images/icon/SPRINGCLOUD.png',
    'mybatis': '/src/assets/images/icon/mybatis.png',
    'mysql': '/src/assets/images/icon/MySQL.png',
    'redis': '/src/assets/images/icon/Redis.png',
    'docker': '/src/assets/images/icon/Docker.png',
    'linux': '/src/assets/images/icon/linux.png',
    'go': '/src/assets/images/icon/GO.png',
    'elastic': '/src/assets/images/icon/Elastic.png',

};

const hasError = ref(false);

const iconSrc = computed(() => {
    if (hasError.value) {
        return ICON_MAP['default'];
    }

    if (props.customIcon) {
        return props.customIcon;
    }

    if (props.iconName && ICON_MAP[props.iconName]) {
        return ICON_MAP[props.iconName];
    }

    return ICON_MAP['default'];
});

const handleIconError = () => {
    console.warn(`图标加载失败: ${iconSrc.value}`);
    hasError.value = true;
};
</script>

<style scoped>
@import '@/assets/styles/BankIcon.css';
</style>