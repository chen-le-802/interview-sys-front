<template>
    <div class="title-box">
        <div class="bank-logo" :style="questionBank.picture ? `background-image: url(${questionBank.picture})` : ''">
        </div>
        <div class="bank-info">
            <div class="bank-name">{{ questionBank.title || '这里是题库标题' }}</div>
            <div class="bank-desc">{{ questionBank.description || '这里是题库描述' }}</div>
            <div class="options">
                <el-button type="primary" size="default" color="#1677ff" round @click="gotoQuestion()"
                    :loading="gotoQuestionLoading">
                    开始刷题
                </el-button>
                <el-button type="default" size="default" round @click="gotoExam" :loading="gotoExamLoading">
                    <el-icon style="margin-right: 5px;">
                        <DocumentChecked />
                    </el-icon>在线测试
                </el-button>
                <el-button type="default" size="default" round>
                    <el-icon style="margin-right: 5px;">
                        <Share />
                    </el-icon>分享
                </el-button>
            </div>
        </div>
    </div>
    <div class="table-box">
        <Table :tableWidth="1200" :questions="questions" :loading="loading" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { DocumentChecked, Share } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getQuestionBankVOById, type QuestionBankVO, type QuestionVO } from '@/apis/questionBankApi';
import { getQuestionVOById } from '@/apis/questionApi';
import { getChoiceQuestionsByQuestionId, type ChoiceQuestion } from '@/apis/choiceQuestionApi';
import { getQuestionsByBankId } from '@/apis/questionBankQuestionApi';
import Table from '@/components/shared/Table.vue';
import router from '@/router';

const props = defineProps<{
    bankId: string;
}>();

const questionBank = ref<Partial<QuestionBankVO>>({});

// 存放映射后的题目数据，传给 Table 组件
const questions = ref<
    {
        id: string;
        question: string;
        difficulty: string;
        tags: string[];
    }[]
>([]);

const loading = ref(false);
const gotoQuestionLoading = ref(false);
const gotoExamLoading = ref(false);

const fetchQuestionBankDetail = async () => {
    if (!props.bankId) {
        questions.value = [];
        questionBank.value = {};
        return;
    }

    loading.value = true;
    try {
        const response = await getQuestionBankVOById(props.bankId);
        if (response.code === 0 && response.data) {
            questionBank.value = response.data;

            // 取出后端返回的 questions 数组
            const voQuestions: QuestionVO[] = response.data.questions || [];

            // 把 QuestionVO 数组映射成 Table 组件需要的格式
            questions.value = voQuestions.map((q) => {
                // 解析 tagList / tags
                let tagArray: string[] = [];
                if (Array.isArray(q.tagList)) {
                    tagArray = q.tagList;
                } else if (typeof q.tags === 'string') {
                    tagArray = q.tags
                        .replace(/[\[\]"]/g, '')
                        .split(',')
                        .map((t) => t.trim())
                        .filter((t) => !!t);
                }

                return {
                    id: q.id,
                    question: q.title || q.content || '（无题目标题）',
                    difficulty: q.difficulty || '未知',
                    tags: tagArray
                };
            });
        } else {
            ElMessage.error(`获取题库详情失败: ${response.message}`);
            questions.value = [];
        }
    } catch (err) {
        console.error('获取题库详情异常:', err);
        ElMessage.error('网络请求失败，请稍后重试');
        questions.value = [];
    } finally {
        loading.value = false;
    }
};

// 监听当 bankId 改变时，重新拉取"题库详情+题目列表"
watch(
    () => props.bankId,
    (newId) => {
        if (newId) {
            fetchQuestionBankDetail();
        } else {
            questionBank.value = {};
            questions.value = [];
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (props.bankId) {
        fetchQuestionBankDetail();
    }
});

// 开始刷题
const gotoQuestion = async () => {
    if (!props.bankId) {
        ElMessage.warning('请先选择题库');
        return;
    }

    gotoQuestionLoading.value = true;
    try {
        // 获取题库中的所有题目关联
        const response = await getQuestionsByBankId(props.bankId, {
            pageSize: 1000
        });

        if (response.code === 0 && response.data?.records?.length > 0) {
            // 随机选择一道题目
            const questionRelations = response.data.records;
            const randomIndex = Math.floor(Math.random() * questionRelations.length);
            const randomRelation = questionRelations[randomIndex];

            // 跳转到题目详情页面，同时传递题库ID用于导航
            router.push({
                path: `/question/${randomRelation.questionId}`,
                query: {
                    bankId: props.bankId
                }
            });
        } else {
            ElMessage.warning('该题库暂无题目');
        }
    } catch (error) {
        console.error('获取题目失败:', error);
        ElMessage.error('获取题目失败，请稍后重试');
    } finally {
        gotoQuestionLoading.value = false;
    }
};

// 在线测试 - 筛选选择题并随机选择20道
const gotoExam = async () => {
    if (!props.bankId) {
        ElMessage.warning('请先选择题库');
        return;
    }

    gotoExamLoading.value = true;
    try {
        // 获取题库中的所有题目关联
        const response = await getQuestionsByBankId(props.bankId, {
            pageSize: 1000
        });

        if (response.code === 0 && response.data?.records?.length > 0) {
            const questionRelations = response.data.records;

            // 获取每个题目的详细信息和选择题信息
            const choiceQuestions = [];
            ElMessage.info('正在为您准备题目，请稍候...');

            for (const relation of questionRelations) {
                try {
                    // 获取题目详细信息
                    const questionResponse = await getQuestionVOById(relation.questionId);
                    if (questionResponse.code !== 0) {
                        continue;
                    }

                    const questionDetail = questionResponse.data;

                    // 获取选择题信息
                    const choiceResponse = await getChoiceQuestionsByQuestionId(relation.questionId);
                    if (choiceResponse.code === 0 && choiceResponse.data?.length > 0) {
                        // 将题目信息和选择题信息合并
                        choiceQuestions.push({
                            questionId: relation.questionId,
                            questionTitle: questionDetail.title || questionDetail.content,
                            questionDifficulty: questionDetail.difficulty,
                            questionTags: questionDetail.tags,
                            choiceDetails: choiceResponse.data[0] // 取第一个选择题
                        });
                    }
                } catch (error) {
                    console.error(`获取题目${relation.questionId}的信息失败:`, error);
                    // 继续处理下一个题目，不中断流程
                }
            }

            if (choiceQuestions.length === 0) {
                ElMessage.warning('该题库暂无选择题，无法进行在线测试');
                return;
            }

            // 随机选择20道题目（如果不足20道则全部选择）
            const shuffled = choiceQuestions.sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffled.slice(0, Math.min(20, choiceQuestions.length));

            // 将题目数据存储到sessionStorage
            sessionStorage.setItem('examQuestions', JSON.stringify(selectedQuestions));
            sessionStorage.setItem('examBankTitle', questionBank.value.title || '在线测验');
            sessionStorage.setItem('examBankId', props.bankId);

            ElMessage.success(`已筛选出${selectedQuestions.length}道选择题`);

            // 跳转到考试页面
            router.push('/exam');
        } else {
            ElMessage.warning('该题库暂无题目');
        }
    } catch (error) {
        console.error('获取题目失败:', error);
        ElMessage.error('获取题目失败，请稍后重试');
    } finally {
        gotoExamLoading.value = false;
    }
};
</script>

<style lang="css" scoped>
.title-box {
    display: flex;
    align-items: center;
    width: 1144px;
    height: 181px;
    margin: 32px auto;
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
}

.title-box .bank-logo {
    width: 100px;
    height: 100px;
    background-color: antiquewhite;
    background: url(../../assets/images/icon/default.png);
    background-size: contain;
    background-repeat: no-repeat;
}

.title-box .bank-info {
    margin-left: 30px;
    height: 141px;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
}

.title-box .bank-info .bank-name {
    height: 40px;
    font-size: 30px;
    font-weight: bold;
}

.title-box .bank-info .options {
    display: flex;
    align-items: center;
    height: 24px;
}

.table-box {
    width: 1141px;
    margin: 0 auto;
}
</style>