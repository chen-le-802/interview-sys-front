<template>
  <div class="question-card">
    <div class="question-preview" @click="toggleExpand">
      <!-- 批量操作复选框 -->
      <a-checkbox v-if="showCheckbox" :checked="checked" @click.stop @change="onCheckChange"
        style="margin-right: 12px;" />

      <span :class="['subject-tag', `difficulty-${error.difficulty}`]">
        {{ getDifficultyText(error.difficulty) }}
      </span>
      <span :class="['status-tag', error.status]">
        {{ error.status === 'solved' ? '已解决' : '未解决' }}
      </span>
      <p class="question-text">{{ error.title }}</p>
      <RightOutlined :class="['expand-icon', { rotated: isExpanded }]" />
    </div>

    <div class="question-details" v-show="isExpanded">
      <div class="question-header">
        <div class="question-meta">
          <span class="meta-item">
            <CalendarOutlined />
            {{ error.date }}
          </span>
          <span class="meta-item">
            <TagOutlined />
            {{ error.knowledgePoint }}
          </span>
          <span class="meta-item" v-if="error.source">
            <FileTextOutlined />
            {{ error.source }}
          </span>
        </div>
        <div class="actions">
          <a-tooltip title="标记为已解决/未解决">
            <CheckCircleOutlined v-if="error.status === 'unsolved'" class="status-icon unsolved"
              @click="updateStatus('solved')" />
            <CheckCircleFilled v-else class="status-icon solved" @click="updateStatus('unsolved')" />
          </a-tooltip>

          <a-popconfirm title="确定要删除这道错题吗？" @confirm="deleteError" ok-text="确定" cancel-text="取消">
            <a-tooltip title="删除错题">
              <DeleteOutlined class="remove-icon" />
            </a-tooltip>
          </a-popconfirm>
        </div>
      </div>

      <div class="question-content">
        <div class="options">
          <div v-for="(option, index) in error.options" :key="index" :class="['option', {
            'correct': option.charAt(0) === error.correctAnswer,
            'user-wrong': option.charAt(0) === error.userAnswer && error.userAnswer !== error.correctAnswer
          }]">
            <span class="option-circle">{{ option.charAt(0) }}</span>
            <span>{{ option.substring(2) }}</span>
          </div>
        </div>
      </div>

      <div class="answer-analysis">
        <div class="answer-info">
          <span class="correct-answer">正确答案：{{ error.correctAnswer }}</span>
          <span :class="['user-answer', {
            'correct': error.userAnswer === error.correctAnswer,
            'wrong': error.userAnswer !== error.correctAnswer
          }]">
            你的答案：{{ error.userAnswer }}
          </span>
        </div>
        <div class="analysis-content">
          <h4>官方解析：</h4>
          <p>{{ error.explanation }}</p>
        </div>
        <div class="related-content" v-if="error.relatedQuestion">
          <h4>关联题目：</h4>
          <p class="related-question">{{ error.relatedQuestion }}</p>
        </div>
        <div class="knowledge-tags">
          <span v-for="tag in error.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  DeleteOutlined,
  RightOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  TagOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue';
import type { ErrorQuestion } from '@/stores/errorNoteBook';

// Props
interface Props {
  error: ErrorQuestion;
  showCheckbox?: boolean;
  checked?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showCheckbox: false,
  checked: false
});

// Emits
const emit = defineEmits<{
  click: [error: ErrorQuestion];
  check: [errorId: number, checked: boolean];
  delete: [errorId: number];
  updateStatus: [errorId: number, status: 'solved' | 'unsolved'];
}>();

// 响应式数据
const isExpanded = ref(false);

// 方法
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit('click', props.error);
};

const onCheckChange = (e: any) => {
  emit('check', props.error.id, e.target.checked);
};

const deleteError = () => {
  emit('delete', props.error.id);
};

const updateStatus = (status: 'solved' | 'unsolved') => {
  emit('updateStatus', props.error.id, status);
};

const getDifficultyText = (difficulty: string) => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  };
  return difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty;
};
</script>

<style scoped>
.question-card {
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.question-preview {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
}

.subject-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
}

.difficulty-easy {
  background: #f6ffed;
  color: #52c41a;
}

.difficulty-medium {
  background: #fff7e6;
  color: #fa8c16;
}

.difficulty-hard {
  background: #fff1f0;
  color: #ff4d4f;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 12px;
}

.status-tag.solved {
  background: #f6ffed;
  color: #52c41a;
}

.status-tag.unsolved {
  background: #fff1f0;
  color: #ff4d4f;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.expand-icon {
  transition: transform 0.3s;
  color: #999;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

.question-details {
  padding: 16px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.question-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  gap: 4px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.status-icon.solved {
  color: #52c41a;
}

.status-icon.unsolved {
  color: #d9d9d9;
}

.status-icon:hover {
  transform: scale(1.1);
}

.remove-icon {
  color: #ff4d4f;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.remove-icon:hover {
  color: #ff7875;
  transform: scale(1.1);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f9f9f9;
  transition: all 0.3s;
}

.option-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e8e8e8;
  margin-right: 12px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.correct {
  background: #f6ffed;
  border-left: 3px solid #52c41a;
}

.correct .option-circle {
  background: #52c41a;
  color: white;
}

.user-wrong {
  background: #fff1f0;
  border-left: 3px solid #ff4d4f;
}

.user-wrong .option-circle {
  background: #ff4d4f;
  color: white;
}

.answer-analysis {
  border-top: 1px dashed #f0f0f0;
  padding-top: 16px;
}

.answer-info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.correct-answer {
  color: #52c41a;
  font-weight: 500;
  font-size: 14px;
}

.user-answer {
  font-weight: 500;
  font-size: 14px;
}

.user-answer.correct {
  color: #52c41a;
}

.user-answer.wrong {
  color: #ff4d4f;
}

.analysis-content h4,
.related-content h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.analysis-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.related-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
}

.related-question {
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
  line-height: 1.6;
  margin-bottom: 12px;
}

.related-question:hover {
  color: #40a9ff;
}

.knowledge-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f5f5f5;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.3s;
}

.tag:hover {
  background: #e6f7ff;
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-header {
    flex-direction: column;
    gap: 12px;
  }

  .answer-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>