<template>
    <div class="title-box">
        <div 
            class="bank-logo" 
            :style="questionBank.picture ? `background-image: url(${questionBank.picture})` : ''"
        ></div>
        <div class="bank-info">
            <div class="bank-name">{{ questionBank.title || '这里是题库标题' }}</div>
            <div class="bank-desc">{{ questionBank.description || '这里是题库描述' }}</div>
            <div class="options">
                <el-button type="primary" size="default" color="#1677ff" round>开始刷题</el-button>
                <el-button type="default" size="default" round>
                    <el-icon style="margin-right: 5px;">
                        <DocumentChecked />
                    </el-icon>在线测试
                </el-button>
                <el-button type="default" size="default" round>
                    <el-icon style="margin-right: 5px;">
                        <Share />
                    </el-icon>分享</el-button>
            </div>
        </div>
    </div>
    <div class="table-box">
        <Table :tableWidth=1200></Table>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { DocumentChecked, Share } from '@element-plus/icons-vue';
import { getQuestionBankVOById, type QuestionBankVO } from '@/apis/questionBankApi';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  bankId: string;
}>();

const questionBank = ref<Partial<QuestionBankVO>>({});

const fetchQuestionBankDetail = async () => {
    if (!props.bankId) {
        return;
    }

    try {
        const response = await getQuestionBankVOById(props.bankId);
        
        if (response.code === 0) {
            questionBank.value = response.data;
        } else {
            ElMessage.error(`获取题库详情失败: ${response.message}`);
        }
    } catch (error) {
        ElMessage.error('网络请求失败，请稍后重试');
    }
};

watch(() => props.bankId, () => {
    if (props.bankId) {
        fetchQuestionBankDetail();
    }
}, { immediate: true });

onMounted(() => {
    fetchQuestionBankDetail();
});
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
    padding: 24px
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