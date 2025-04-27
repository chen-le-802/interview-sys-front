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
                            <input v-model="registerForm.userAccount" id="account" type="text" placeholder="请输入账号"
                                autocomplete="username" :disabled="loading" @blur="validateAccount">
                            <div class="error-msg" v-if="errors.userAccount">{{ errors.userAccount }}</div>
                        </div>

                        <!-- 用户名输入 -->
                        <div class="input-box username">
                            <label for="username" class="sr-only">用户名</label>
                            <el-icon class="input-icon">
                                <User />
                            </el-icon>
                            <input v-model="registerForm.userName" id="username" type="text" placeholder="请输入用户名"
                                autocomplete="nickname" :disabled="loading" @blur="validateUsername">
                            <div class="error-msg" v-if="errors.userName">{{ errors.userName }}</div>
                        </div>

                        <!-- 密码输入 -->
                        <div class="input-box password">
                            <label for="password" class="sr-only">密码</label>
                            <el-icon class="input-icon">
                                <Lock />
                            </el-icon>
                            <input v-model="registerForm.userPassword" id="password" :type="passwordFieldType"
                                placeholder="请输入密码(8-20位)" autocomplete="new-password" :disabled="loading"
                                @blur="validatePassword">
                            <el-icon class="password-toggle" role="button" tabindex="0"
                                @click="togglePasswordVisibility" @keyup.enter="togglePasswordVisibility">
                                <View v-if="!showPassword" />
                                <Hide v-else />
                            </el-icon>
                            <div class="error-msg" v-if="errors.userPassword">{{ errors.userPassword }}</div>
                        </div>

                        <!-- 确认密码 -->
                        <div class="input-box confirm-password">
                            <label for="confirm-password" class="sr-only">确认密码</label>
                            <el-icon class="input-icon">
                                <Lock />
                            </el-icon>
                            <input v-model="registerForm.checkPassword" id="confirm-password"
                                :type="confirmPasswordFieldType" placeholder="请确认密码" autocomplete="new-password"
                                :disabled="loading" @blur="validateConfirmPassword">
                            <el-icon class="password-toggle" role="button" tabindex="0"
                                @click="toggleConfirmPasswordVisibility" @keyup.enter="toggleConfirmPasswordVisibility">
                                <View v-if="!showConfirmPassword" />
                                <Hide v-else />
                            </el-icon>
                            <div class="error-msg" v-if="errors.checkPassword">{{ errors.checkPassword }}</div>
                        </div>

                        <el-button native-type="submit" type="primary" class="login-btn" :loading="loading">
                            {{ loading ? '注册中...' : '注册' }}
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
import { userRegister } from '@/apis/authApi'

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
            userAccount: '',
            userName: '',
            userPassword: '',
            checkPassword: ''
        })

        const errors = reactive({
            userAccount: '',
            userPassword: '',
            checkPassword: '',
            userName: ''
        })

        const showPassword = ref(false)
        const showConfirmPassword = ref(false)
        const loading = ref(false)

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

        // 表单验证
        const validateAccount = () => {
            if (!registerForm.userAccount.trim()) {
                errors.userAccount = '账号不能为空'
                return false
            } else if (registerForm.userAccount.length < 4) {
                errors.userAccount = '账号长度不能少于4位'
                return false
            } else if (!/^[a-zA-Z0-9_]{4,16}$/.test(registerForm.userAccount)) {
                errors.userAccount = '账号只能包含字母、数字和下划线，长度4-16位'
                return false
            }
            errors.userAccount = ''
            return true
        }

        const validatePassword = () => {
            if (!registerForm.userPassword) {
                errors.userPassword = '密码不能为空'
                return false
            } else if (registerForm.userPassword.length < 8 || registerForm.userPassword.length > 20) {
                errors.userPassword = '密码长度应为8-20位'
                return false
            }
            errors.userPassword = ''
            return true
        }

        const validateConfirmPassword = () => {
            if (!registerForm.checkPassword) {
                errors.checkPassword = '请确认密码'
                return false
            } else if (registerForm.userPassword !== registerForm.checkPassword) {
                errors.checkPassword = '两次输入的密码不一致'
                return false
            }
            errors.checkPassword = ''
            return true
        }

        const validateUsername = () => {
            if (!registerForm.userName.trim()) {
                errors.userName = '用户名不能为空'
                return false
            } else if (registerForm.userName.length < 2) {
                errors.userName = '用户名长度不能少于2位'
                return false
            } else if (!/^[a-zA-Z0-9_]{2,16}$/.test(registerForm.userName)) {
                errors.userName = '用户名只能包含字母、数字和下划线，长度2-16位'
                return false
            }
            errors.userName = ''
            return true
        }

        const validateForm = () => {
            const isAccountValid = validateAccount()
            const isPasswordValid = validatePassword()
            const isConfirmPasswordValid = validateConfirmPassword()
            const isUsernameValid = validateUsername() // 未实现用户名验证

            return isAccountValid && isPasswordValid && isConfirmPasswordValid && isUsernameValid
        }

        const handleSubmit = async () => {
            if (!validateForm()) {
                ElMessage({
                    message: '请检查表单输入',
                    type: 'warning',
                    duration: 2000
                })
                return
            }

            try {
                loading.value = true
                console.log('发送注册请求:', registerForm)

                const response = await userRegister(registerForm)
                console.log('注册响应:', response)

                if (response.code === 0) {
                    ElMessage({
                        message: '注册成功，正在跳转登录页面',
                        type: 'success',
                        duration: 2000
                    })

                    setTimeout(() => {
                        navigateToLogin()
                    }, 1500)
                } else {
                    ElMessage({
                        message: response.message || '注册失败，请重试',
                        type: 'error',
                        duration: 3000,
                        showClose: true
                    })
                }
            } catch (error: any) {
                console.error('注册失败:', error)
                ElMessage({
                    message: error.message || '注册失败，请检查网络连接',
                    type: 'error',
                    duration: 3000,
                    showClose: true
                })
            } finally {
                loading.value = false
            }
        }

        const navigateToLogin = () => {
            router.push(LOGIN_PATH)
        }

        return {
            registerForm,
            errors,
            showPassword,
            showConfirmPassword,
            passwordFieldType,
            confirmPasswordFieldType,
            loading,
            togglePasswordVisibility,
            toggleConfirmPasswordVisibility,
            validateAccount,
            validatePassword,
            validateConfirmPassword,
            validateUsername,
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

.error-msg {
    color: red;
    position: absolute;
    bottom: -20px;
    left: 10px;
    font-size: 12px;
}



input[type="password"]::-ms-reveal {
    display: none !important;
}

input[type="text"][autocomplete="current-password"]::-ms-reveal {
    display: none !important;
}
</style>