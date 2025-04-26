<template>
    <el-dropdown @command="handleCommand" trigger="click" class="user-dropdown">
        <span class="el-dropdown-link">
            {{ userInfo?.userName || '用户' }}
            <el-icon class="dropdown-icon">
                <arrow-down />
            </el-icon>
        </span>
        <template #dropdown>
            <el-dropdown-menu class="custom-dropdown-menu">
                <el-dropdown-item v-if="isAdmin" command="admin">
                    <el-icon><setting /></el-icon>
                    <span>管理后台</span>
                </el-dropdown-item>
                
                <el-dropdown-item command="personal">
                    <el-icon><user /></el-icon>
                    <span>个人主页</span>
                </el-dropdown-item>
                
                <el-dropdown-item divided command="logout" class="logout-item">
                    <el-icon><switch-button /></el-icon>
                    <span>退出登录</span>
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { ArrowDown, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userLogout } from '@/apis/authApi'
import { clearAuth, getUserInfo, isAdmin as checkIsAdmin } from '@/utils/auth'
import router from '@/router'

export default defineComponent({
    name: 'LogoutComponent',
    components: {
        ArrowDown,
        User,
        Setting,
        SwitchButton
    },
    setup() {
        const userInfo = computed(() => getUserInfo())
        const loading = ref(false)
        const isAdmin = computed(() => checkIsAdmin())

        const handleCommand = async (command: string) => {
            switch (command) {
                case 'logout':
                    handleLogout()
                    break
                case 'personal':
                    router.push('/personal')
                    break
                case 'admin':
                    router.push('/admin/home')
                    break
            }
        }

        const handleLogout = async () => {
            try {
                await ElMessageBox.confirm(
                    '确定要退出登录吗？',
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                )

                loading.value = true

                try {
                    // 调用登出接口
                    await userLogout()
                } catch (err) {
                    console.error('登出API调用失败，但会继续清除本地状态', err)
                }

                // 清除本地存储
                clearAuth()

                // 使用setTimeout确保状态清除完全生效
                setTimeout(() => {
                    ElMessage({
                        type: 'success',
                        message: '退出成功'
                    })
                    
                    // 使用强制导航，完全刷新路由状态
                    window.location.href = '/login'
                }, 100)
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('登出失败:', error)
                    ElMessage({
                        type: 'error',
                        message: '退出失败，请重试'
                    })
                }
            } finally {
                loading.value = false
            }
        }

        return {
            userInfo,
            loading,
            isAdmin,
            handleCommand,
            handleLogout
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
}

.el-dropdown-link:hover {
    color: #3760f7;
}

.dropdown-icon {
    margin-left: 6px;
    font-size: 12px;
    color: #909399;
    transition: transform 0.3s;
}

.el-dropdown-link:hover .dropdown-icon {
    transform: rotate(180deg);
    color: #3760f7;
}

/* 下拉菜单样式 */
:deep(.custom-dropdown-menu) {
    min-width: 140px;
    padding: 5px 0;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    line-height: 1.5;
    font-size: 14px;
}

:deep(.el-dropdown-menu__item i) {
    margin-right: 8px;
    font-size: 16px;
}

:deep(.el-dropdown-menu__item:hover) {
    background-color: #f5f7fa;
}

:deep(.logout-item) {
    color: #f56c6c;
}

:deep(.logout-item:hover) {
    color: #f56c6c;
    background-color: #fef0f0;
}
</style>