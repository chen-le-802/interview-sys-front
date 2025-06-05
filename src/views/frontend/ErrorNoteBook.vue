<template>
    <div class="container">
        <div class="left">
            <div class="navbar">
                <a-input-search
                    v-model:value="searchBook"
                    placeholder="搜索错题本"
                    class="search-input"
                    @search="onSearchBook"
                />
                <div class="book-nav">
                    <div 
                        v-for="book in books" 
                        :key="book.id"
                        class="item"
                        :class="{ active: activeBookId === book.id }"
                        @click="selectBook(book.id)"
                    >
                        <BookFilled :class="['icon', book.type]" />{{ book.name }}
                    </div>
                    <div class="add-book" @click="showAddBookModal = true">
                        <PlusCircleOutlined class="icon add" />添加错题本
                    </div>
                </div>
                <div class="goback" @click="goback"><RollbackOutlined class="icon" />退出错题本</div>
            </div>
        </div>
        <div class="right">
            <div class="main-container">
                <div class="main-content">
                    <div class="search-container">
                        <div class="search-box">
                            <a-input
                                v-model:value="questionSearch"
                                placeholder="搜索错题或关键字"
                                class="question-search-input"
                                @pressEnter="onQuestionSearch"
                                allow-clear
                            />
                            <a-button 
                                type="primary" 
                                class="question-search-btn" 
                                @click="onQuestionSearch"
                                :icon="h(SearchOutlined)"
                            />
                        </div>
                    </div>
                    <div class="error-cards-container">
                        <ErrorCard 
                            v-for="error in filteredErrors" 
                            :key="error.id"
                            :error="error"
                            @click="selectError(error)"
                        />
                    </div>
                </div>
            </div>
            <div class="ai">
                <div class="ai-box">
                    <div class="title-area">
                        <div class="logo"></div>
                        <p class="title-text">为您找到相关的题目：</p>
                    </div>
                    
                    <div class="question-list">
                        <div 
                            v-for="(item, index) in relatedQuestions" 
                            :key="index" 
                            class="question-item"
                            @click="selectRelatedQuestion(item)"
                        >
                            <div class="content">
                                <span class="index">{{ index + 1 }}.</span>
                                <span class="question-title">{{ item.title }}</span>
                            </div>
                            <span class="heat">{{ item.heat }}热度</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加错题本模态框 -->
        <a-modal 
            v-model:visible="showAddBookModal" 
            title="添加错题本" 
            @ok="handleAddBook"
            @cancel="showAddBookModal = false"
        >
            <a-input v-model:value="newBookName" placeholder="请输入错题本名称" />
            <a-select 
                v-model:value="newBookType" 
                style="width: 100%; margin-top: 10px;"
                placeholder="选择分类"
            >
                <a-select-option value="front">前端</a-select-option>
                <a-select-option value="back">后端</a-select-option>
                <a-select-option value="ops">运维</a-select-option>
            </a-select>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
    BookFilled, 
    PlusCircleOutlined, 
    RollbackOutlined,
    SearchOutlined 
} from '@ant-design/icons-vue';
import { h } from 'vue';


const router = useRouter();

// 导航数据
const books = ref([
    { id: 1, name: '前端错题', type: 'front', count: 42 },
    { id: 2, name: '后端错题', type: 'back', count: 28 },
    { id: 3, name: '运维错题', type: 'ops', count: 15 }
]);

const activeBookId = ref(1);
const searchBook = ref('');
const showAddBookModal = ref(false);
const newBookName = ref('');
const newBookType = ref('front');

// 错题数据
const errors = ref([
    {
        id: 1,
        bookId: 1,
        title: 'Vue3响应式原理问题',
        content: '在使用Vue3的reactive时遇到数据更新但视图不更新的问题...',
        tags: ['Vue3', '响应式'],
        date: '2023-05-15',
        difficulty: '中等',
        status: '未解决'
    },
    {
        id: 2,
        bookId: 1,
        title: 'React性能优化',
        content: 'React组件在频繁更新时出现卡顿现象...',
        tags: ['React', '性能'],
        date: '2023-06-02',
        difficulty: '困难',
        status: '已解决'
    },
    {
        id: 3,
        bookId: 2,
        title: 'Spring Boot事务问题',
        content: '在Spring Boot中使用@Transactional注解时事务不生效...',
        tags: ['Spring', '事务'],
        date: '2023-04-28',
        difficulty: '中等',
        status: '未解决'
    }
]);

// 搜索相关
const questionSearch = ref('');
const selectedError = ref(null);

// 相关题目
const relatedQuestions = ref([
    { id: 101, title: '如何优化前端性能？', heat: 1200, tags: ['前端', '性能'] },
    { id: 102, title: 'Vue3的响应式原理是什么？', heat: 800, tags: ['Vue3', '响应式'] },
    { id: 103, title: 'React Hooks使用注意事项', heat: 750, tags: ['React', 'Hooks'] },
    { id: 104, title: 'Spring事务传播机制详解', heat: 600, tags: ['Spring', '事务'] }
]);

// 计算属性
const filteredErrors = computed(() => {
    return errors.value.filter(error => {
        const matchesBook = activeBookId.value ? error.bookId === activeBookId.value : true;
        const matchesSearch = questionSearch.value 
            ? error.title.includes(questionSearch.value) || 
              error.content.includes(questionSearch.value) ||
              error.tags.some(tag => tag.includes(questionSearch.value))
            : true;
        return matchesBook && matchesSearch;
    });
});

// 方法
const goback = () => {
    router.back();
};

const selectBook = (bookId:any) => {
    activeBookId.value = bookId;
    questionSearch.value = '';
};

const onSearchBook = () => {
    // 实际项目中这里可以调用API搜索错题本
    console.log('搜索错题本:', searchBook.value);
};

const onQuestionSearch = () => {
    // 实际项目中这里可以调用API搜索错题
    console.log('搜索错题:', questionSearch.value);
};

const selectError = (error:any) => {
    
};

const selectRelatedQuestion = (question:any) => {
    console.log('选中相关题目:', question);
    // 可以在这里实现跳转到题目详情或其他操作
};

const updateRelatedQuestions = (error:any) => {
    //这里实现根据选中的错题更新相关题目
};

const handleAddBook = () => {
    if (!newBookName.value.trim()) return;
    
    const newBook = {
        id: books.value.length + 1,
        name: newBookName.value,
        type: newBookType.value,
        count: 0
    };
    
    books.value.push(newBook);
    newBookName.value = '';
    showAddBookModal.value = false;
};

// 监听选中的错题本变化
watch(activeBookId, () => {
    selectedError.value = null;
});
</script>

<style scoped>
.container {
    background-color: #f5f5f5;
    display: flex;
    height: 100vh;
}

.left {
    width: 340px;
    min-width: 300px;
    background: #fff;
    box-shadow: 2px 0 8px #f0f1f2;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
}

.right {
    height: 100%;
    overflow: hidden;
    flex: 1;
    background-color: #f9fbfd;
    display: flex;
}

.navbar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 32px 24px 24px 24px;
    box-sizing: border-box;
}

.search-container {
    position: sticky;
    background-color: #F9FBFD;
    top: 0;
    z-index: 100;
    display: flex;
    align-self: flex-start;
    width: 100%;
    height: 80px;
}

.search-box {
    margin-top: 25px;
    margin-bottom: 30px;
    width: 40%;
    display: flex;
    align-items: center;
    height: 36px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 0;
    border: 1px solid #e1e8ff;
}

.question-search-input {
    flex: 1;
    height: 30px;
    border: none;
    font-size: 14px;
    padding: 8px 16px;
    background: transparent;
}

.question-search-input:focus {
    box-shadow: none;
}

.question-search-input:hover {
    border-color: #d0d7ff;
}

.question-search-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    border-radius: 0 6px 6px 0;
    font-size: 14px;
    padding: 0 20px;
    background-color: #3760f7;
    border: none;
    transition: all 0.3s;
}

.question-search-btn:hover {
    background-color: #4a74ff;
}

.book-nav {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.book-nav .item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background 0.2s;
    cursor: pointer;
    font-size: 14px;
    color: #333;
}

.book-nav .item:hover {
    background: #f5f5f5;
}

.book-nav .item.active {
    background: #e6f7ff;
    color: #1890ff;
    font-weight: 500;
}

.icon {
    margin-right: 8px;
    font-size: 18px;
}

.icon.front { color: #DE868F; }
.icon.back { color: #FCCA00; }
.icon.ops { color: #6C6C6C; }

.add-book {
    margin-top: 28px;
    display: flex;
    align-items: center;
    color: #1890ff;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
}

.add-book:hover {
    color: #40a9ff;
}

.icon.add {
    margin-right: 8px;
    font-size: 18px;
}

.goback {
    display: flex;
    align-items: center;
    margin-top: auto;
    color: #888;
    cursor: pointer;
    font-size: 15px;
    padding: 10px 0 0 0;
    transition: color 0.2s;
}

.goback:hover {
    color: #1890ff;
}

.main-container {
    flex: 1;
    display: flex;
    height: 100vh;
    justify-content: center;
}

.main-content {
    width: 90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    padding-bottom: 20px;
}

.error-cards-container {
    width: 800px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.ai {
    width: 300px;
    height: 100%;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: end;
}

.ai .ai-box {
    width: 90%;
    height: 650px;
    background-color: #f0f5ff;
    border-bottom-left-radius: 15px;
    border-top-left-radius: 15px;
    padding: 20px;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.title-area {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px solid #e1e8ff;
}

.logo {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: url('../../assets/images/common/logo.png') no-repeat center/contain;
    margin-right: 8px;
}

.title-text {
    font-weight: 600;
    font-size: 16px;
    color: #2c3e50;
    margin: 0;
}

.question-list {
    padding: 5px 0;
    max-height: 580px;
    overflow-y: auto;
}

.question-list::-webkit-scrollbar {
    width: 4px;
}

.question-list::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.question-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.question-item:hover {
    background: #f5f7fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.content {
    display: flex;
    align-items: flex-start;
    flex: 1;
}

.index {
    color: #7d8db1;
    font-weight: 500;
    margin-right: 5px;
    min-width: 10px;
}

.question-title {
    color: #333;
    font-size: 14px;
    line-height: 1.4;
    word-break: break-word;
}

.heat {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
}

::-webkit-scrollbar {
    display: none;
}
</style>