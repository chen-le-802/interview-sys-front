<template>
    <div class="page-container">
        <!-- 主内容区 -->
        <Header />
        <div class="main-content">

            <!-- 用户个人信息 -->
            <div class="content-wrapper">
                <!-- 返回按钮 -->
                <a-button class="back-button" @click="goBack">
                    <RollbackOutlined />
                </a-button>
                <!-- 个人信息卡片 -->
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="avatar-container">
                            <div class="avatar-wrapper">
                                <img class="avatar-image"
                                    src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" alt="头像">
                            </div>
                            <div class="user-info">
                                <h2 class="username">A</h2>
                                <p class="user-title">JAVA工程师</p>
                            </div>
                        </div>
                    </div>
                    <div class="profile-content">
                        <div class="stats-row">
                            <div class="stat-item">
                                <p class="stat-label">解题总数</p>
                                <p class="stat-value">1,248</p>
                            </div>
                            <div class="stat-item">
                                <p class="stat-label">连续刷题天数</p>
                                <p class="stat-value">46</p>
                            </div>
                            <div class="stat-item">
                                <p class="stat-label">排名</p>
                                <p class="stat-value stat-rank">#28</p>
                            </div>
                        </div>
                        <div class="activity-section">
                            <h3 class="section-subtitle">刷题记录</h3>
                            <div ref="heatmapRef" class="heatmap-container"></div>
                        </div>
                    </div>
                </div>

                <!-- 个人信息表单 -->
                <div class="info-form-card">
                    <h3 class="section-title">基本信息</h3>
                    <div class="form-grid">
                        <div class="form-column">
                            <label class="form-label">用户名</label>
                            <a-input v-model:value="userInfo.username" placeholder="请输入用户名" class="custom-input" />
                        </div>
                        <div class="form-column">
                            <label class="form-label">账号</label>
                            <a-input v-model:value="userInfo.email" placeholder="请输入账号" class="custom-input" />
                        </div>
                        <div class="form-full-width">
                            <label class="form-label">目标岗位</label>
                            <div class="job-selects">
                                <a-select v-model:value="userInfo.jobPosition" placeholder="选择岗位" class="custom-select">
                                    <a-select-option value="java">JAVA工程师</a-select-option>
                                    <a-select-option value="frontend">前端工程师</a-select-option>
                                    <a-select-option value="backend">后端工程师</a-select-option>
                                </a-select>
                                <a-select v-model:value="userInfo.option1" placeholder="选择选项" class="custom-select">
                                    <a-select-option value="none">无</a-select-option>
                                </a-select>
                                <a-select v-model:value="userInfo.option2" placeholder="选择选项" class="custom-select">
                                    <a-select-option value="none">无</a-select-option>
                                </a-select>
                            </div>
                        </div>
                        <div class="form-full-width">
                            <label class="form-label">个人简介</label>
                            <a-textarea v-model:value="userInfo.bio" :rows="4" placeholder="请输入个人简介"
                                class="custom-textarea" />
                        </div>
                    </div>
                    <div class="form-buttons">
                        <a-button class="cancel-button">取消</a-button>
                        <a-button type="primary" class="save-button">保存更改</a-button>
                    </div>
                </div>

                <!-- 安全设置 -->
                <div class="security-card">
                    <h3 class="section-title">安全设置</h3>
                    <div class="security-items">
                        <div class="security-item">
                            <div class="security-info">
                                <h4 class="security-title">修改密码</h4>
                                <p class="security-desc">定期更改密码以确保账号安全</p>
                            </div>
                            <a-button class="modify-button">修改</a-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import * as echarts from 'echarts';
import 'echarts/theme/macarons';
import { useRouter } from 'vue-router';
import "../components/manager/Header.vue";
import Header from '../components/manager/Header.vue';
import { RollbackOutlined } from '@ant-design/icons-vue';

const heatmapRef = ref(null);

const userInfo = reactive({
    username: 'A',
    email: 'A123@qq.com',
    jobPosition: 'java',
    option1: '无',
    option2: '无',
    bio: '有没有人能莫名其妙给我钱'
});

const router = useRouter();

function goBack() {
    router.back();
}

onMounted(() => {
    if (heatmapRef.value) {
        const heatmapChart = echarts.init(heatmapRef.value);
        const fixedDate = new Date('2024-01-01');
        const data = [];

        // 热力图数据模式
        const activityPattern = [
            [0, 1, 0, 1, 2, 3, 0, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2], // 1月
            [1, 2, 0, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0], // 2月
            [2, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1], // 3月
            [3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2], // 4月
            [0, 2, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 3, 1, 2, 0], // 5月
            [1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 1, 2, 0, 1, 3, 2, 0, 1, 2, 3, 0, 1, 2, 0, 1, 3], // 6月
            [2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2], // 7月
            [3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0], // 8月
            [0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1], // 9月
            [1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1], // 10月
            [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0], // 11月
            [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 2, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0], // 12月
        ];

        for (let month = 0; month < 12; month++) {
            const monthData = activityPattern[month];
            for (let day = 0; day < monthData.length; day++) {
                const currentDate = new Date(fixedDate);
                currentDate.setMonth(month);
                currentDate.setDate(day + 1);
                const value = monthData[day] * 3; // 将0-3的活动等级转换为0-9的显示值
                data.push([
                    echarts.format.formatTime('yyyy-MM-dd', currentDate),
                    value
                ]);
            }
        }

        heatmapChart.setOption({
            animation: false,
            tooltip: {
                position: 'top',
                formatter: function (params) {
                    return `${params.data[0]}: ${params.data[1]} 题`;
                }
            },
            visualMap: {
                show: false,
                min: 0,
                max: 9,
                inRange: {
                    color: ['#ebedf0', '#e2e8fd', '#bcc7fa', '#93a3f5', '#6474e5']
                }
            },
            calendar: {
                top: 50,
                left: 30,
                right: 30,
                cellSize: ['auto', 13],
                range: '2024',
                itemStyle: {
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                yearLabel: { show: false }
            },
            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data
            }
        });
    }
});
</script>

<style scoped>
@import "../assets/styles/PersonalCenter.css";
</style>