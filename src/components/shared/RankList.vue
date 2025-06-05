<template>
    <div class="hot-questions" :style="{ width: width + 'px' }">
        <!-- 标题栏 -->
        <div class="header">
            <h3>{{ listTitle }}</h3>
            <div class="more" @click="showMore">更多</div>
        </div>

        <!-- 列表 -->
        <div class="question-list">
            <div v-for="(item, index) in content" :key="index" class="question-item" @click="router.push('/question')">
                <div class="content">
                    <span class="title">{{ item.title }}</span>
                </div>
                <div class="heat">
                    <el-icon class="heat-icon">
                        <Star />
                    </el-icon>
                    <span class="heat-value">{{ formatNumber(item.heat) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Star } from '@element-plus/icons-vue'

// 声明props
const props = defineProps<{
    listTitle: string,
    width?: number
}>()
const router = useRouter()
const width = ref(props.width || 280)

// mock数据
const hotQuestions = [
    { title: 'Vue3的响应式原理是什么？', heat: 1200 },
    { title: 'JavaScript中的闭包是如何工作的？', heat: 950 },
    { title: 'CSS Flexbox布局的主要特点是什么？', heat: 800 },
    { title: '如何优化前端性能？', heat: 700 },
    { title: 'React中的Hooks有什么优势？', heat: 650 },
    { title: 'TypeScript与JavaScript的区别是什么？', heat: 600 },
    { title: '前端安全有哪些常见问题？', heat: 550 },
    { title: '如何处理跨域请求？', heat: 500 }
]
const hotTags = [
    { title: 'Vue', heat: 2000 },
    { title: 'JavaScript', heat: 1800 },
    { title: 'React', heat: 1600 },
    { title: 'TypeScript', heat: 1500 },
    { title: 'CSS', heat: 1400 },
    { title: 'HTML', heat: 1300 },
    { title: 'Node.js', heat: 1200 },
    { title: '前端安全', heat: 1100 }
]

// 格式化数字
const formatNumber = (num: number) => num.toLocaleString()

const content = ref<{ title: string, heat: number }[]>([])

const updateContent = () => {
    if (props.listTitle.includes('题目')) {
        content.value = hotQuestions
    } else if (props.listTitle.includes('标签')) {
        content.value = hotTags
    } else {
        content.value = []
    }
}

watch(() => props.listTitle, updateContent, { immediate: true })
onMounted(updateContent)

const showMore = () => {
    router.push('/rank-list')
}
</script>


<style scoped>
.hot-questions {

    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: linear-gradient(to bottom, #a2a9f3, #d0e8f7);
    border-radius: 8px 8px 0 0;
}

.header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.more {
    color: #409eff;
    font-size: 14px;
    cursor: pointer;
}

.question-list {
    padding: 12px 0;
    font-size: 12px;
}

.question-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 12px;
    transition: background 0.3s;
}

.question-item:hover {
    background: #f5f7fa;
}

.content {
    display: flex;
    align-items: center;
    flex: 1;
}

.index {
    width: 30px;
    color: #666;
    font-weight: 500;
}

.title {
    color: #333;
    font-size: 14px;
}

.heat {
    display: flex;
    align-items: center;

    margin-left: 20px;
}



.heat-value {
    color: #ff9900;
    font-weight: 500;
    min-width: 40px;
    text-align: right;
}
</style>