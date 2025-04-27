<template>
    <el-dropdown @command="handleCommand" trigger="click" class="user-dropdown">
        <span class="el-dropdown-link" :class="{ 'not-logged-in': !isLoggedIn }">
            <div class="avatar" :style="{ backgroundImage: `url(${userAvatar})` }"></div>
            <span class="username">{{ displayUserName }}</span>
            <el-icon class="dropdown-icon">
                <arrow-down />
            </el-icon>
        </span>
        <template #dropdown>
            <el-dropdown-menu class="custom-dropdown-menu">
                <template v-if="isLoggedIn">
                    <el-dropdown-item v-if="isAdmin && isAdminRoute" command="front">
                        <el-icon>
                            <HomeFilled />
                        </el-icon>
                        <span>前台首页</span>
                    </el-dropdown-item>

                    <el-dropdown-item v-if="isAdmin && !isAdminRoute" command="admin">
                        <el-icon>
                            <setting />
                        </el-icon>
                        <span>管理后台</span>
                    </el-dropdown-item>

                    <el-dropdown-item command="personal">
                        <el-icon>
                            <user />
                        </el-icon>
                        <span>个人主页</span>
                    </el-dropdown-item>

                    <el-dropdown-item divided command="logout" class="logout-item">
                        <el-icon><switch-button /></el-icon>
                        <span>退出登录</span>
                    </el-dropdown-item>
                </template>
                <template v-else>
                    <el-dropdown-item command="login" class="login-item">
                        <el-icon><switch-button /></el-icon>
                        <span>前往登录</span>
                    </el-dropdown-item>
                </template>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown, User, Setting, SwitchButton, HomeFilled } from '@element-plus/icons-vue'

import { userLogout } from '@/apis/authApi'
import { clearAuth, getUserInfo, isAdmin as checkIsAdmin } from '@/utils/auth'

export default defineComponent({
    name: 'LogoutComponent',
    components: {
        ArrowDown,
        User,
        Setting,
        SwitchButton,
        HomeFilled
    },
    setup() {
        const router = useRouter()
        const route = useRoute()

        const loading = ref(false)

        // 获取用户信息
        const userInfo = computed(() => getUserInfo())

        // 是否登录
        const isLoggedIn = computed(() => !!userInfo.value)

        // 显示用户名，未登录显示“未登录”
        const displayUserName = computed(() => {
            return userInfo.value?.userName || '未登录'
        })

        const userAvatar = computed(() => {
            return userInfo.value?.userAvatar || '/src/assets/images/common/avatar.png'
        })

        // 是否管理员
        const isAdmin = computed(() => checkIsAdmin())

        // 判断当前是否处于后台路由
        const isAdminRoute = computed(() => route.path.startsWith('/admin'))

        const handleCommand = async (command: string) => {
            switch (command) {
                case 'logout':
                    await handleLogout()
                    break
                case 'personal':
                    router.push('/personal')
                    break
                case 'admin':
                    router.push('/admin/home')
                    break
                case 'front':
                    router.push('/')
                    break
                case 'login':
                    router.push('/login')
                    break
            }
        }

        const handleLogout = async () => {
            try {
                await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                loading.value = true

                try {
                    await userLogout()
                } catch (err) {
                    console.error('登出API调用失败，但继续清除本地状态', err)
                }

                clearAuth()

                setTimeout(() => {
                    ElMessage.success('退出成功')
                    window.location.href = '/login'
                }, 100)
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('登出失败:', error)
                    ElMessage.error('退出失败，请重试')
                }
            } finally {
                loading.value = false
            }
        }

        return {
            displayUserName,
            userAvatar,
            isAdmin,
            isLoggedIn,
            isAdminRoute,
            handleCommand,
            handleLogout,
            loading
        }
    }
})
</script>

<style scoped>
.user-dropdown {
    height: 100%;
    display: flex;
    align-items: center;
}

.el-dropdown-link {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    transition: color 0.3s;
    cursor: pointer;
    user-select: none;
    padding: 0 8px;
    border-radius: 4px;
}

.el-dropdown-link:hover {
    color: #3760f7;
    background-color: #f0f5ff;
}

.el-dropdown-link.not-logged-in {
    color: #999;
}

/* 头像样式 */
.avatar {
    width: 35px;
    height: 35px;
    margin-right: 8px;
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    flex-shrink: 0;
    background-repeat: no-repeat;
}

/* 用户名 */
.username {
    margin-right: 6px;
    white-space: nowrap;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dropdown-icon {
    font-size: 12px;
    color: #909399;
    transition: transform 0.3s;
}

.el-dropdown-link:hover .dropdown-icon {
    transform: rotate(180deg);
    color: #3760f7;
}

/* 下拉菜单整体样式 */
:deep(.custom-dropdown-menu) {
    min-width: 160px;
    padding: 6px 0;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(55, 96, 247, 0.15);
    background-color: #fff;
}

:deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    line-height: 1.5;
    font-size: 14px;
    color: #606266;
    transition: background-color 0.3s, color 0.3s;
    cursor: pointer;
    user-select: none;
}

:deep(.el-dropdown-menu__item i) {
    margin-right: 8px;
    font-size: 16px;
    color: #909399;
    flex-shrink: 0;
}

:deep(.el-dropdown-menu__item:hover) {
    background-color: #f0f5ff;
    color: #3760f7;
}

:deep(.el-dropdown-menu__item:hover i) {
    color: #3760f7;
}

:deep(.logout-item) {
    color: #f56c6c;
}

:deep(.logout-item:hover) {
    color: #f56c6c;
    background-color: #fef0f0;
}

:deep(.login-item) {
    font-weight: 600;
}

:deep(.login-item:hover) {
    background-color: #e6f0ff;
    color: #409eff;
}
</style>