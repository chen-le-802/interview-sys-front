<template>
    <div class="dashboard">
      <div class="data-cards">
        <div v-for="(card, index) in dataCards" :key="index" class="card">
          <div class="card-header">
            <span>{{ card.label }}</span>
            <component :is="card.icon" class="icon" />
          </div>
          <div class="card-value">{{ card.value }}</div>
          <div class="trend">
            <span :class="card.trend >= 0 ? 'positive' : 'negative'">
              <span class="trend-text">较昨日</span>
              {{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%
            </span>
          </div>
        </div>
      </div>
      <!-- 图表区域 -->
      <div class="charts">
        <div class="chart">
          <h3>近30天做题热度趋势</h3>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
        <div class="chart">
          <h3>题目分类分布</h3>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>
      <!-- 排行榜 -->
      <div class="rankings">
        <div class="ranking">
          <h3>热门题目排行</h3>
          <div v-for="(item, index) in hotProblems" :key="index" class="ranking-item">
            <span :class="index < 3 ? 'top' : 'normal'">{{ index + 1 }}</span>
            <span>{{ item.title }}</span>
            <div class="times">
              <span>{{ item.count }}次提交</span>
            </div>
          </div>
        </div>
        <div class="ranking">
          <h3>活跃用户排行</h3>
          <div v-for="(user, index) in activeUsers" :key="index" class="ranking-item">
            <span :class="index < 3 ? 'top' : 'normal'">{{ index + 1 }}</span>
            <a-avatar :src="user.avatar" />
            <span>{{ user.name }}</span>
            <div class="times">
              <span>{{ user.solved }}题</span>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { FileTextOutlined, UserOutlined, CarryOutOutlined, TeamOutlined} from '@ant-design/icons-vue';

const trendChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);

const dataCards = [
  { label: '总题目数', value: '2,846', trend: 5.2, icon: FileTextOutlined },
  { label: '用户数', value: '14,324', trend: 8.1, icon: UserOutlined },
  { label: '今日活跃用户数', value: '3,672', trend: -2.4, icon: TeamOutlined },
  { label: '平均答题正确率', value: '78.5%', trend: 2.3, icon: CarryOutOutlined },
];
const hotProblems = [
  { title: 'JVM内存模型详解', count: 2451 },
  { title: 'Spring IOC原理', count: 2187 },
  { title: '分布式事务解决方案', count: 1923 },
  { title: 'Linux常用命令', count: 1766 },
  { title: 'Docker核心概念', count: 1654 },
];
const activeUsers = [
  { name: '01', solved: 328, avatar:'@/assets/images/common/avatar.png'},
  { name: '02', solved: 312, avatar:'@/assets/images/common/avatar.png'},
  { name: '03', solved: 289, avatar:'@/assets/images/common/avatar.png'},
  { name: '04', solved: 276, avatar:'@/assets/images/common/avatar.png'},
  { name: '05', solved: 245, avatar:'@/assets/images/common/avatar.png'},
];
onMounted(() => {
  if (trendChartRef.value) {
    const trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000 + 500)),
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.1,
          },
          lineStyle: {
            width: 3,
          },
        },
      ],
    });
  }

  if (pieChartRef.value) {
    const pieChart = echarts.init(pieChartRef.value);
    pieChart.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          data: [
            { value: 856, name: '操作系统' },
            { value: 742, name: '计算机网络' },
            { value: 635, name: '数据库' },
            { value: 528, name: 'Java' },
            { value: 425, name: '分布式系统' },
            { value: 320, name: '设计模式' },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
  }
});
</script>

<style scoped>
@import '../../assets/styles/manager/Dashboard.css';
</style>