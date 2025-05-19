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
                <div class="goback"><RollbackOutlined class="icon" />退出错题本</div>
            </div>
        </div>
        <div class="right"></div>
    </div>
</template>
<script setup lang="ts">
import { BookFilled, PlusCircleOutlined, RollbackOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
const search_book = ref('');
</script>

<style scoped>
.container {
    background-color: #f5f5f5;
    display: flex;
    min-height: 100vh;
}
.left {
    width: 340px;
    min-width: 300px;
    background: #fff;
    box-shadow: 2px 0 8px #f0f1f2;
    display: flex;
    flex-direction: column;
}
.right {
    flex: 1;
    background-color: #f9fbfd;
    min-height: 100vh;
}
.navbar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 32px 24px 24px 24px;
    box-sizing: border-box;
}
.search-input {
    width: 100%;
    margin-bottom: 24px;
}
.book-nav {
    margin-top: 10px;
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
</style>
