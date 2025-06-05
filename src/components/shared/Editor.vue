<script setup lang="ts">
// 1.1 引入Vditor 构造函数
import Vditor from 'vditor'
// 1.2 引入样式
import 'vditor/dist/index.css';
import { ref, onMounted } from 'vue';

// 2. 获取DOM引用
const vditor = ref()
const contentValue = ref('');

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
// 暴露获取内容的方法
const getContent = () => {
    return contentValue.value || vditor.value?.getValue?.() || '';
};

// 暴露设置内容的方法（用于清空）
const setContent = (value: string) => {
    if (vditor.value) {
        vditor.value.setValue(value);
    }
    contentValue.value = value;
};

// 暴露方法给父组件
defineExpose({
    getContent,
    setContent
});
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