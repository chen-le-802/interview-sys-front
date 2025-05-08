<template>
    <div class="hot-questions" :style="{ width: width + 'px' }">
        <!-- 标题栏 -->
        <div class="header">
            <h3>{{ listTitle }}</h3>
            <div class="more" @click="showMore">更多</div>
        </div>

        <!-- 题目列表 -->
        <div class="question-list">
            <div v-for="(item, index) in questions" :key="index" class="question-item">
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
import { ref } from 'vue'
import { Star } from '@element-plus/icons-vue'


// 声明props
const props = defineProps<{
    listTitle: string,
    questions: Array<{ title: string, heat: number }>,
    width?: number
}>()
const router = useRouter()
// 格式化数字
const formatNumber = (num: number) => {
    return num.toLocaleString()
}
const width = ref(props.width || 280)

const showMore = () => {
    console.log('showMore');
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