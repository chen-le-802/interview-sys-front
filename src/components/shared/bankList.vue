<template>
    <div class="bank-list">
        <ul>
            <li v-for="(item, index) in questionList" :key="item.id" @click="handleQuestionClick(item)">
                <div class="bank-logo" :style="{ backgroundImage: `url(${item.picture || defaultIcon})` }"></div>
                <div class="bank-info">
                    <div class="bank-title">{{ item.title }}</div>
                    <div class="bank-desc">{{ item.description || '暂无描述' }}</div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getQuestionBankVOPage, type QuestionBankVO } from '@/apis/questionBankApi'
import defaultIcon from '@/assets/images/icon/default.png'

// 接收分类参数
interface Props {
    selectedCategory?: string
}

const props = withDefaults(defineProps<Props>(), {
    selectedCategory: 'hot'
})

const router = useRouter()
const questionList = ref<QuestionBankVO[]>([])

const loadQuestionBanks = async () => {
  try {
    // 基础参数
    let params: any = {
      current: 1,
      pageSize: 20
    }

    // 根据分类调整请求参数
    if (props.selectedCategory === 'hot') {
      // 热门：按更新时间倒序 TODO 待后端完善热门设计逻辑
      params.sortField = 'updateTime'
      params.sortOrder = 'desc'
    } else if (props.selectedCategory === 'all') {
    } else {
      // 标签分类：添加搜索条件
      params.searchText = props.selectedCategory
    }

    console.log('请求参数:', params)
    const response = await getQuestionBankVOPage(params)
    console.log('API响应:', response)
    
    if (response.code === 0 && response.data) {
      questionList.value = response.data.records || []
    }
  } catch (error) {
    console.error('获取题库列表失败：', error)
  }
}

const handleQuestionClick = (item: QuestionBankVO) => {
    router.push(`/bank/${String(item.id)}`)
}

// 监听分类变化，重新加载数据
watch(
  () => props.selectedCategory,
  () => {
    console.log('分类变化:', props.selectedCategory)
    loadQuestionBanks()
  }
)

onMounted(() => {
  loadQuestionBanks()
})
</script>
<style scoped>
.bank-list {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 20px;
}

.bank-list ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 0;
}

.bank-list ul li {
    display: flex;
    align-items: center;
    width: 288.5px;
    height: 100px;
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 15px;
    margin-right: 15px;
    cursor: pointer;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.bank-list ul li:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.bank-list ul li .bank-logo {
    width: 50px;
    height: 50px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 8px;
    flex-shrink: 0;
    margin-right: 15px;
}

.bank-list ul li .bank-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    overflow: hidden;
}

.bank-list ul li .bank-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.bank-list ul li .bank-desc {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    line-clamp: 2;
}
</style>