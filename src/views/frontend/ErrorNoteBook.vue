<template>
    <div class="container">
        <div class="left">
            <div class="navbar">
                <a-input-search
                    v-model:value="search_book"
                    placeholder="搜索错题本"
                    class="search-input"
                    @search=""
                />
                <div class="book-nav">
                    <div class="item"><BookFilled class="icon front" />前端错题</div>
                    <div class="item"><BookFilled class="icon back" />后端错题</div>
                    <div class="item"><BookFilled class="icon ops" />运维错题</div>
                    <div class="add-book"><PlusCircleOutlined class="icon add" />添加错题本</div>
                </div>
                <div class="goback" @click="goback"><RollbackOutlined class="icon" />退出错题本</div>
            </div>
        </div>
        <div class="right">
            <div class="main-container">
                <div class="main-content">
                    <div class="search-containner">
                    <div class="search-box">
    <a-input
      v-model:value="questionSearch"
      placeholder="搜索错题或关键字"
      class="question-search-input"
      @pressEnter="onQuestionSearch"
      allow-clear
    >
  
    </a-input>
    <a-button 
      type="primary" 
      class="question-search-btn" 
      @click="onQuestionSearch"
      :icon="h(SearchOutlined)"
    >
      
    </a-button>
    </div>
  </div>
                    <div style="width:800px"><ErrorCard></ErrorCard>
                    <ErrorCard></ErrorCard></div>

                </div>
            </div>
            <div class="ai">
                <div class="ai-box">
                    <div class="title-area">
                        <div class="logo"></div>
                        <p class="title-text">为您找到合适的题目：</p>
                    </div>
                    
                    <!-- 题目列表 -->
                    <div class="question-list">
                        <div v-for="(item, index) in questions" :key="index" class="question-item">
                            <div class="content">
                                <span class="index">{{ index + 1 }}.</span>
                                <span class="question-title">{{ item.title }}</span>
                            </div>
                          
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { BookFilled, PlusCircleOutlined, RollbackOutlined,SearchOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import { h } from 'vue';
const router = useRouter();
const goback = () => {
   router.back();
};
const search_book = ref('');
//mock
const questions=[{
    title: '如何优化前端性能？',
    heat: 1200
}, {
    title: 'Vue3的响应式原理是什么？',
    heat: 800
}, {
    title: 'Node.js的事件循环机制是怎样的？',
    heat: 950
}, {
    title: 'Docker在微服务架构中的应用场景？',
    heat: 600
}]
const questionSearch = ref('')
const onQuestionSearch = () => {
    // 这里可以添加搜索逻辑
    // 比如过滤questions或请求接口
    // console.log('搜索内容：', questionSearch.value)
}
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
    overflow:auto;
}
.right {
    height: 100%;
    overflow:auto;
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
.search-containner{
    position: sticky;
    background-color: #F9FBFD;
    top: 0;
    z-index: 100;
    display: flex;
    align-self: flex-start;
    width:100%;
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
  background: transparent
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
    flex:1;
    display: flex;
    height: 100vh;
    justify-content: center;
}
.main-content{
    width:90%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
}

.ai{
    width:300px;
    height: 100%;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: end;
    
}
.ai .ai-box{
    width:90%;
    height: 650px;
    background-color: #f0f5ff;
    border-bottom-left-radius:15px;
    border-top-left-radius:15px;
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
    padding: 10px ;
    margin-bottom: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    /* background-color: rgb(255, 252, 252);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03); */
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
    line-height: 1;
    word-break: break-word;
}
::-webkit-scrollbar {
  display: none; /* 针对 Chrome 和 Edge */
}
</style>