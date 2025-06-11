<template>
    <div class="discussion-container">
        <!-- 标题区域 -->
        <div class="discussion-header">
            <div class="discussion-title">
                <div :class="{ active: current === 'all' }" style="margin-right: 20px;cursor: pointer;"
                    @click="current = 'all'">
                    回答讨论（{{ totalComments }}个）
                </div>
                <div :class="{ active: current === 'my' }" style="cursor: pointer;" @click="current = 'my'">
                    我的回答
                </div>
            </div>
            <AllComments v-if="current === 'all'" :question-id="questionId"
                @comment-count-change="handleCommentCountChange" />
            <MyComments v-if="current === 'my'" :question-id="questionId" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AllComments from './AllComments.vue';
import MyComments from './MyComments.vue';

// 接收props
interface Props {
    questionId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    questionId: ''
});

const current = ref('all');
const totalComments = ref(0);

// 处理评论数量变化
const handleCommentCountChange = (count: number) => {
    totalComments.value = count;
};
</script>

<style scoped>
.active {
    color: #2286ff;
    border-bottom: #2286ff solid 2px;
    font-weight: 500;
}

.discussion-container {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    width: 100%;
}

.discussion-title {
    height: 40px;
    display: flex;
    width: 100%;
    font-size: 16px;
    border-bottom: #edeeef solid 1px;
    margin-bottom: 30px;
}


</style>