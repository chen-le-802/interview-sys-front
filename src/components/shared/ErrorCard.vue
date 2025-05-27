<template>
  <div class="question-card">
    <div class="question-preview" @click="toggleExpand">
      <span class="subject-tag">Java</span>
      <p class="question-text">1. 如何确保包含可变对象引用的不可变类的安全性？</p>
      <RightOutlined :class="['expand-icon', { rotated: isExpanded }]" />
    </div>
    
    <div class="question-details" v-show="isExpanded">
      <div class="question-header">
        <div class="actions">
         
          <DeleteOutlined class="remove-icon" />
        </div>
      </div>
      
      <div class="question-content">
        <div class="options">
          <div class="option">
            <span class="option-circle">A</span>
            <span>将可变对象设为 public</span>
          </div>
          <div class="option correct">
            <span class="option-circle">B</span>
            <span>在 getter 方法中返回可变对象的副本</span>
          </div>
          <div class="option">
            <span class="option-circle">C</span>
            <span>允许外部修改可变对象的引用</span>
          </div>
          <div class="option user-wrong">
            <span class="option-circle">D</span>
            <span>通过 setter 方法修改可变对象</span>
          </div>
        </div>
      </div>
      
      <div class="answer-analysis">
        <div class="answer-info">
          <span class="correct-answer">正确答案：B</span>
          <span class="user-answer">你的答案：D</span>
        </div>
        <div class="analysis-content">
          <h4>官方解析：</h4>
          <p>为了确保不可变类的安全性，如果类中包含可变对象引用，应在getter方法中返回该可变对象的副本，而不是返回其直接引用。这样可以防止外部修改类的内部状态，从而保持类的不可变性。</p>
        </div>
        <div class="knowledge-tags">
          <span class="tag">Java</span>
          <span class="tag">不可变类</span>
          <span class="tag">安全性</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { DeleteOutlined, RightOutlined } from '@ant-design/icons-vue';

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.question-card {
  width: 100%;
  /* max-width: 600px; */
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  margin-bottom: 20px;
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
  background: #f0f7ff;
  color: #1890ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 12px;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin: 0;
  flex: 1;
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
  justify-content: flex-end;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.recommend {
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
}

.remove-icon {
  color: #ff4d4f;
  cursor: pointer;
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
}

.correct-answer {
  color: #52c41a;
  font-weight: 500;
}

.user-answer {
  color: #ff4d4f;
  font-weight: 500;
}

.analysis-content h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
}

.analysis-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.knowledge-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: #f5f5f5;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>