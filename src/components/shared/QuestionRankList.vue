<template>
    <a-card style="width: 896px; background-color: #fff; padding: 0">
        <h2 style="margin: 0 0 16px; padding-left: 8px">{{ themeLabel }}榜</h2>
        <div v-for="item in currentRankingData" :key="item.id" class="ranking-item" :style="{ margin: rankingItemMargin }">

            <router-link 
                :to="getItemLink(item)" 
                class="item-rank"
                style="text-decoration: none; color: inherit;"
            >
                <div class="rank-number" :style="{ color: getRankColor(item.rank) }">{{ item.rank }}</div>
                <div class="info">
                   <a-avatar 
                        v-if="showAvatar" 
                        :size="38" 
                        style="margin-right: 8px"
                        :src="item.avatar || defaultAvatar"
                    ></a-avatar>
                    <div class="info-content">
                        <p>{{ item.title }}</p>
                        <p v-if="showSignature" style="font-size: 14px; color: #6b7280;font-weight:500">{{ item.signature || '签名' }}</p>
                    </div>
                </div>
            </router-link>
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
import { useRouter } from 'vue-router';
import defaultAvatar from '../../assets/images/common/avatar.png'; // 默认头像路径

const router = useRouter();


// 从父组件传入
const props = defineProps<{
    theme?: string;
}>();

const theme = computed(() => props.theme || 'hot-questions');
const rankingItemMargin = computed(() => {
    return theme.value === 'hot-questions' ? '0' : '20px 0 0 0';
});

const themeLabels: Record<string, string> = {
    'hot-questions': '热门题目',
    'user-rank': '用户排行',
    'question-rank': '刷题排行',
    'invite-rank': '邀请排行',
};

// 根据 theme 显示不同的标签
const themeLabel = computed(() => {
    return themeLabels[theme.value] || '排名';
});

// Mock 数据 - 不同主题的数据
const rankingData = {
    'hot-questions': [
        { id: 1, title: '你认为Java的优势是什么?', heat: '5.3w', rank: 1, type: 'question' },
        { id: 2, title: 'Java中什么是序列化?', heat: '4.3w', rank: 2, type: 'question' },
        { id: 3, title: '如何理解Java的多态性？', heat: '3.9w', rank: 3, type: 'question' },
        { id: 4, title: 'Java的垃圾回收机制？', heat: '3.5w', rank: 4, type: 'question' },
        { id: 5, title: 'Java集合框架有哪些核心接口？', heat: '3.2w', rank: 5, type: 'question' },
    ],
    'user-rank': [
        { id: 101, title: '张伟', signature: 'Java高级工程师', heat: '12.8w', rank: 1, type: 'user'},
        { id: 102, title: '李娜', signature: '前端架构师', heat: '10.2w', rank: 2, type: 'user' },
        { id: 103, title: '王强', signature: '全栈开发者', heat: '9.7w', rank: 3, type: 'user' },
        { id: 104, title: '赵敏', signature: 'Python数据分析师', heat: '8.9w', rank: 4, type: 'user' },
        { id: 105, title: '刘洋', signature: 'Go语言爱好者', heat: '7.5w', rank: 5, type: 'user' },
    ],
    'question-rank': [
        { id: 201, title: '陈晨', signature: '刷题狂魔', heat: '328', rank: 1, type: 'user' },
        { id: 202, title: '吴迪', signature: '算法爱好者', heat: '298', rank: 2, type: 'user' },
        { id: 203, title: '郑爽', signature: '数据结构专家', heat: '276', rank: 3, type: 'user' },
        { id: 204, title: '周杰', signature: '竞赛选手', heat: '245', rank: 4, type: 'user' },
        { id: 205, title: '孙俪', signature: '每日一题', heat: '231', rank: 5, type: 'user' },
    ],
    'invite-rank': [
        { id: 301, title: '林涛', signature: '社区活跃者', heat: '56', rank: 1, type: 'user' },
        { id: 302, title: '黄蓉', signature: '推广达人', heat: '48', rank: 2, type: 'user' },
        { id: 303, title: '杨过', signature: '社交高手', heat: '42', rank: 3, type: 'user' },
        { id: 304, title: '郭靖', signature: '乐于分享', heat: '38', rank: 4, type: 'user' },
        { id: 305, title: '小龙女', signature: '技术布道师', heat: '35', rank: 5, type: 'user' },
    ],
   
};

// 根据当前主题获取对应的数据
const currentRankingData = computed(() => {
    return rankingData[theme.value] || rankingData['hot-questions'];
});

// 动态获取排名颜色
const getRankColor = (rank: number) => {
    const colors: Record<number, string> = {
        1: '#dc2626',  // 红色
        2: '#ef4444',  // 橙红色
        3: '#f59e0b',  // 橙色
    };
    return colors[rank] || '#6b7280';  // 默认灰色
};

// 获取链接
const getItemLink = (item: any) => {
    switch (item.type) {
        case 'question':
            return `/question`;
        case 'user':
            return `/personal`;
        default:
            return '/';
    }
};

// 是否显示头像
const showAvatar = computed(() => {
    return ['user-rank', 'invite-rank', 'question-rank', 'new-rank', 'answer-rank'].includes(theme.value);
});

// 是否显示签名
const showSignature = computed(() => {
    return ['user-rank', 'invite-rank', 'question-rank', 'new-rank', 'answer-rank'].includes(theme.value);
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
        case 'new-rank':
            return '成长值';
        case 'answer-rank':
            return '解答数';
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
    cursor: pointer;
    transition: background-color 0.3s;
}

.ranking-item:hover {
    background-color: #f5f5f5;
}

.item-rank {
    display: flex;
    height: 53px;
    align-items: center;
    line-height: 53px;
    padding: 12px 8px;
    flex-grow: 1;
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