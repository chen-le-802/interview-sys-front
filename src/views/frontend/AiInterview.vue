<template>
    <div class="container">
        <div class="left">
            <div class="logo-title">
                <div class="logo"></div>
                <p style="font-size: 16px; font-weight: 600;">AI面试官</p>
            </div>
            <div class="nav">
                <a-button class="add-interview-btn">
                    <PlusOutlined />新建面试
                </a-button>
                <!-- 面试记录 -->
                <div class="nav-section">
                    <div class="section-title">
                        <ClockCircleOutlined />
                        <span>面试记录</span>
                    </div>
                    <div class="interview-list">
                        <div class="interview-item">市场营销面试（demo）</div>
                        <div class="interview-item">技术开发面试（demo）</div>
                    </div>
                </div>

                <!-- 我的简历 -->
                <div class="nav-section">
                    <div class="section-title my-resume-title">
                        <div>
                            <SolutionOutlined />
                            <span>我的简历</span>
                        </div>
                        <a-button type="text" class="add-btn">
                            <PlusOutlined style="margin-left: 5px;" />
                        </a-button>
                    </div>
                    <div class="resume-list">
                        <div class="resume-item">张三 - 市场营销（demo）</div>
                        <div class="resume-item">李四 - 后端技术开发（demo）</div>
                    </div>
                </div>
            </div>
            <a-button class="go-to-home" @click="$router.push('/')">退出</a-button>
        </div>

        <div class="right">
            <div class="header-container">
                <div class="header-box">
                    <a-button type="text" style="background-color: #e6f4ff;color:#1677FF">面试记录</a-button>
                    <a-button type="text" style="background-color: #f5f5f5;">评估报告</a-button>
                </div>
            </div>
            <div class="content">
                <div class="chat-record">
                    <!-- 示例聊天内容 -->
                    <div class="chat-bubble ai">
                        <div class="chat-header">AI面试官</div>
                        <div class="chat-content">
                            你好，首先欢迎你来参加今天的面试。为了让我们更好地了解你，请你先做一个简单的自我
                            介绍吧。你可以介绍以下你的基本情况，比如教育背景，工作经历。也可以谈谈你的个人优
                            势、特长等。
                        </div>
                    </div>

                    <div class="chat-bubble user">
                        <div class="chat-header">面试者</div>
                        <div class="chat-content">
                            您好，非常感谢贵公司给我这次面试的机会。我叫张三，毕业于北京大学经济管理专业。自
                            2018年进入职场以来，我一直在市场营销领域工作，先后在摩司科技和星途电商担任市场营销
                            销专员和经理等职位。在工作中，我积累了丰富的市场调研、品牌推广、会员营销和活动策
                            划等经验...
                        </div>
                    </div>

                    <!-- 更多聊天内容... -->
                </div>
            </div>
            <div class="footer-container">
                <div class="chat-input-box">
                    <div class="input-container">
                        <textarea placeholder="请输入你的回答..." rows="3" class="message-input"></textarea>
                        <a-button type="primary" class="send-button">
                            发送
                        </a-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PlusOutlined, ClockCircleOutlined, SolutionOutlined } from "@ant-design/icons-vue"
</script>

<style scoped>
.container {
    width: 100%;
    height: 100vh;
    display: flex;
}

.left {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    height: 100vh;
    background-color: #f3f4f6;
    padding: 20px;
    overflow-y: auto;
    z-index: 999;
}

.right {
    margin-left: 280px;
    flex: 1;
    height: 100vh;
    background-color: #f7f8fc;
    display: flex;
    flex-direction: column;

}

.logo-title {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: url(@/assets/images/common/logo.png);
    background-size: cover;
    margin-right: 12px;
}

.add-interview-btn {
    box-sizing: border-box;
    background-color: #e5ebf7;
    width: 100%;
    height: 40px;
    padding-left: 12px;
    border-radius: 12px;
    border: .5px solid rgba(0, 102, 255, .15);
    color: #0057ff;
    text-align: start;
    font-weight: 600;
}

.nav-section {
    margin: 24px 0;
}

.section-title {
    display: flex;
    align-items: center;
    color: #666;
    margin-bottom: 12px;
    padding: 0 8px;
}

.section-title :deep(svg) {
    width: 14px;
    margin-right: 8px;
    color: #999;
}

.interview-list,
.resume-list {
    padding: 0 8px;
}

.interview-item,
.resume-item {
    padding: 10px 22px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: #333;
    transition: all 0.2s;
}

.interview-item:hover,
.resume-item:hover {
    background-color: #e8f0fe;
    color: #0057ff;
}

.add-btn {
    color: #666 !important;
    padding: 0 4px !important;
    height: auto !important;
}

.add-btn:hover {
    background-color: #e5ebf7 !important;
}

.my-resume-title {
    justify-content: space-between;
}

.go-to-home {
    width: 240px;
    height: 40px;
    border-radius: 20px;
    position: absolute;
    bottom: 5px;
}

.header-container {
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f7f8fc;
    z-index: 1000;
}

.footer-container {
    position: fixed;
    bottom: 0;
    left: 280px;
    right: 0;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 1000;
}

.header-box {
    width: 200px;
    height: 50px;
    background-color: #ffffff;
    border-radius: 10px;
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.content {
    margin: 0 auto;
    margin-top: 50px;
    padding: 20px;
    overflow: auto;
    height: calc(100vh - 200px);
    width: 800px
}

/* 聊天记录区域样式 */
.chat-record {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
}

/* 聊天泡泡样式 */
.chat-bubble {
    max-width: 75%;
    margin-bottom: 24px;
    padding: 16px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chat-bubble.ai {
    margin-right: auto;
    border-left: 4px solid #1677FF;
}

.chat-bubble.user {
    margin-left: auto;
    background: #E6F4FF;
    border-right: 4px solid #1677FF;
}

.chat-header {
    font-weight: 500;
    color: #1677FF;
    margin-bottom: 8px;
    font-size: 13px;
}

.chat-content {
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
}

/* 输入框区域样式 */
.footer-container {
    position: fixed;
    bottom: 0;

    padding: 20px;


}

.chat-input-box {
    width: 800px;
    margin: 0 auto;
}

.input-container {
    display: flex;
    gap: 16px;
    align-items: flex-end;
    width: 100%;
    position: relative;
}

.message-input {
    flex: 1;
    padding: 14px 52px 14px 20px;
    border: 1px solid #e0e7ff;
    border-radius: 12px;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: #ffffff;
    box-shadow: 0 2px 8px -2px rgba(22, 119, 255, 0.08);
}

.message-input::placeholder {
    color: #94a3b8;
    font-weight: 300;
}

.message-input:focus {
    outline: none;
    border-color: #1677FF;
    box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.1),
        0 4px 20px -4px rgba(22, 119, 255, 0.15);
}

.send-button {
    position: absolute;
    right: 12px;
    bottom: 12px;
    height: 40px;
    padding: 0 24px;
    border-radius: 8px;
    font-weight: 500;
    background: #1677FF;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 6px -2px rgba(22, 119, 255, 0.4);
}

.send-button:hover {
    background: #4096ff !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px -2px rgba(22, 119, 255, 0.4);
}

.send-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px -2px rgba(22, 119, 255, 0.4);
}

/* 响应式调整 */
@media (max-width: 768px) {
    .chat-input-box {
        width: 95%;
    }

    .message-input {
        padding-right: 60px;
    }

    .send-button {
        padding: 0 18px;
    }
}
</style>