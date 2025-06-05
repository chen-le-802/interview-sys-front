<template>
    <div class="home-table-container">
        <!-- 题库选择器 -->
        <div class="question-bank-selector">
            <span style="margin-right: 10px; font-weight: 500;">选择题库：</span>
            <el-select v-model="selectedQuestionBankId" placeholder="请选择题库" @change="handleQuestionBankChange"
                style="width: 300px;" clearable>
                <el-option label="全部题库" value="" />
                <el-option v-for="bank in questionBanks" :key="bank.id" :label="bank.title" :value="bank.id" />
            </el-select>

            <span v-if="totalQuestions >= 0" style="margin-left: 15px; color: #909399;">
                共 {{ totalQuestions }} 道题目
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
import { getQuestionBankList, type QuestionBankVO } from '@/apis/questionBankApi';
import { getQuestionListVO, getQuestionVOById, type QuestionQueryParams } from '@/apis/questionApi';
import { getQuestionsByBankId } from '@/apis/questionBankQuestionApi';

const props = defineProps({
    tableWidth: {
        type: Number,
        default: 900
    }
});

// 响应式数据
const questionBanks = ref<QuestionBankVO[]>([]);
const selectedQuestionBankId = ref<string>('');
const questions = ref<
    { id: string; question: string; difficulty: string; tags: string[] }[]
>([]);
const loading = ref(false);
const totalQuestions = ref(0);

// 获取题库列表
const fetchQuestionBanks = async () => {
    try {
        const response = await getQuestionBankList();

        if (response.code === 0 && Array.isArray(response.data)) {
            questionBanks.value = response.data.map((item: any) => ({
                id: String(item.id),
                title: item.title,
                description: item.description || '',
                picture: item.picture || '',
                createTime: item.createTime || '',
                updateTime: item.updateTime || '',
                user: item.user || { id: '', userName: '', userAvatar: '' },
                userId: String(item.userId || '')
            }));
        } else {
            console.error('获取题库列表失败，后端返回：', response);
            ElMessage.error(response.message || '获取题库列表失败（返回格式不正确）');
            questionBanks.value = [];
        }
    } catch (err: any) {
        console.error('获取题库列表异常：', err);
        ElMessage.error('获取题库列表失败，请检查网络或稍后重试');
        questionBanks.value = [];
    }
};

// 获取指定题库的题目列表
const fetchQuestions = async () => {
    loading.value = true;

    try {
        if (selectedQuestionBankId.value) {
            // 选择了特定题库 - 使用题库题目关联接口
            await fetchQuestionsByBankId();
        } else {
            // 未选择题库 - 获取所有题目
            await fetchAllQuestions();
        }
    } catch (err: any) {
        console.error('获取题目列表异常：', err);
        ElMessage.error('获取题目列表失败，请稍后重试');
        questions.value = [];
        totalQuestions.value = 0;
    } finally {
        loading.value = false;
    }
};

// 获取指定题库下的题目
const fetchQuestionsByBankId = async () => {
    try {
        // 使用题库题目关联接口获取题库下的题目关联
        const relationResponse = await getQuestionsByBankId(selectedQuestionBankId.value, {
            current: 1,
            pageSize: 100 // 先获取较多数据，后续可以优化分页
        });
        
        if (relationResponse.code === 0 && relationResponse.data && Array.isArray(relationResponse.data.records)) {
            const relations = relationResponse.data.records;
            totalQuestions.value = relationResponse.data.total || relations.length;
            
            if (relations.length === 0) {
                questions.value = [];
                ElMessage.info('该题库暂无题目');
                return;
            }
            
            // 获取所有题目的详细信息
            const questionPromises = relations.map((relation: any) => 
                getQuestionVOById(String(relation.questionId))
            );
            
            const questionResponses = await Promise.all(questionPromises);
            
            // 处理题目数据
            const validQuestions = questionResponses
                .filter(response => response.code === 0 && response.data)
                .map(response => {
                    const item = response.data;
                    // 标签解析：优先使用 item.tagList 数组，否则从 item.tags 字符串拆分
                    let tagArray: string[] = [];
                    if (Array.isArray(item.tagList)) {
                        tagArray = item.tagList;
                    } else if (typeof item.tags === 'string') {
                        tagArray = item.tags
                            .replace(/[\[\]"]/g, '')
                            .split(',')
                            .map((t: string) => t.trim())
                            .filter((t: string) => !!t);
                    }
                    
                    return {
                        id: String(item.id),
                        question: item.title || item.content || '未知题目',
                        difficulty: item.difficulty || '未知',
                        tags: tagArray
                    };
                });
            
            questions.value = validQuestions;
            
            if (validQuestions.length === 0) {
                ElMessage.info('该题库中的题目信息获取失败');
            }
            
        } else {
            console.error('获取题库题目关联失败，后端返回：', relationResponse);
            ElMessage.error(relationResponse.message || '获取题库题目失败');
            questions.value = [];
            totalQuestions.value = 0;
        }
        
    } catch (err: any) {
        console.error('获取题库题目异常：', err);
        throw err;
    }
};

// 获取所有题目
const fetchAllQuestions = async () => {
    const params: QuestionQueryParams = {
        current: 1,
        pageSize: 20
    };

    try {
        const response = await getQuestionListVO(params);

        if (response.code === 0 && response.data && Array.isArray(response.data.records)) {
            const rawList = response.data.records;
            totalQuestions.value = typeof response.data.total === 'number'
                ? response.data.total
                : rawList.length;

            // 把后端的数据映射为 Table 组件能识别的格式
            questions.value = rawList.map((item: any) => {
                // 标签解析：优先使用 item.tagList 数组，否则从 item.tags 字符串拆分
                let tagArray: string[] = [];
                if (Array.isArray(item.tagList)) {
                    tagArray = item.tagList;
                } else if (typeof item.tags === 'string') {
                    tagArray = item.tags
                        .replace(/[\[\]"]/g, '')
                        .split(',')
                        .map((t: string) => t.trim())
                        .filter((t: string) => !!t);
                }
                return {
                    id: String(item.id),
                    question: item.title || item.content || '未知题目',
                    difficulty: item.difficulty || '未知',
                    tags: tagArray
                };
            });

            if (questions.value.length === 0) {
                ElMessage.info('暂无题目');
            }
        } else {
            console.error('获取题目列表失败，后端返回：', response);
            ElMessage.error(response.message || '获取题目列表失败（返回格式不正确）');
            questions.value = [];
            totalQuestions.value = 0;
        }
    } catch (err: any) {
        console.error('获取所有题目异常：', err);
        throw err;
    }
};

// 处理题库选择变化
const handleQuestionBankChange = () => {
    fetchQuestions();
};

// 监听选中的题库变化
watch(selectedQuestionBankId, () => {
    fetchQuestions();
});

// 组件挂载时获取数据
onMounted(async () => {
    await fetchQuestionBanks();
    fetchQuestions();
});
</script>

<style scoped>
.home-table-container {
  
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