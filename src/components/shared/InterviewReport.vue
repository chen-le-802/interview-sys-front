<template>
    <div class="ai-assessment-container">
        <template v-if="hasData">
            <!-- 原有评估报告内容 -->
            <div class="assessment-header">
                <h1>AI面试综合评估报告</h1>
                <div class="overall-score">
                    <div class="score-circle">
                        <span class="score">{{ report.score }}</span>
                        <span class="score-label">综合得分</span>
                    </div>
                </div>
            </div>

            <div class="assessment-content">
                <!-- 候选人信息 -->
                <div class="info-card">
                    <h2 class="card-title">候选人信息</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">姓名：</span>
                            <span class="info-value">{{ report.candidate.name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">应聘职位：</span>
                            <span class="info-value">{{ report.candidate.position }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">面试时间：</span>
                            <span class="info-value">{{ report.candidate.time }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">面试时长：</span>
                            <span class="info-value">{{ report.candidate.duration }}</span>
                        </div>
                    </div>
                </div>

                <!-- 综合评估 -->
                <div class="assessment-card">
                    <h2 class="card-title">综合评估</h2>
                    <div class="assessment-summary">
                        <p>{{ report.summary }}</p>
                    </div>
                </div>

                <!-- 核心优势 -->
                <div class="strengths-card">
                    <h2 class="card-title">核心优势</h2>
                    <ul class="strength-list">
                        <li v-for="(strength, index) in report.strengths" :key="index" class="strength-item">
                            <div class="strength-icon">✓</div>
                            <div class="strength-content">
                                <h3>{{ strength.title }}</h3>
                                <p>{{ strength.description }}</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- 改进建议 -->
                <div class="improvements-card">
                    <h2 class="card-title">改进建议</h2>
                    <ul class="improvement-list">
                        <li v-for="(improvement, index) in report.improvements" :key="index" class="improvement-item">
                            <div class="improvement-icon">!</div>
                            <div class="improvement-content">
                                <h3>{{ improvement.title }}</h3>
                                <p>{{ improvement.description }}</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- 面试建议 -->
                <div class="recommendation-card">
                    <h2 class="card-title">面试建议</h2>
                    <div class="recommendation-content">
                        <p>{{ report.recommendation }}</p>
                        <div class="recommendation-tag">{{ report.recommendationTag }}</div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="no-data-container">
                <div class="no-data-content">
                    <div class="no-data-icon">
                        <InfoCircleOutlined style="font-size: 50px; color: #4F73F3;" />
                    </div>
                    <h2 class="no-data-title">暂无评估报告</h2>
                    <p class="no-data-desc">请先完成面试，系统将为您生成AI评估报告</p>
                    <button class="no-data-button" @click="refresh">刷新页面</button>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { InfoCircleOutlined } from '@ant-design/icons-vue';

interface StrengthItem {
    title: string;
    description: string;
}

interface ImprovementItem {
    title: string;
    description: string;
}

interface CandidateInfo {
    name: string;
    position: string;
    time: string;
    duration: string;
}

interface ReportData {
    score: number;
    candidate: CandidateInfo;
    summary: string;
    strengths: StrengthItem[];
    improvements: ImprovementItem[];
    recommendation: string;
    recommendationTag: string;
}

export default defineComponent({
    name: 'AiAssessment',
    components: {
        InfoCircleOutlined
    },
    setup() {
        // 控制是否有数据
        const hasData = ref(true); // 改为true以显示数据
        const report = ref<ReportData>({
  score: 0,
  candidate: {
    name: '',
    position: '',
    time: '',
    duration: ''
  },
  summary: '',
  strengths: [],
  improvements: [],
  recommendation: '',
  recommendationTag: ''
});

        const refresh = () => {
            console.log('刷新页面');
            // 这里可以添加刷新逻辑
        };

        // 加载mock数据
        onMounted(() => {
            report.value = {
                score: 86,
                candidate: {
                    name: "张明远",
                    position: "高级前端开发工程师",
                    time: "2023-06-15 14:30",
                    duration: "45分钟"
                },
                summary: "候选人展现了扎实的前端技术基础和丰富的项目经验，尤其在Vue和React框架的应用上有深入理解。沟通表达清晰，逻辑思维能力强，但在系统设计方面还有提升空间。整体表现优秀，符合高级前端开发工程师的要求。",
                strengths: [
                    {
                        title: "技术基础扎实",
                        description: "对JavaScript核心概念、ES6+新特性、CSS布局等有深入理解，能够熟练解决复杂的前端问题。"
                    },
                    {
                        title: "框架应用熟练",
                        description: "在Vue和React项目开发中展现了丰富的实战经验，熟悉组件化开发、状态管理等核心概念。"
                    },
                    {
                        title: "沟通表达能力强",
                        description: "能够清晰表达技术观点，回答问题逻辑性强，展现了良好的团队协作潜力。"
                    },
                    {
                        title: "学习能力强",
                        description: "对新技术保持关注，能够快速学习并应用到实际项目中，展示了持续学习的能力。"
                    }
                ],
                improvements: [
                    {
                        title: "系统设计能力",
                        description: "在大型前端架构设计方面经验稍显不足，建议加强微前端、性能优化等领域的实践。"
                    },
                    {
                        title: "测试覆盖意识",
                        description: "对单元测试和E2E测试的重视程度可以进一步提高，建议在项目中增加测试覆盖率。"
                    },
                    {
                        title: "技术深度拓展",
                        description: "可以进一步深入研究前端性能优化、WebAssembly等前沿技术，提升技术竞争力。"
                    }
                ],
                recommendation: "候选人整体表现优秀，技术能力和沟通能力都符合高级前端开发工程师的要求。建议进入下一轮技术面试，重点考察系统设计能力和项目架构经验。",
                recommendationTag: "推荐复试"
            };
        });

        return {
            hasData,
            report,
            refresh
        };
    }
});
</script>

<style scoped>
.ai-assessment-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 80%;
  height: 100%;
  overflow: auto;
  margin: 50px auto;
  padding: 20px;
  color: #333;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ai-assessment-container::-webkit-scrollbar {
  display: none;
}

/* 原有评估报告样式保持不变 */
.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e1e5eb;
}

.assessment-header h1 {
  color: #2c3e50;
  font-size: 24px;
  margin: 0;
}

.overall-score {
  display: flex;
  align-items: center;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #4F73F3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.score {
  font-size: 32px;
  font-weight: bold;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
}

.assessment-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.card-title {
  color: #3498db;
  font-size: 18px;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e1e5eb;
}

.info-card, .assessment-card, .strengths-card, .improvements-card, .recommendation-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
}

.info-label {
  font-weight: 600;
  color: #555;
  min-width: 80px;
}

.info-value {
  color: #333;
}

.assessment-summary p {
  line-height: 1.6;
  margin: 0;
}

.strength-list, .improvement-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.strength-item, .improvement-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.strength-item:last-child, .improvement-item:last-child {
  border-bottom: none;
}

.strength-icon {
  width: 24px;
  height: 24px;
  background-color: #e3f2fd;
  color: #2196f3;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.improvement-icon {
  width: 24px;
  height: 24px;
  background-color: #ffebee;
  color: #f44336;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.strength-content h3, .improvement-content h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.strength-content p, .improvement-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.recommendation-content {
  position: relative;
}

.recommendation-content p {
  margin: 0;
  line-height: 1.6;
}

.recommendation-tag {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #4caf50;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 新增的无数据样式 */
.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 140px);
  background-color: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.no-data-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.no-data-icon {
  margin-bottom: 24px;
  display: flex;
    justify-content: center;
    
}

.no-data-icon svg {
  width: 80px;
  height: 80px;

}

.no-data-title {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 12px;
  font-weight: 600;
}

.no-data-desc {
  color: #7f8c8d;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.no-data-button {
  background-color: #4F73F3;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.no-data-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.no-data-button:active {
  transform: translateY(0);
}
</style>