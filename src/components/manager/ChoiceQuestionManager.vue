<template>
    <div class="choice-question-manager">
        <!-- 操作栏 -->
        <div class="choice-actions" v-if="!readonly">
            <a-button type="primary" @click="showAddModal" :loading="loading">
                <PlusOutlined />新增选择题
            </a-button>
            <div class="choice-count-info">
                <span>当前选择题数量：</span>
                <span class="count-number">{{ choiceQuestions.length }}</span>
            </div>
        </div>

        <!-- 选择题列表 -->
        <div class="choice-list">
            <a-spin :spinning="loading">
                <div v-if="choiceQuestions.length === 0" class="empty-state">
                    <a-empty description="暂无选择题" />
                </div>

                <div v-else class="choice-cards">
                    <transition-group name="choice-card" tag="div">
                        <div v-for="(choice, index) in choiceQuestions" :key="choice.id" class="choice-card">
                            <div class="choice-header">
                                <div class="choice-title">
                                    <span class="choice-index">{{ index + 1 }}</span>
                                    <span class="choice-topic">{{ choice.topic }}</span>
                                </div>
                                <div class="choice-actions-btn" v-if="!readonly">
                                    <a-button type="text" @click="showEditModal(choice)" size="small">
                                        <EditOutlined />编辑
                                    </a-button>
                                    <a-button type="text" danger @click="handleDelete(choice)" size="small">
                                        <DeleteOutlined />删除
                                    </a-button>
                                </div>
                            </div>

                            <div class="choice-options">
                                <div v-for="option in ['a', 'b', 'c', 'd']" :key="option" class="choice-option"
                                    :class="{ 'correct-answer': choice.answer === option }">
                                    <span class="option-label">{{ option.toUpperCase() }}.</span>
                                    <span class="option-content">{{ choice[option as keyof ChoiceQuestion] }}</span>
                                    <CheckCircleOutlined v-if="choice.answer === option" class="correct-icon" />
                                </div>
                            </div>

                            <div v-if="choice.answerAnalysis" class="answer-analysis">
                                <div class="analysis-label">
                                    <BulbOutlined class="analysis-icon" />
                                    答案解析：
                                </div>
                                <div class="analysis-content">{{ choice.answerAnalysis }}</div>
                            </div>

                            <div v-if="choice.knowledgeTags && choice.knowledgeTags.length > 0" class="knowledge-tags">
                                <div class="tags-label">
                                    <TagsOutlined class="tags-icon" />
                                    知识标签：
                                </div>
                                <div class="tags-content">
                                    <span v-for="tag in choice.knowledgeTags" :key="tag" class="knowledge-tag">
                                        {{ tag }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </transition-group>
                </div>
            </a-spin>
        </div>

        <!-- 新增选择题模态框 -->
        <a-modal v-model:visible="addModalVisible" title="新增选择题" @ok="handleAddChoice" @cancel="handleCancelAdd"
            :confirm-loading="addLoading" width="700px" :maskClosable="false">
            <a-form :model="addForm" :rules="formRules" ref="addFormRef" :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }">
                <a-form-item label="题目内容" name="topic">
                    <a-textarea v-model:value="addForm.topic" placeholder="请输入选择题题目内容" :rows="2" />
                </a-form-item>

                <a-form-item label="选项A" name="a">
                    <a-input v-model:value="addForm.a" placeholder="请输入选项A内容" />
                </a-form-item>

                <a-form-item label="选项B" name="b">
                    <a-input v-model:value="addForm.b" placeholder="请输入选项B内容" />
                </a-form-item>

                <a-form-item label="选项C" name="c">
                    <a-input v-model:value="addForm.c" placeholder="请输入选项C内容" />
                </a-form-item>

                <a-form-item label="选项D" name="d">
                    <a-input v-model:value="addForm.d" placeholder="请输入选项D内容" />
                </a-form-item>

                <a-form-item label="正确答案" name="answer">
                    <a-select v-model:value="addForm.answer" placeholder="请选择正确答案">
                        <a-select-option value="a">A</a-select-option>
                        <a-select-option value="b">B</a-select-option>
                        <a-select-option value="c">C</a-select-option>
                        <a-select-option value="d">D</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="答案解析" name="answerAnalysis">
                    <a-textarea v-model:value="addForm.answerAnalysis" placeholder="请输入答案解析（可选）" :rows="3" />
                </a-form-item>

                <a-form-item label="知识标签" name="knowledgeTagsInput">
                    <a-input v-model:value="addForm.knowledgeTagsInput" placeholder="请输入知识标签，多个标签用逗号分隔（可选）" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 编辑选择题模态框 -->
        <a-modal v-model:visible="editModalVisible" title="编辑选择题" @ok="handleEditChoice" @cancel="handleCancelEdit"
            :confirm-loading="editLoading" width="700px" :maskClosable="false">
            <a-form :model="editForm" :rules="formRules" ref="editFormRef" :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }">
                <a-form-item label="题目内容" name="topic">
                    <a-textarea v-model:value="editForm.topic" placeholder="请输入选择题题目内容" :rows="2" />
                </a-form-item>

                <a-form-item label="选项A" name="a">
                    <a-input v-model:value="editForm.a" placeholder="请输入选项A内容" />
                </a-form-item>

                <a-form-item label="选项B" name="b">
                    <a-input v-model:value="editForm.b" placeholder="请输入选项B内容" />
                </a-form-item>

                <a-form-item label="选项C" name="c">
                    <a-input v-model:value="editForm.c" placeholder="请输入选项C内容" />
                </a-form-item>

                <a-form-item label="选项D" name="d">
                    <a-input v-model:value="editForm.d" placeholder="请输入选项D内容" />
                </a-form-item>

                <a-form-item label="正确答案" name="answer">
                    <a-select v-model:value="editForm.answer" placeholder="请选择正确答案">
                        <a-select-option value="a">A</a-select-option>
                        <a-select-option value="b">B</a-select-option>
                        <a-select-option value="c">C</a-select-option>
                        <a-select-option value="d">D</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="答案解析" name="answerAnalysis">
                    <a-textarea v-model:value="editForm.answerAnalysis" placeholder="请输入答案解析（可选）" :rows="3" />
                </a-form-item>

                <a-form-item label="知识标签" name="knowledgeTagsInput">
                    <a-input v-model:value="editForm.knowledgeTagsInput" placeholder="请输入知识标签，多个标签用逗号分隔（可选）" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, BulbOutlined, TagsOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
import { type ChoiceQuestion, type AddChoiceQuestionParams, type UpdateChoiceQuestionParams, addChoiceQuestion, getChoiceQuestionsByQuestionId, updateChoiceQuestion, deleteChoiceQuestion } from '@/apis/choiceQuestionApi';

// Props定义
interface Props {
    questionId: string;
    readonly?: boolean;
}

// Emits定义
interface Emits {
    (e: 'choice-count-change', count: number): void;
}

const props = withDefaults(defineProps<Props>(), {
    readonly: false
});

const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref<boolean>(false);
const choiceQuestions = ref<ChoiceQuestion[]>([]);

// 新增相关
const addModalVisible = ref<boolean>(false);
const addLoading = ref<boolean>(false);
const addFormRef = ref<FormInstance>();

// 编辑相关
const editModalVisible = ref<boolean>(false);
const editLoading = ref<boolean>(false);
const editFormRef = ref<FormInstance>();

// 新增表单
const addForm = reactive<AddChoiceQuestionParams & { knowledgeTagsInput: string }>({
    topic: '',
    a: '',
    b: '',
    c: '',
    d: '',
    answer: 'a',
    answerAnalysis: '',
    knowledgeTags: [],
    knowledgeTagsInput: '',
    questionId: props.questionId
});

// 编辑表单
const editForm = reactive<UpdateChoiceQuestionParams & { knowledgeTagsInput: string }>({
    id: '',
    topic: '',
    a: '',
    b: '',
    c: '',
    d: '',
    answer: 'a',
    answerAnalysis: '',
    knowledgeTags: [],
    knowledgeTagsInput: '',
});

// 表单验证规则
const formRules: Record<string, Rule[]> = {
    topic: [
        { required: true, message: '请输入题目内容', trigger: 'blur' },
        { min: 5, message: '题目内容至少5个字符', trigger: 'blur' }
    ],
    a: [{ required: true, message: '请输入选项A内容', trigger: 'blur' }],
    b: [{ required: true, message: '请输入选项B内容', trigger: 'blur' }],
    c: [{ required: true, message: '请输入选项C内容', trigger: 'blur' }],
    d: [{ required: true, message: '请输入选项D内容', trigger: 'blur' }],
    answer: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
};

// 将字符串转换为标签数组
const parseTagsInput = (input: string): string[] => {
    if (!input || !input.trim()) return [];
    return input.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
};

// 将标签数组转换为字符串
const tagsToString = (tags?: string[]): string => {
    if (!tags || tags.length === 0) return '';
    return tags.join(', ');
};

// 获取选择题列表
const fetchChoiceQuestions = async () => {
    if (!props.questionId) return;

    try {
        loading.value = true;
        const response = await getChoiceQuestionsByQuestionId(props.questionId);

        if (response.code === 0) {
            choiceQuestions.value = (response.data || []).map((item: any) => ({
                id: String(item.id),
                topic: item.topic,
                a: item.a,
                b: item.b,
                c: item.c,
                d: item.d,
                answer: item.answer,
                answerAnalysis: item.answerAnalysis,
                knowledgeTags: item.knowledgeTags || [],
                questionId: String(item.questionId)
            }));

            // 发送数量变化事件
            emit('choice-count-change', choiceQuestions.value.length);
        } else {
            message.error(response.message || '获取选择题列表失败');
        }
    } catch (error) {
        console.error('获取选择题列表失败:', error);
        message.error('获取选择题列表失败');
    } finally {
        loading.value = false;
    }
};

// 显示新增模态框
const showAddModal = () => {
    // 重置表单
    addForm.topic = '';
    addForm.a = '';
    addForm.b = '';
    addForm.c = '';
    addForm.d = '';
    addForm.answer = 'a';
    addForm.answerAnalysis = '';
    addForm.knowledgeTags = [];
    addForm.knowledgeTagsInput = '';
    addForm.questionId = props.questionId;

    addModalVisible.value = true;
};

// 处理新增选择题
const handleAddChoice = async () => {
    try {
        const valid = await addFormRef.value?.validate();
        if (!valid) return;

        addLoading.value = true;

        const knowledgeTags = parseTagsInput(addForm.knowledgeTagsInput);

        const requestData: AddChoiceQuestionParams = {
            topic: addForm.topic,
            a: addForm.a,
            b: addForm.b,
            c: addForm.c,
            d: addForm.d,
            answer: addForm.answer,
            answerAnalysis: addForm.answerAnalysis || undefined,
            knowledgeTags: knowledgeTags.length > 0 ? knowledgeTags : undefined,
            questionId: addForm.questionId
        };

        const response = await addChoiceQuestion(requestData);
        if (response.code === 0) {
            message.success('选择题添加成功！');
            addModalVisible.value = false;
            addFormRef.value?.resetFields();
            await fetchChoiceQuestions(); // 刷新列表
        } else {
            message.error(response.message || '添加选择题失败');
        }
    } catch (error) {
        console.error('添加选择题失败:', error);
        message.error('添加选择题失败，请重试');
    } finally {
        addLoading.value = false;
    }
};

// 取消新增
const handleCancelAdd = () => {
    addFormRef.value?.resetFields();
    addModalVisible.value = false;
};

// 显示编辑模态框
const showEditModal = (choice: ChoiceQuestion) => {
    editForm.id = choice.id!;
    editForm.topic = choice.topic;
    editForm.a = choice.a;
    editForm.b = choice.b;
    editForm.c = choice.c;
    editForm.d = choice.d;
    editForm.answer = choice.answer;
    editForm.answerAnalysis = choice.answerAnalysis || '';
    editForm.knowledgeTags = choice.knowledgeTags || [];
    editForm.knowledgeTagsInput = tagsToString(choice.knowledgeTags);

    editModalVisible.value = true;
};

// 处理编辑选择题
const handleEditChoice = async () => {
    try {
        const valid = await editFormRef.value?.validate();
        if (!valid) return;

        editLoading.value = true;

        const knowledgeTags = parseTagsInput(editForm.knowledgeTagsInput);

        const updateData: UpdateChoiceQuestionParams = {
            id: editForm.id,
            topic: editForm.topic,
            a: editForm.a,
            b: editForm.b,
            c: editForm.c,
            d: editForm.d,
            answer: editForm.answer,
            answerAnalysis: editForm.answerAnalysis || undefined,
            knowledgeTags: knowledgeTags.length > 0 ? knowledgeTags : undefined
        };

        const response = await updateChoiceQuestion(updateData);
        if (response.code === 0) {
            message.success('选择题更新成功！');
            editModalVisible.value = false;
            editFormRef.value?.resetFields();
            await fetchChoiceQuestions(); // 刷新列表
        } else {
            message.error(response.message || '更新选择题失败');
        }
    } catch (error) {
        console.error('更新选择题失败:', error);
        message.error('更新选择题失败，请重试');
    } finally {
        editLoading.value = false;
    }
};

// 取消编辑
const handleCancelEdit = () => {
    editFormRef.value?.resetFields();
    editModalVisible.value = false;
};

// 删除选择题
const handleDelete = (choice: ChoiceQuestion) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除这道选择题吗？该操作不可恢复！`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
            try {
                message.loading('正在删除...', 0);
                const response = await deleteChoiceQuestion(choice.id!);

                if (response.code === 0) {
                    message.destroy();
                    message.success('选择题删除成功！');
                    await fetchChoiceQuestions(); // 刷新列表
                } else {
                    message.destroy();
                    message.error(response.message || '删除选择题失败');
                }
            } catch (error) {
                console.error('删除选择题失败:', error);
                message.destroy();
                message.error('删除选择题失败，请重试');
            }
        }
    });
};

// 监听questionId变化
watch(
    () => props.questionId,
    (newQuestionId) => {
        if (newQuestionId) {
            addForm.questionId = newQuestionId;
            fetchChoiceQuestions();
        }
    },
    { immediate: true }
);

// 组件挂载时获取数据
onMounted(() => {
    if (props.questionId) {
        fetchChoiceQuestions();
    }
});
</script>

<style scoped>
@import "@/assets/styles/manager/ChoiceQuestionManager.css";
</style>