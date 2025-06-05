<template>
    <div class="discussion-container">
        <!-- 标题区域 -->
        <div class="discussion-header">
            <div class="discussion-title">
                <div
                    :class="{ active: current === 'all' }"
                    style="margin-right: 20px;cursor: pointer;"
                    @click="current = 'all'"
                >
                    回答讨论（{{ length }}个）
                </div>
                <div
                    :class="{ active: current === 'my' }"
                    style="cursor: pointer;"
                    @click="current = 'my'"
                >
                    我的回答
                </div>
            </div>
           <AllComments v-if="current === 'all'"></AllComments>
            <MyComments v-if="current === 'my'"></MyComments>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const length = 10;
const current = ref('all');
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


</style>style