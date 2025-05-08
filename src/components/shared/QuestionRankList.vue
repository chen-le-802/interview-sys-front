<template>
    <a-card style="width: 896px; background-color: #fff; padding: 0">
        <h2 style="margin: 0 0 16px; padding-left: 8px">{{ themeLabel }}榜</h2>
        <div v-for="item in hotQuestions" :key="item.id" class="ranking-item" :style="{ margin: rankingItemMargin }">

            <div class="item-rank">
                <div class="rank-number" :style="{ color: getRankColor(item.rank) }">{{ item.rank }}</div>
                <div class="info">
                    <a-avatar v-if="showAvatar" :size="38" style="margin-right: 8px"></a-avatar>
                    <div class="info-content">
                        <p>{{ item.title }}</p>
                        <p v-if="showSignature" style="font-size: 14px; color: #6b7280;font-weight:500">签名</p>
                    </div>
                </div>
            </div>
            <div class="heat-box">
                <FireFilled style="color: #ff4500" />
                <div class="heat">{{ item.heat }}</div>
                <div style="font-size: 14px; color: #6b7280">{{ heatLabel }}</div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FireFilled } from '@ant-design/icons-vue';

// 假设从父组件传入
const props = defineProps<{
    theme?: string;
}>();

const theme = computed(() => props.theme || 'user-rank');
const rankingItemMargin = computed(() => {
    return theme.value === 'hot-questions' ? '0' : '20px 0 0 0';
});

const themeLabels: Record<string, string> = {
    'hot-questions': '热门问题',
    'user-rank': '用户排名',
    'question-rank': '问题解答回答',
    'invite-rank': '邀请人数',
};

// 根据 theme 显示不同的标签
const themeLabel = computed(() => {
    return themeLabels[theme.value] || '排名';
});

// Mock 数据
const hotQuestions = ref([
    { id: 1, title: '你认为Java的优势是什么?', heat: '5.3w', rank: 1 },
    { id: 2, title: 'Java中什么是序列化?', heat: '4.3w', rank: 2 },
    { id: 3, title: '如何理解Java的多态性？', heat: '3.9w', rank: 3 },
    { id: 4, title: 'Java的垃圾回收机制？', heat: '3.5w', rank: 4 },
    { id: 5, title: 'Java集合框架有哪些核心接口？', heat: '3.2w', rank: 5 },
]);

// 动态获取排名颜色
const getRankColor = (rank: number) => {
    const colors: Record<number, string> = {
        1: '#dc2626',  // 红色
        2: '#ef4444',  // 橙红色
        3: '#f59e0b',  // 橙色
    };
    return colors[rank] || '#6b7280';  // 默认灰色
};

// 是否显示头像
const showAvatar = computed(() => {
    return ['user-rank', 'invite-rank', 'question-rank'].includes(theme.value);
});

// 是否显示签名
const showSignature = computed(() => {
    return ['user-rank', 'invite-rank', 'question-rank'].includes(theme.value);
});

// 根据 theme 显示不同的标签
const heatLabel = computed(() => {
    switch (theme.value) {
        case 'hot-questions':
            return '热度';
        case 'user-rank':
            return '经验';
        case 'question-rank':
            return '题解';
        case 'invite-rank':
            return '人数';
        default:
            return '';
    }
});
</script>

<style scoped>
.ranking-item {
    margin: 20px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 848px;
    height: 53px;
    border-radius: 5px;
    padding: 12px 8px;
    font-size: 16px;
    font-weight: 700;
}

.item-rank {
    display: flex;
    height: 53px;
    align-items: center;
    line-height: 53px;
    padding: 12px 8px;
}

.rank-number {
    margin-right: 20px;
    font-size: 18px;
}

.info {
    display: flex;
    align-items: center;
}

.info-content {
    line-height: 25px;
    display: flex;
    flex-direction: column;
}

.heat-box {
    width: 101px;
    height: 29px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}
</style>
