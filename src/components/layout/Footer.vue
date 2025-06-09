<template>
    <footer>
        <div class="content">
            <section class="column align-end">
                <div class="logo-title">
                    <div class="logo"></div>
                    <div class="title">面试斩</div>
                </div>
                <div class="link" @click="showHelpModal">帮助</div>
            </section>
            <section class="column">
                <p class="title mt-13">关注我们</p>
                <div class="qr-row">
                    <div class="QR-code">
                        <a-qrcode
                            error-level="H"
                            value="https://github.com/dwgll/mianshizhan.git"
                            :icon="github_logo"
                            :size="80"
                            :icon-size="20"
                            :bordered="false"
                        />
                    </div>
                    <div class="text ml-10">
                        <ul>
                            <li>扫码或点击访问</li>
                            <a class="link" 
                               style="margin-top: 0;text-decoration: underline;" 
                               href="https://github.com/dwgll/mianshizhan.git" 
                               target="_blank"
                            >
                               GitHub 仓库
                            </a>
                        </ul>
                    </div>
                </div>
            </section>
            <section class="column">
                <p class="title mt-13">联系我们</p>
                <div class="qr-row">
                    <div class="QR-code">
                        <a-qrcode
                            error-level="H"
                            value="https://www.antdv.com"
                            :icon="logo"
                            :size="80"
                            :icon-size="20"
                            :bordered="false"
                        />
                    </div>
                    <div class="text ml-10">
                        <ul>
                            <li>扫码关注</li>
                            <li>面试斩公众号</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>

        <!-- 帮助模态框 -->
        <a-modal 
            v-model:open="modalVisible" 
            title="使用手册" 
            width="1000px"
            :footer="null"
        >
            <div class="help-content">
                <h3>面试斩使用指南</h3>
                <p>1. 注册/登录：首先需要注册账号并登录系统</p>
                <p>2. 创建面试：点击"新建面试"按钮开始创建新的面试</p>
                <p>3. 选择题目：从题库中选择适合的面试题目</p>
                <p>4. 开始面试：按照系统提示完成面试流程</p>
                <p>5. 查看结果：面试结束后可以查看评分和反馈</p>
                
                <h3>常见问题</h3>
                <p>Q: 如何修改个人信息？</p>
                <p>A: 点击右上角头像进入个人中心进行修改</p>
                
                <p>Q: 面试记录在哪里查看？</p>
                <p>A: 在"我的面试"页面可以查看所有历史记录</p>
                
            </div>
        </a-modal>
    </footer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { QRCode as AQrcode, Modal as AModal } from 'ant-design-vue';
import logo from '../../assets/images/common/logo.png';
import github_logo from '../../assets/images/frontend/github-logo.jpg';

const modalVisible = ref(false);

const showHelpModal = () => {
    modalVisible.value = true;
};
</script>

<style lang="css" scoped>
footer {
    display: flex;
    width: 100%;
    height: 250px;
    background-color: #f9f8f8;
    justify-content: center;
    margin-top: 80px;
}
.content {
    width: 1200px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}
.column {
    display: flex;
    flex-direction: column;
}
.align-end {
    align-items: flex-end;
}
.logo-title {
    display: flex;
    align-items: center;
}
.logo {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: url('../../assets/images/common/logo.png') no-repeat center center;
    background-size: cover;
    margin-right: 20px;
}
.title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}
.link {
    color: #6D7784;
    margin-top: 10px;
    font-size: 13px;
    cursor: pointer;
}
.link:hover {
    color:black;
}
.text {
    color: #6D7784;
    margin-top: 10px;
    font-size: 13px;
}
.qr-row {
    display: flex;
    margin-top: 10px;
    align-items: center;
}
.mt-13 {
    margin-top: 13px;
}
.ml-10 {
    margin-left: 10px;
}

/* 帮助内容样式 */
.help-content {
    padding: 20px;
    line-height: 2;
}
.help-content h3 {
    margin-top: 20px;
    color: #333;
}
.help-content p {
    margin: 8px 0;
    color: #666;
}
</style>