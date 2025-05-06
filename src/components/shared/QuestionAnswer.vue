<template>
    <div class="question-answer-box">
        <div class="nav">
            <ul>
                <li class="nav-active">推荐答案</li>
                <li> 测试一下</li>
            </ul>
            <div class="hide-answer">
                <el-icon role="button" @click="toggleAnswer" @keyup.enter="toggleAnswer" tabindex="0"
                    style="cursor: pointer;">
                    <View v-if="!showAnswer"></View>
                    <Hide v-else></Hide>
                </el-icon>
                {{ showAnswer ? '显示答案' : '隐藏答案' }}
            </div>
        </div>
        <div class="answer-content">
            这是答案
        </div>
        <div class="answer-footer">
            <div class="options">
                <div class="option-item">
                    <LikeOutlined />
                    108
                </div>
                <div class="option-item">
                    <SoundOutlined />
                    催更

                </div>
                <div class="option-item">
                    <EditOutlined />
                    反馈
                </div>
            </div>

        </div>
    </div>
</template>
<script setup lang="ts">
import { View, Hide } from '@element-plus/icons-vue';
import { LikeOutlined, SoundOutlined, EditOutlined } from '@ant-design/icons-vue'
const showAnswer = ref(true);
const toggleAnswer = () => {
    showAnswer.value = !showAnswer.value;
};
</script>
<style lang="css" scoped>
.nav-active {
    border-bottom: 2px solid #1677ff;

    color: #1677ff;
    font-weight: 500;
}

.question-answer-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #ffffff;
    border-radius: 10px;
    margin-bottom: 20px;

}

.question-answer-box .nav {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 60px;
    line-height: 60px;
    border-bottom: #f5f5f5 solid 1.5px;
    padding: 0 25px;
}

.question-answer-box .nav ul {
    font-size: 16px;
    height: 59px;
    display: flex;
}

.question-answer-box .nav ul li {
    display: block;
    margin-right: 30px;
    cursor: pointer;
}

.hide-answer {
    width: 75px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #c1c1c1;
    margin-right: 10px;
}

.answer-content {
    padding: 25px;
    flex: 1;
}

.answer-footer {
    display: flex;
    align-items: center;
    width: 90%;
    border-top: #f5f5f5 solid 1.5px;
    height: 70px;
    margin: 10px auto;
    margin-bottom: 0px;
    color: #c1c1c1;
    font-size: 13px;
}

.answer-footer .options {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
}

.options .option-item {

    cursor: pointer;
}

.options .option-item:hover {
    color: #1677ff;

}
</style>