<template>
    <div class="home-table-container">
        <!-- 题库选择器 -->
        <div class="question-bank-selector">
            <span style="margin-right: 10px; font-weight: 500;">选择题库：</span>
            <el-select v-model="selectedQuestionBankId" placeholder="请选择题库" @change="handleQuestionBankChange"
                style="width: 300px;" clearable>
                <el-option v-for="bank in questionBanks" :key="bank.id" :label="bank.title" :value="String(bank.id)" />
            </el-select>
            <span v-if="questions.length > 0" style="margin-left: 15px; color: #909399;">
                共 {{ questions.length }} 道题目
            </span>
        </div>

        <!-- 题目表格 -->
        <Table :table-width="tableWidth" :questions="questions" :loading="loading" />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import Table from '@/components/shared/Table.vue';
import { getQuestionBankVOPage, type QuestionBankVO } from '@/apis/questionBankApi';
import { getQuestionListVO } from '@/apis/questionApi';

const props = defineProps({
    tableWidth: {
        type: Number,
        default: 900
    }
});

// 响应式数据
const questionBanks = ref<QuestionBankVO[]>([]);
const selectedQuestionBankId = ref<string>('');
const questions = ref<any[]>([]);
const loading = ref(false);

// 获取题库列表
const fetchQuestionBanks = async () => {
    try {
        let response = await getQuestionBankVOPage({
            current: 1,
            pageSize: 20
        });

        if (response.code === 0) {
            // 检查是否有分页数据
            if (response.data?.records) {
                questionBanks.value = response.data.records;
            } else {
                questionBanks.value = [];
                console.log('没有找到题库数据');
            }

            // 默认选择第一个题库
            if (questionBanks.value.length > 0) {
                selectedQuestionBankId.value = String(questionBanks.value[0].id);
            } else {
                ElMessage.warning('暂无可用题库');
            }
        } else {
            console.error('获取题库列表失败:', response);
            ElMessage.error(response.message || '获取题库列表失败');
        }
    } catch (error) {
        console.error('获取题库列表异常:', error);
        ElMessage.error('获取题库列表失败');
    }
};

// 获取指定题库的题目列表
const fetchQuestions = async (questionBankId: string) => {
    if (!questionBankId) {
        console.log('题库ID为空，跳过题目查询');
        return;
    }

    loading.value = true;
    try {
        const params = {
            current: 1,
            pageSize: 20,
            questionBankId: parseFloat(questionBankId)
        };

        // 验证转换结果
        if (isNaN(params.questionBankId)) {
            ElMessage.error('题库ID格式错误');
            return;
        }

        const response = await getQuestionListVO(params);

        if (response.code === 0) {
            let questionList = [];

            // 检查数据结构
            if (response.data?.records) {
                questionList = response.data.records;
            } else {
                console.log('没有找到题目数据，响应数据:', response.data);
            }

            // 转换数据格式以适配 Table 组件
            questions.value = questionList.map((item: any) => ({
                id: item.id,
                question: item.title || item.content || '未知题目',
                difficulty: item.difficulty || '未知',
                tags: Array.isArray(item.tagList) ? item.tagList :
                    typeof item.tags === 'string' ? item.tags.split(',').filter(Boolean) :
                        []
            }));

            if (questions.value.length === 0) {
                ElMessage.info('该题库暂无题目');
            }
        } else {
            ElMessage.error(response.message || '获取题目列表失败');
            questions.value = [];
        }
    } catch (error) {
        ElMessage.error('获取题目列表失败');
        questions.value = [];
    } finally {
        loading.value = false;
    }
};

// 处理题库选择变化
const handleQuestionBankChange = (questionBankId: string) => {
    fetchQuestions(questionBankId);
};

// 监听选中的题库变化
watch(selectedQuestionBankId, (newId) => {
    if (newId) {
        fetchQuestions(newId);
    }
});

// 组件挂载时获取数据
onMounted(() => {
    fetchQuestionBanks();
});
</script>

<style scoped>
.home-table-container {
    width: 100%;
}

.question-bank-selector {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    padding: 15px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.question-bank-selector .el-select {
    margin-right: 10px;
}
</style>