<template>
    <div class="container">

        <main class="box">
            <section class="img-box">
                <div class="title">
                    <div class="logo" aria-hidden="true"></div>
                    <h1 class="platform-title">面试斩刷题平台</h1>
                </div>
                <div class="image" role="img" aria-label="登录页面插图"></div>
            </section>

            <section class="info-box">
                <h2 class="welcome-title">欢迎登录</h2>
                <div class="login-form">
                    <form class="form-container" @submit.prevent="handleSubmit">
                        <div class="input-box username">
                            <label for="username" class="sr-only">用户名</label>
                            <el-icon class="input-icon">
                                <User />
                            </el-icon>
                            <input v-model="loginForm.userAccount" id="username" type="text" placeholder="请输入账号"
                                autocomplete="username" :disabled="loading">
                        </div>

                        <div class="input-box password">
                            <label for="password" class="sr-only">密码</label>
                            <el-icon class="input-icon">
                                <Lock />
                            </el-icon>
                            <input v-model="loginForm.userPassword" id="password"
                                :type="showPassword ? 'text' : 'password'" placeholder="请输入密码"
                                autocomplete="current-password" @keyup.enter="handleSubmit" :disabled="loading">
                            <el-icon class="password-toggle" role="button" tabindex="0"
                                @click="togglePasswordVisibility" @keyup.enter="togglePasswordVisibility">
                                <View v-if="!showPassword" />
                                <Hide v-else />
                            </el-icon>
                        </div>

                        <el-button native-type="submit" type="primary" class="login-btn" :loading="loading">
                            {{ loading ? '登录中...' : '登录' }}
                        </el-button>
                    </form>
                </div>

                <p class="tip">
                    未注册?点击去
                    <a class="gotoRegister" @click="navigateToRegister">
                        注册
                    </a>
                </p>
            </section>
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { userLogin } from '@/apis/authApi'

const REGISTER_PATH = '/register'

export default defineComponent({
    name: 'LoginPage',
    components: {
        User,
        Lock,
        View,
        Hide
    },
    setup() {
        onMounted(() => {

        });

        const loginForm = reactive({
            userAccount: '',
            userPassword: ''
        })

        const showPassword = ref(false)
        const loading = ref(false)

        const togglePasswordVisibility = () => {
            showPassword.value = !showPassword.value
        }

        const handleSubmit = async () => {
            // 输入验证
            if (!loginForm.userAccount.trim()) {
                ElMessage({
                    message: '请输入账号',
                    type: 'warning',
                    duration: 2000
                })
                return
            }

            if (!loginForm.userPassword.trim()) {
                ElMessage({
                    message: '请输入密码',
                    type: 'warning',
                    duration: 2000
                })
                return
            }

            try {
                loading.value = true
                const response = await userLogin(loginForm)
                console.log('登录响应:', response)

                if (response.code === 0) {
                    // 保存登录状态
                    localStorage.setItem('token', response.data.id.toString())
                    localStorage.setItem('userInfo', JSON.stringify(response.data))
                    // 设置过期时间（例如1小时后过期）
                    const expireTime = new Date().getTime() + 60 * 60 * 1000
                    localStorage.setItem('expireTime', expireTime.toString())

                    // 显示成功消息
                    ElMessage({
                        message: '登录成功，正在跳转...',
                        type: 'success',
                        duration: 1500
                    })

                    setTimeout(() => {
                        router.push('/').catch(err => {
                            console.error('路由跳转失败:', err)
                        })
                    }, 1000)
                } else {
                    ElMessage({
                        message: response.message || '登录失败，请重试',
                        type: 'error',
                        duration: 3000,
                        showClose: true
                    })
                }
            } catch (error: any) {
                console.error('登录失败:', error)
                ElMessage({
                    message: error.message || '登录失败，请检查网络连接',
                    type: 'error',
                    duration: 3000,
                    showClose: true
                })
            } finally {
                loading.value = false
            }
        }

        const navigateToRegister = () => {
            router.push(REGISTER_PATH)
        }

        return {
            loginForm,
            showPassword,
            loading,
            togglePasswordVisibility,
            handleSubmit,
            navigateToRegister
        }
    }
})
</script>

<style scoped>
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
    margin-bottom: 60px;
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
    height: 60px;
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
    margin-top: 30px;
    font-size: 16px;
}

.tip {
    color: #666;
    font-size: 14px;
    align-self: flex-start;
}

.gotoRegister {
    color: #358fe5;
    cursor: pointer;
    font-weight: 500;
    margin-left: 5px;
}

.gotoRegister:hover {
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