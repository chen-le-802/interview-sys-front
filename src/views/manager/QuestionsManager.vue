<template>
  <div class="app-container">
    <!-- 题目管理 -->
    <div class="questions">
      <!-- 操作栏卡片 -->
      <div class="card actions-card">
        <div class="actions">
          <div class="filters">
            <!-- 搜索框 -->
            <a-input-search v-model:value="searchQuery" placeholder="搜索题目标题、ID..." class="input-search"
              @search="handleSearch" allow-clear :loading="isSearching" />
            <!-- 筛选选项 -->
            <a-select v-model:value="difficulty" placeholder="难度" class="select-filter">
              <a-select-option value="all">全部难度</a-select-option>
              <a-select-option value="简单">简单</a-select-option>
              <a-select-option value="中等">中等</a-select-option>
              <a-select-option value="困难">困难</a-select-option>
            </a-select>
            <a-select v-model:value="bank" placeholder="题库" class="select-filter">
              <a-select-option value="all">全部题库</a-select-option>
              <a-select-option v-for="bankItem in questionBanks" :key="bankItem.id" :value="bankItem.id">
                {{ bankItem.title }}
              </a-select-option>
            </a-select>
          </div>
          <div class="buttons">
            <a-button class="export-button" @click="exportQuestionData" :loading="isExporting">
              <DownloadOutlined class="export-icon" />导出题目
            </a-button>
            <a-button type="primary" class="add-button" @click="showAddModal">
              <PlusOutlined class="add-icon" />新增题目
            </a-button>
          </div>
        </div>
      </div>

      <!-- 题目列表卡片 -->
      <div class="card Question-list-card">
        <a-spin :spinning="loading">
          <div class="Question-list">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>题目ID</th>
                  <th>题目名称</th>
                  <th>难度</th>
                  <th>标签</th>
                  <th>提交次数</th>
                  <th>通过率</th>
                  <th>所属题库</th>
                  <th>操作</th>
                </tr>
              </thead>
              <transition-group name="list" tag="tbody" v-if="paginatedQuestionList.length > 0">
                <tr v-for="question in paginatedQuestionList" :key="question.id">
                  <td>{{ question.id }}</td>
                  <td>
                    <div class="question-title" :title="question.title">
                      {{ question.title }}
                    </div>
                  </td>
                  <td>
                    <span :class="difficultyClass(question.difficulty)" class="difficulty-tag">
                      {{ question.difficulty }}
                    </span>
                  </td>
                  <td>
                    <transition-group tag="div" name="tag" class="tag-container">
                      <span v-for="tag in question.tagList" :key="tag" class="tag">
                        {{ tag }}
                      </span>
                    </transition-group>
                  </td>
                  <td>{{ question.submissionQuantity || 0 }}</td>
                  <td>
                    <span :class="passRateClass(question.passRate)">{{ question.passRate || '0%' }}</span>
                  </td>
                  <td>{{ getQuestionBankName(question.questionBankId) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="edit-btn" @click="showEditModal(question)">
                        <EditOutlined class="edit-icon" />编辑
                      </button>
                      <button class="preview-btn" @click="showPreviewModal(question)">
                        <FolderViewOutlined class="preview-icon" />预览
                      </button>
                      <button class="delete-btn" @click="handleDelete(question)">
                        <DeleteOutlined class="delete-icon" />删除
                      </button>
                    </div>
                  </td>
                </tr>
              </transition-group>
              <tbody v-else>
                <tr>
                  <td colspan="8">
                    <div class="empty-data">
                      <a-empty description="暂无符合条件的题目" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </a-spin>
        <div class="pagination-container">
          <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" :total="total" :showTotal="showTotal"
            :pageSizeOptions="pageSizeOptions" showSizeChanger showQuickJumper @change="handlePageChange"
            @showSizeChange="handlePageSizeChange" />
          <div class="pagination-info">
            当前显示:
            {{ (currentPage - 1) * pageSize + (total > 0 ? 1 : 0) }}-
            {{ Math.min(currentPage * pageSize, total) }} 条，共 {{ total }} 条
          </div>
        </div>
      </div>
    </div>

    <!-- 新增题目 -->
    <a-modal v-model:visible="addModalVisible" title="新增题目" width="1000px" @ok="handleAddQuestion"
      @cancel="handleCancelAdd" :confirm-loading="addLoading" :maskClosable="false">
      <a-tabs v-model:activeKey="addActiveTabKey" @change="handleAddTabChange">
        <a-tab-pane key="basic" tab="基本信息">
          <a-form :model="addForm" :rules="addFormRules" ref="addFormRef" :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }">
            <a-form-item label="题目标题" name="title">
              <a-input v-model:value="addForm.title" placeholder="请输入题目标题" />
            </a-form-item>

            <a-form-item label="题目目录" name="content">
              <a-textarea v-model:value="addForm.content" placeholder="请输入题目目录（支持Markdown格式）" :rows="3" />
            </a-form-item>

            <a-form-item label="参考答案" name="answer">
              <a-textarea v-model:value="addForm.answer" placeholder="请输入参考答案（支持Markdown格式）" :rows="4" />
            </a-form-item>

            <a-form-item label="难度" name="difficulty">
              <a-select v-model:value="addForm.difficulty" placeholder="请选择难度">
                <a-select-option value="简单">简单</a-select-option>
                <a-select-option value="中等">中等</a-select-option>
                <a-select-option value="困难">困难</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="标签" name="tags">
              <a-select v-model:value="addForm.tags" mode="tags" style="width: 100%" placeholder="请选择或输入标签">
                <a-select-option v-for="tag in tagsList" :key="tag" :value="tag">
                  {{ tag }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="题库" name="questionBankId">
              <a-select v-model:value="addForm.questionBankId" placeholder="请选择题库">
                <a-select-option v-for="bankItem in questionBanks" :key="bankItem.id" :value="bankItem.id">
                  {{ bankItem.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="choices" tab="选择题管理" :disabled="!addForm.isCreated">
          <div v-if="!addForm.isCreated" class="choice-disabled-tip">
            <a-alert message="请先完成基本信息填写并保存后，再添加选择题" type="info" show-icon />
          </div>
          <div v-else-if="addForm.createdQuestionId">
            <ChoiceQuestionManager :questionId="addForm.createdQuestionId" :readonly="false"
              @choice-count-change="handleChoiceCountChange" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 编辑题目 -->
    <a-modal v-model:visible="editModalVisible" title="编辑题目" width="1000px" @ok="handleEditQuestion"
      @cancel="handleCancelEdit" :confirm-loading="editLoading" :maskClosable="false">
      <a-tabs v-model:activeKey="editActiveTabKey">
        <a-tab-pane key="basic" tab="基本信息">
          <a-form :model="editForm" :rules="editFormRules" ref="editFormRef" :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }">
            <a-form-item label="题目ID">
              <a-input v-model:value="editForm.id" disabled />
            </a-form-item>

            <a-form-item label="题目标题" name="title">
              <a-input v-model:value="editForm.title" placeholder="请输入题目标题" />
            </a-form-item>

            <a-form-item label="题目目录" name="content">
              <a-textarea v-model:value="editForm.content" placeholder="请输入题目目录（支持Markdown格式）" :rows="3" />
            </a-form-item>

            <a-form-item label="参考答案" name="answer">
              <a-textarea v-model:value="editForm.answer" placeholder="请输入参考答案（支持Markdown格式）" :rows="4" />
            </a-form-item>

            <a-form-item label="难度" name="difficulty">
              <a-select v-model:value="editForm.difficulty" placeholder="请选择难度">
                <a-select-option value="简单">简单</a-select-option>
                <a-select-option value="中等">中等</a-select-option>
                <a-select-option value="困难">困难</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="标签" name="tags">
              <a-select v-model:value="editForm.tags" mode="tags" style="width: 100%" placeholder="请选择或输入标签">
                <a-select-option v-for="tag in tagsList" :key="tag" :value="tag">
                  {{ tag }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="题库" name="questionBankId">
              <a-select v-model:value="editForm.questionBankId" placeholder="请选择题库">
                <a-select-option v-for="bankItem in questionBanks" :key="bankItem.id" :value="bankItem.id">
                  {{ bankItem.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="choices" tab="选择题管理">
          <ChoiceQuestionManager :questionId="editForm.id" :readonly="false"
            @choice-count-change="handleChoiceCountChange" />
        </a-tab-pane>
      </a-tabs>
    </a-modal>

    <!-- 预览题目 -->
    <a-modal v-model:visible="previewModalVisible" title="题目预览" width="1000px" :footer="null" :maskClosable="true"
      :destroyOnClose="true">
      <a-tabs v-model:activeKey="previewActiveTabKey">
        <a-tab-pane key="basic" tab="基本信息">
          <transition name="fade" mode="out-in">
            <div class="preview-container" v-if="previewQuestion">
              <div class="preview-header">
                <h3>{{ previewQuestion.title }}</h3>
                <div class="preview-meta">
                  <span :class="difficultyClass(previewQuestion.difficulty)" class="difficulty-tag">
                    {{ previewQuestion.difficulty }}
                  </span>
                  <span class="meta-divider">|</span>
                  <span class="bank-name">
                    题库：{{ getQuestionBankName(previewQuestion.questionBankId) }}
                  </span>
                  <span class="meta-divider">|</span>
                  <span class="question-id">题目ID：{{ previewQuestion.id }}</span>
                </div>
              </div>

              <div class="preview-tags">
                <transition-group tag="div" name="tag">
                  <span v-for="tag in previewQuestion.tagList" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </transition-group>
              </div>

              <div class="preview-content">
                <h4>题目目录</h4>
                <div class="content-box markdown-content" v-html="renderMarkdown(previewQuestion.content || '暂无内容')">
                </div>
              </div>

              <div class="preview-answer">
                <h4>参考答案</h4>
                <div class="content-box markdown-content" v-html="renderMarkdown(previewQuestion.answer || '暂无答案')">
                </div>
              </div>

              <div class="preview-statistics">
                <div class="statistics-box">
                  <div class="stat-item">
                    <span class="stat-label">提交次数：</span>
                    <span class="stat-value">
                      {{ previewQuestion.submissionQuantity || 0 }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">通过率：</span>
                    <span class="stat-value" :class="passRateClass(previewQuestion.passRate)">
                      {{ previewQuestion.passRate || '0%' }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">最近更新：</span>
                    <span class="stat-value">
                      {{ previewQuestion.updateTime
                        ? formatDateTime(new Date(previewQuestion.updateTime))
                        : '暂无记录' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </a-tab-pane>
        <a-tab-pane key="choices" tab="选择题预览">
          <ChoiceQuestionManager v-if="previewQuestion" :questionId="previewQuestion.id" :readonly="true" />
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { DownloadOutlined, PlusOutlined, EditOutlined, FolderViewOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import type { FormInstance } from 'ant-design-vue';
import { formatDateTime } from '@/utils/dateTimeFormat';
import { addQuestion, updateQuestion, deleteQuestion, getQuestionList } from '@/apis/questionApi';
import { getQuestionBankList } from '@/apis/questionBankApi';
import { addQuestionToBank, getQuestionBanksByQuestionId, updateQuestionBankRelation } from '@/apis/questionBankQuestionApi';
import { marked } from 'marked';
import ChoiceQuestionManager from '@/components/manager/ChoiceQuestionManager.vue';

// 题目接口
interface Question {
  id: string;
  title: string;
  content?: string;
  answer?: string;
  difficulty: string;
  tagList?: string[];
  tags?: string;
  submissionQuantity?: number;
  passQuantity?: number;
  passRate?: string;
  questionBankId?: string;
  updateTime?: string;
  userId?: string;
}

// 题库接口
interface QuestionBank {
  id: string;
  title: string;
  description?: string;
  picture?: string;
}

// 标签列表
const tagsList = ref<string[]>([
  '操作系统',
  '计算机网络',
  '数据库',
  'Java',
  'Spring',
  '分布式系统',
  '基础概念',
  '网络协议',
  '安全',
  '性能优化',
  '算法',
  '排序',
  '并发编程',
  'JVM',
  '缓存',
  'Redis',
  '理论基础',
  '内存管理',
  '动态规划'
]);

// 筛选相关
const difficulty = ref<string>('all');
const bank = ref<string | 'all'>('all');
const searchQuery = ref<string>('');
const isSearching = ref<boolean>(false);
const isExporting = ref<boolean>(false);
const loading = ref<boolean>(false);

// 页码相关状态
const currentPage = ref<number>(1);
const pageSize = ref<number>(10);
const total = ref<number>(0);
const pageSizeOptions = ref<string[]>(['10', '20', '50', '100']);
const showTotal = (total: number) => `共 ${total} 条记录`;

// 新增题目相关
const addModalVisible = ref<boolean>(false);
const addLoading = ref<boolean>(false);
const addFormRef = ref<FormInstance>();
const addActiveTabKey = ref<string>('basic');

// 编辑题目相关
const editModalVisible = ref<boolean>(false);
const editLoading = ref<boolean>(false);
const editFormRef = ref<FormInstance>();
const editActiveTabKey = ref<string>('basic');

// 预览题目相关
const previewModalVisible = ref<boolean>(false);
const previewQuestion = ref<Question | null>(null);
const previewActiveTabKey = ref<string>('basic');

// 题库列表
const questionBanks = ref<QuestionBank[]>([]);

// 题目列表
const questionList = ref<Question[]>([]);

// 新增题目表单
const addForm = reactive<{
  title: string;
  content: string;
  answer: string;
  difficulty?: string;
  tags: string[];
  questionBankId?: string;
  isCreated: boolean;
  createdQuestionId: string;
}>({
  title: '',
  content: '',
  answer: '',
  difficulty: undefined,
  tags: [],
  questionBankId: undefined,
  isCreated: false,
  createdQuestionId: ''
});

// 编辑题目表单
const editForm = reactive<{
  id: string;
  title: string;
  content: string;
  answer: string;
  difficulty: string;
  tags: string[];
  questionBankId?: string;
  submissionQuantity: number;
  passRate: string;
  updateTime: string;
}>({
  id: '',
  title: '',
  content: '',
  answer: '',
  difficulty: '',
  tags: [],
  questionBankId: undefined,
  submissionQuantity: 0,
  passRate: '',
  updateTime: ''
});

// 表单验证规则
const addFormRules: Record<string, Rule[]> = {
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在 2-100 个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入题目目录', trigger: 'blur' },
    { min: 5, message: '题目目录至少 5 个字符', trigger: 'blur' }
  ],
  answer: [{ required: true, message: '请输入参考答案', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  tags: [
    { required: true, message: '请至少选择一个标签', trigger: 'change', type: 'array' }
  ],
  questionBankId: [{ required: true, message: '请选择题库', trigger: 'change' }]
};

const editFormRules = addFormRules;

// 标签页切换处理
const handleAddTabChange = (activeKey: string | number) => {
  const key = String(activeKey);
  addActiveTabKey.value = key;
  if (key === 'choices' && !addForm.isCreated) {
    message.warning('请先保存基本信息后再管理选择题');
    addActiveTabKey.value = 'basic';
  }
};

// 选择题数量变化处理
const handleChoiceCountChange = (count: number) => {

};

// Markdown渲染函数
const renderMarkdown = (content: string): string => {
  if (!content) return '暂无内容';

  try {
    // 配置marked选项
    marked.setOptions({
      breaks: true, // 支持换行
      gfm: true, // 支持GitHub风格的Markdown
    });
    
    return marked(content) as string;
  } catch (error) {
    console.error('Markdown渲染失败:', error);
    // 如果渲染失败，返回原始文本
    return content.replace(/\n/g, '<br>');
  }
};

// 获取请求参数
const getRequestParams = () => {
  return {
    current: currentPage.value,
    pageSize: pageSize.value,
    searchText: searchQuery.value || undefined,
    difficulty: difficulty.value === 'all' ? undefined : difficulty.value,
    questionBankId: bank.value === 'all' ? undefined : bank.value
  };
};

// 处理搜索事件
const handleSearch = () => {
  isSearching.value = true;
  currentPage.value = 1;
  fetchQuestionList();
};

// 分页后的题目列表
const paginatedQuestionList = computed<Question[]>(() => {
  return questionList.value;
});

// 获取题库名称（前端根据已加载的 questionBanks 数组匹配）
const getQuestionBankName = (questionBankId?: string) => {
  if (!questionBankId) return '未分配题库';
  const found = questionBanks.value.find((b) => b.id === questionBankId);
  return found ? found.title : '未知题库';
};

// 获取题库列表
const fetchQuestionBanks = async () => {
  try {
    const response = await getQuestionBankList();
    if (response.code === 0) {
      // 后端返回的 list 中，id 是一个很大的 Long 类型，用 String 存储
      questionBanks.value = (response.data || []).map((item: any) => ({
        id: String(item.id),
        title: item.title,
        description: item.description,
        picture: item.picture
      }));
    } else {
      message.error(response.message || '获取题库列表失败');
    }
  } catch (error) {
    console.error('获取题库列表失败:', error);
    message.error('获取题库列表失败');
  }
};

// 获取题目列表，并且为每一道题额外去查一次它的题库关联，把 question.questionBankId 赋上
const fetchQuestionList = async () => {
  try {
    loading.value = true;
    isSearching.value = true;

    const params = getRequestParams();
    const response = await getQuestionList(params);

    if (response.code === 0) {
      const data: any = response.data;
      const rawQuestions: any[] = data.records || [];
      total.value = data.total || 0;

      // 对"主列表"里的每一道题，都把它先做一次"标签处理 + 题库关联处理"
      const processed = await Promise.all(
        rawQuestions.map(async (q: any) => {
          // 1. 把 q.id 转为字符串，避免 Number 精度问题
          const single: Question = {
            id: String(q.id),
            title: q.title,
            content: q.content,
            answer: q.answer,
            difficulty: q.difficulty,
            tagList: [],
            tags: q.tags,
            submissionQuantity: q.submissionQuantity,
            passQuantity: q.passQuantity,
            passRate: q.passRate,
            questionBankId: undefined,
            updateTime: q.updateTime,
            userId: q.userId ? String(q.userId) : undefined
          };

          // 2. "标签解析"
          if (q.tags && typeof q.tags === 'string') {
            try {
              const arr = JSON.parse(q.tags);
              single.tagList = Array.isArray(arr) ? arr : q.tags.split(',');
            } catch {
              single.tagList = q.tags
                .replace(/[\[\]"]/g, '')
                .split(',')
                .map((t: string) => t.trim())
                .filter((t: string) => !!t);
            }
          }

          // 3. 向后端请求这个题目目前关联的题库是哪个，并把它写成字符串
          try {
            const bankResp = await getQuestionBanksByQuestionId(single.id);
            if (bankResp.code === 0) {
              const recs = bankResp.data?.records || [];
              if (recs.length > 0) {
                single.questionBankId = String(recs[0].questionBankId);
              }
            }
          } catch (e) {
            console.error(`拉取题目(${single.id})的关联题库失败:`, e);
          }

          return single;
        })
      );

      questionList.value = processed;

      // 同步更新一下 tagsList，保证所有题的标签都收入到全局列表里
      const allTags = new Set<string>();
      questionList.value.forEach((qt) => {
        if (qt.tagList && qt.tagList.length > 0) {
          qt.tagList.forEach((t) => allTags.add(t));
        }
      });
      const exist = new Set(tagsList.value);
      allTags.forEach((t) => exist.add(t));
      tagsList.value = Array.from(exist);
    } else {
      message.error(response.message || '获取题目列表失败');
    }
  } catch (error) {
    console.error('获取题目列表失败:', error);
    message.error('获取题目列表失败');
  } finally {
    loading.value = false;
    isSearching.value = false;
  }
};

// 难度标签样式
const difficultyClass = (difficulty: string) => {
  switch (difficulty) {
    case '简单':
      return 'difficulty-easy';
    case '中等':
      return 'difficulty-medium';
    case '困难':
      return 'difficulty-hard';
    default:
      return '';
  }
};

// 通过率样式
const passRateClass = (rate?: string) => {
  if (!rate) return 'pass-rate-low';
  const n = parseInt(rate.replace('%', ''), 10);
  if (n >= 60) return 'pass-rate-high';
  if (n >= 40) return 'pass-rate-medium';
  return 'pass-rate-low';
};

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchQuestionList();
  window.scrollTo(0, 0);
};
const handlePageSizeChange = (curr: number, size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchQuestionList();
};

// 导出题目数据（CSV）
const exportQuestionData = async () => {
  try {
    if (questionList.value.length === 0) {
      message.warning('没有符合条件的题目可导出');
      return;
    }
    isExporting.value = true;

    let csv = '题目ID,题目标题,难度,标签,提交次数,通过率,所属题库,最近更新\n';
    questionList.value.forEach((q) => {
      const tagsFmt = `"${q.tagList?.join(',') || ''}"`;
      const bankName = getQuestionBankName(q.questionBankId);
      const timeFmt = q.updateTime
        ? formatDateTime(new Date(q.updateTime))
        : '';
      csv += `${q.id},${q.title},${q.difficulty},${tagsFmt},${q.submissionQuantity || 0
        },${q.passRate || '0%'},${bankName},${timeFmt}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `题目列表_${formatDateTime(new Date(), 'YYYY-MM-DD')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('题目导出成功');
  } catch (e) {
    console.error('导出题目失败:', e);
    message.error('导出题目失败，请重试');
  } finally {
    isExporting.value = false;
  }
};

// 监听筛选条件变化
watch(
  [searchQuery, difficulty, bank],
  () => {
    currentPage.value = 1;
    fetchQuestionList();
  },
  { deep: true }
);

// —— 新增题目 / 编辑题目 / 预览题目 相关 ——

const showAddModal = () => {
  addForm.title = '';
  addForm.content = '';
  addForm.answer = '';
  addForm.difficulty = undefined;
  addForm.tags = [];
  addForm.questionBankId = undefined;
  addForm.isCreated = false;
  addForm.createdQuestionId = '';
  addActiveTabKey.value = 'basic';
  addModalVisible.value = true;
};

const handleAddQuestion = async () => {
  try {
    if (addActiveTabKey.value === 'basic') {
      // 在基本信息页，验证并保存基本信息
      const valid = await addFormRef.value?.validate();
      if (!valid) return;

      addLoading.value = true;
      if (!addForm.difficulty) {
        message.error('请选择难度');
        addLoading.value = false;
        return;
      }
      if (!addForm.questionBankId) {
        message.error('请选择题库');
        addLoading.value = false;
        return;
      }
      // 同步标签到全局
      if (addForm.tags.length > 0) {
        const newTags = addForm.tags.filter((t) => !tagsList.value.includes(t));
        if (newTags.length > 0) {
          tagsList.value = tagsList.value.concat(newTags);
        }
      }

      // 先提交"新题目"到后端，拿到自动生成的 questionId（Long → 转为 String）
      const questionData: any = {
        title: addForm.title,
        content: addForm.content,
        answer: addForm.answer,
        difficulty: addForm.difficulty,
        tags: addForm.tags
      };
      const resp = await addQuestion(questionData);
      if (resp.code === 0) {
        const newQid = String(resp.data);
        addForm.createdQuestionId = newQid;
        addForm.isCreated = true;

        // 新题目创建成功后，再把题目和题库关联
        try {
          const bankRes = await addQuestionToBank(
            newQid,
            addForm.questionBankId as string
          );
          if (bankRes.code !== 0) {
            message.warning('题目创建成功，但关联题库失败');
          }
        } catch (e) {
          console.error('新增题目关联题库失败:', e);
          message.warning('题目创建成功，但关联题库失败');
        }
        message.success('题目基本信息保存成功！可以继续添加选择题');
        addActiveTabKey.value = 'choices'; // 自动切换到选择题管理页
      } else {
        message.error(resp.message || '添加题目失败');
      }
    } else {
      // 在选择题页，直接关闭模态框
      addModalVisible.value = false;
      addFormRef.value?.resetFields();
      fetchQuestionList();
      message.success('题目创建完成！');
    }
  } catch (e) {
    console.error('添加题目出错:', e);
    message.error('添加题目失败，请重试');
  } finally {
    addLoading.value = false;
  }
};

const handleCancelAdd = () => {
  if (addForm.isCreated) {
    Modal.confirm({
      title: '确认关闭',
      content: '题目已创建，关闭后将无法继续编辑选择题，确定要关闭吗？',
      onOk: () => {
        addFormRef.value?.resetFields();
        addModalVisible.value = false;
        fetchQuestionList(); // 刷新列表
      }
    });
  } else {
    addFormRef.value?.resetFields();
    addModalVisible.value = false;
  }
};

const showEditModal = (question: Question) => {
  editForm.id = question.id;
  editForm.title = question.title;
  editForm.content = question.content || '';
  editForm.answer = question.answer || '';
  editForm.difficulty = question.difficulty;
  editForm.tags = [...(question.tagList || [])];
  editForm.submissionQuantity = question.submissionQuantity || 0;
  editForm.passRate = question.passRate || '0%';

  editForm.questionBankId = question.questionBankId || undefined;

  editForm.updateTime = question.updateTime
    ? formatDateTime(new Date(question.updateTime))
    : '暂无记录';

  editActiveTabKey.value = 'basic';
  editModalVisible.value = true;
};

const handleEditQuestion = async () => {
  try {
    if (editActiveTabKey.value === 'basic') {
      // 在基本信息页，验证并保存基本信息
      const valid = await editFormRef.value?.validate();
      if (!valid) return;

      editLoading.value = true;
      if (!editForm.questionBankId) {
        message.error('请选择题库');
        editLoading.value = false;
        return;
      }

      // 编辑标签时同步到全局
      if (editForm.tags.length > 0) {
        const newTags = editForm.tags.filter((t) => !tagsList.value.includes(t));
        if (newTags.length > 0) {
          tagsList.value = tagsList.value.concat(newTags);
        }
      }

      const updQ: any = {
        id: editForm.id,
        title: editForm.title,
        content: editForm.content,
        answer: editForm.answer,
        difficulty: editForm.difficulty,
        tags: editForm.tags
      };
      const resp = await updateQuestion(updQ);
      if (resp.code === 0) {
        const ok = await updateQuestionBankRelation(
          editForm.id,
          editForm.questionBankId as string
        );
        if (!ok) {
          message.warning('题目更新成功，但更新题库关联失败');
        }
        message.success('题目基本信息更新成功！');
        editActiveTabKey.value = 'choices'; // 自动切换到选择题管理页
      } else {
        message.error(resp.message || '更新题目失败');
      }
    } else {
      // 在选择题页，直接关闭模态框
      editModalVisible.value = false;
      fetchQuestionList();
      message.success('题目更新完成！');
    }
  } catch (e) {
    console.error('编辑题目出错:', e);
    message.error('编辑题目失败，请重试');
  } finally {
    editLoading.value = false;
  }
};

const handleCancelEdit = () => {
  editFormRef.value?.resetFields();
  editModalVisible.value = false;
};

const handleDelete = (question: Question) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除题目 "${question.title}" 吗？该操作不可恢复！`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        message.loading('正在删除...', 0);
        const resp = await deleteQuestion(question.id);
        if (resp.code === 0) {
          message.destroy();
          message.success('题目删除成功！');
          fetchQuestionList();
        } else {
          message.destroy();
          message.error(resp.message || '删除题目失败');
        }
      } catch (e) {
        console.error('删除题目失败:', e);
        message.destroy();
        message.error('删除题目失败，请重试');
      }
    }
  });
};

const showPreviewModal = (question: Question) => {
  previewQuestion.value = {
    ...question,
    updateTime: question.updateTime || undefined
  };

  previewActiveTabKey.value = 'basic';
  previewModalVisible.value = true;
};

onMounted(() => {
  fetchQuestionBanks();
  fetchQuestionList();
});
</script>

<style scoped>
@import "@/assets/styles/manager/QuestionsManager.css";
</style>