<template>
    <div class="container">
        <main class="box">
            <section class="img-box">
                <div class="title">
                    <div class="logo" aria-hidden="true"></div>
                    <h1 class="platform-title">面试斩刷题平台</h1>
                </div>
                <div class="image" role="img" aria-label="注册页面插图"></div>
            </section>

            <section class="info-box">
                <h2 class="welcome-title">欢迎注册</h2>
                <div class="login-form">
                    <form class="form-container" @submit.prevent="handleSubmit">
                        <!-- 账号输入 -->
                        <div class="input-box account">
                            <label for="account" class="sr-only">账号</label>
                            <el-icon class="input-icon">
                                <User />
                            </el-icon>
                            <input v-model="registerForm.account" id="account" type="text" placeholder="请输入账号"
                                autocomplete="username">
                        </div>

                        <!-- 用户名输入 -->
                        <div class="input-box username">
                            <label for="username" class="sr-only">用户名</label>
                            <el-icon class="input-icon">
                                <User />
                            </el-icon>
                            <input v-model="registerForm.username" id="username" type="text" placeholder="请输入用户名"
                                autocomplete="nickname">
                        </div>

                        <!-- 密码输入 -->
                        <div class="input-box password">
                            <label for="password" class="sr-only">密码</label>
                            <el-icon class="input-icon">
                                <Lock />
                            </el-icon>
                            <input v-model="registerForm.password" id="password" :type="passwordFieldType"
                                placeholder="请输入密码" autocomplete="new-password" @keyup.enter="handleSubmit">
                            <el-icon class="password-toggle" role="button" tabindex="0"
                                @click="togglePasswordVisibility">
                                <View v-if="!showPassword" />
                                <Hide v-else />
                            </el-icon>
                        </div>

                        <!-- 确认密码 -->
                        <div class="input-box confirm-password">
                            <label for="confirm-password" class="sr-only">确认密码</label>
                            <el-icon class="input-icon">
                                <Lock />
                            </el-icon>
                            <input v-model="registerForm.confirmPassword" id="confirm-password"
                                :type="confirmPasswordFieldType" placeholder="请确认密码" autocomplete="new-password"
                                @keyup.enter="handleSubmit">
                            <el-icon class="password-toggle" role="button" tabindex="0"
                                @click="toggleConfirmPasswordVisibility">
                                <View v-if="!showConfirmPassword" />
                                <Hide v-else />
                            </el-icon>
                        </div>

                        <el-button native-type="submit" type="primary" class="login-btn">
                            注册
                        </el-button>
                    </form>
                </div>

                <p class="tip">
                    已注册?点击去
                    <a class="gotoLogin" @click="navigateToLogin">
                        登录
                    </a>
                </p>
            </section>
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import router from '@/router'

const LOGIN_PATH = '/login'

export default defineComponent({
    name: 'RegisterPage',
    components: {
        User,
        Lock,
        View,
        Hide
    },
    setup() {
        const registerForm = reactive({
            account: '',
            username: '',
            password: '',
            confirmPassword: ''
        })

        const showPassword = ref(false)
        const showConfirmPassword = ref(false)

        // 计算属性优化输入类型
        const passwordFieldType = computed(() =>
            showPassword.value ? 'text' : 'password'
        )
        const confirmPasswordFieldType = computed(() =>
            showConfirmPassword.value ? 'text' : 'password'
        )

        // 统一切换可见性方法
        const toggleVisibility = (field: 'password' | 'confirmPassword') => {
            if (field === 'password') {
                showPassword.value = !showPassword.value
            } else {
                showConfirmPassword.value = !showConfirmPassword.value
            }
        }

        const togglePasswordVisibility = () => toggleVisibility('password')
        const toggleConfirmPasswordVisibility = () => toggleVisibility('confirmPassword')

        const handleSubmit = () => {
            if (!registerForm.username.trim() || !registerForm.password.trim() || !registerForm.confirmPassword.trim() || !registerForm.account.trim()) {
                ElMessage({
                    message: '请填写完整信息',
                    type: 'warning',
                    plain: true,
                    duration: 2000
                })
                return
            }
            // mock提交表单
            console.log('注册表单提交：', registerForm)
            ElMessage({
                message: '注册成功，正在跳转登录页面',
                type: 'success',
                plain: true,
                duration: 2000
            })
            setTimeout(() => {
                navigateToLogin()
            }, 2000)
        }

        const navigateToLogin = () => {
            // 实际项目中建议使用 vue-router 的 useRouter
            router.push(LOGIN_PATH)

        }

        return {
            registerForm,
            showPassword,
            showConfirmPassword,
            passwordFieldType,
            confirmPasswordFieldType,
            togglePasswordVisibility,
            toggleConfirmPasswordVisibility,
            handleSubmit,
            navigateToLogin
        }
    }
})
</script>

<style scoped>
/* 保持原有样式不变，仅添加可访问性相关样式 */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(to right, #21d2fe, #716cfe);
}

.box {
    display: flex;
    width: 980px;
    height: 550px;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.img-box {
    flex: 3;
    display: flex;
    flex-direction: column;
    border-right: 2px solid #f7f7f7;
}

.img-box .image {
    flex: 1;
    background: url('../assets/images/common/login-logo.png') no-repeat center/contain;
}

.title {
    margin: 50px 0 0 80px;
    display: flex;
    align-items: center;
}

.logo {
    width: 80px;
    height: 80px;
    background: url('../assets/images/common/logo.png') no-repeat center/contain;
    margin-right: 20px;
}

.platform-title {
    color: #358fe5;
    font: italic bold 24px/1.5 sans-serif;
}

.info-box {
    flex: 2;
    padding: 40px;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

}

.welcome-title {
    width: 250px;
    height: 70px;
    border-bottom: 2px solid #358fe5;
    text-align: center;
    line-height: 70px;
    margin: 0 auto;
}

.input-box {
    position: relative;
    width: 300px;
    height: 50px;
    margin: 15px 0;
    border-bottom: 2px solid #dcdcdc;
}

.input-icon {
    position: absolute;
    left: 10px;
    bottom: 8px;
    font-size: 20px;
    color: #666;
    z-index: 2;
    width: 24px;
    height: 24px;
}

input {
    all: unset;
    width: 260px;
    height: 40px;
    padding-left: 40px;
    position: absolute;
    bottom: 0;
    left: 0;
    font-size: 14px;
}

input:focus {
    border-bottom-color: #358fe5;
}

.login-btn {
    width: 100%;
    margin-top: 10px;
    font-size: 16px;
}

.tip {
    color: #666;
    font-size: 14px;
    align-self: flex-start;
}

.gotoLogin {
    color: #358fe5;
    cursor: pointer;
    font-weight: 500;
    margin-left: 5px;
}

.gotoLogin:hover {
    text-decoration: underline;
}

.password-toggle {
    position: absolute;
    bottom: 10px;
    right: 10px;
    cursor: pointer;
    width: 24px;
    /* 固定宽度 */
    height: 24px;
    /* 固定高度 */
    display: flex;
    /* 弹性布局确保图标居中 */
    align-items: center;
    justify-content: center;
}

input[type="password"]::-ms-reveal {
    display: none !important;
}

input[type="text"][autocomplete="current-password"]::-ms-reveal {
    display: none !important;
}
</style>