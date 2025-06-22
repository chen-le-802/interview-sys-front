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
import { defineComponent, computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowDown, User, Setting, SwitchButton, HomeFilled } from '@element-plus/icons-vue'
import { userLogout } from '@/apis/authApi'
import { 
  clearAuth, 
  getUserInfo, 
  isAdmin as checkIsAdmin, 
  verifyAuthStatus,
  getUserAvatarWithTimestamp
} from '@/utils/auth'

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
        // 用于重新渲染组件
        const refreshKey = ref(0)
        const verifyInterval = ref<number | null>(null)

        // 是否登录
        const isLoggedIn = computed(() => {
            // 强制组件重新计算
            refreshKey.value;
            return !!getUserInfo();
        })

        // 显示用户名，未登录显示"未登录"
        const displayUserName = computed(() => {
            // 强制组件重新计算
            refreshKey.value;
            const userInfo = getUserInfo();
            return userInfo?.userName || '未登录'
        })

        // 使用带时间戳的头像URL
        const userAvatar = computed(() => {
            // 强制组件重新计算
            refreshKey.value;
            return getUserAvatarWithTimestamp();
        })

        // 是否管理员
        const isAdmin = computed(() => {
            // 强制组件重新计算
            refreshKey.value;
            return checkIsAdmin();
        })

        // 判断当前是否处于后台路由
        const isAdminRoute = computed(() => route.path.startsWith('/admin'))

        // 设置定期验证
        const setupAuthVerification = () => {
            // 清除现有定时器
            if (verifyInterval.value) {
                clearInterval(verifyInterval.value);
            }
            
            // 延长验证间隔，减少频繁验证
            verifyInterval.value = window.setInterval(async () => {
                // 只有在登录状态下且不在登录页面才验证
                if (isLoggedIn.value && route.path !== '/login' && route.path !== '/register') {
                    try {
                        const isValid = await verifyAuthStatus(true);
                        if (isValid) {
                            refreshKey.value++;
                        } else {
                            ElMessage.warning('登录已过期，请重新登录');
                            clearAuth();
                            refreshKey.value++;
                        }
                    } catch (error) {
                        clearAuth();
                        refreshKey.value++;
                    }
                }
            }, 5 * 60 * 1000); // 改为5分钟验证一次
        }

        onMounted(async () => {
            // 延迟初始验证，避免与登录流程冲突
            setTimeout(async () => {
                if (isLoggedIn.value && route.path !== '/login' && route.path !== '/register') {
                    try {
                        await verifyAuthStatus(true);
                        refreshKey.value++;
                    } catch (error) {
                        clearAuth();
                        refreshKey.value++;
                    }
                }
            }, 2000); // 延迟2秒
            
            // 设置定期验证
            setupAuthVerification();
            
            // 监听窗口焦点事件，当用户重新回到页面时验证
            window.addEventListener('focus', handleWindowFocus);
        });

        // 组件卸载时清除定时器和事件监听
        onBeforeUnmount(() => {
            if (verifyInterval.value) {
                clearInterval(verifyInterval.value);
            }
            window.removeEventListener('focus', handleWindowFocus);
        });

        // 优化窗口焦点验证
        const handleWindowFocus = async () => {
            // 避免在登录页面验证
            if (isLoggedIn.value && route.path !== '/login' && route.path !== '/register') {
                try {
                    const isValid = await verifyAuthStatus(true);
                    if (isValid) {
                        refreshKey.value++;
                    } else {
                        clearAuth();
                        refreshKey.value++;
                    }
                } catch (error) {
                    clearAuth();
                    refreshKey.value++;
                }
            }
        };

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
                    // 即使API调用失败，也清除本地状态
                }

                // 清除本地登录状态
                clearAuth()
                // 更新组件状态
                refreshKey.value++;

                setTimeout(() => {
                    ElMessage.success('退出成功')
                    window.location.href = '/login'
                }, 100)
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('退出失败，请重试')
                }
            } finally {
                loading.value = false
            }
        }

        // 刷新组件
        const refreshComponent = () => {
            refreshKey.value++;
        }

        return {
            displayUserName,
            userAvatar,
            isAdmin,
            isLoggedIn,
            isAdminRoute,
            handleCommand,
            handleLogout,
            loading,
            refreshComponent
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