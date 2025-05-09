<script setup>
// 1.1 引入Vditor 构造函数
import Vditor from 'vditor'
// 1.2 引入样式
import 'vditor/dist/index.css';
import { ref, onMounted } from 'vue';

// 2. 获取DOM引用
const vditor = ref()

// 3. 在组件初始化时，就创建Vditor对象，并引用
onMounted(() => {
    vditor.value = new Vditor('vditor', {
        height: '100%',
        width: '100%',
        placeholder: '欢迎发表友善的评论~（工具栏可以切换编辑模式哦）',
        mode: 'sv',
        preview: {
            actions: [] // 设置默认值
        }
    })

})

</script>

<template>
    <!-- 指定一个容器 -->
    <div id="vditor"></div>
</template>
<style scoped>
/* 适配部分使用 contenteditable 的情况 */
::v-deep [contenteditable="true"]:empty::before {
    font-size: 14px;
    color: #888;
}
</style>