<template>
    <div class="bank-list">
        <ul>
            <li v-for="(item, index) in questionList" :key="index" @click="handleQuestionClick(item)">
                <div class="bank-logo" :style="{ backgroundImage: `url(${item.logo})` }"></div>
                <div class="bank-info">
                    <div class="bank-title">{{ item.title }}</div>
                    <div class="bank-desc">{{ item.description }}</div>
                </div>
            </li>
        </ul>
    </div>
</template>
<script setup lang="ts">

const router = useRouter()
const questionList = ref([
    {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    },
    {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    }, {
        title: 'Java基础语法',
        description: 'Java作为广泛应用的编程语言....',
        logo: '/src/assets/images/frontend/java.png',
        tags: ['后端']
    },
]);
const handleQuestionClick = (item: any) => {
    console.log('查看题目集：', item.title)
    router.push("/bank")
};
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
}



.bank-list ul li .bank-logo {
    width: 40px;
    margin-left: 20px;
    height: 40px;
    background: url('../../assets/images/frontend/java.png');
    background-size: cover;
}

.bank-list ul li .bank-info {
    height: 50%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 10px;
}

.bank-list ul li .bank-title {
    font-size: 16px;
    font-weight: bold;
}
</style>