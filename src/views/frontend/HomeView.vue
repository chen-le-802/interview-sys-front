<template>
    <div class="container">
        <FrontendHeader></FrontendHeader>
        <QuestionBank></QuestionBank>
        <div style="width: 1200px; margin: 20px auto;">
            <h2 style="margin-bottom: 20px;">面试题目</h2>
        </div>

        <div style="display: flex;width:1200px;margin: 0 auto;justify-content: space-between;margin-top: 30px;">

            <Table></Table>
            <div>
                <RankList :questions="questions" :listTitle="'热门题目榜'"></RankList>
                <UserRankList></UserRankList>
                <RankList :questions="lable" :listTitle="'热门标签'"></RankList>

            </div>
        </div>
        <Footer></Footer>
    </div>



</template>

<script lang="ts">
import { defineComponent } from 'vue'


export default defineComponent({

    name: 'HomeView',
    setup() {
        // Mock数据
        const questions = ref([
            { title: '你认为Java的优势是什么?', heat: 52140 },
            { title: 'Java中的序列化和反序列化...', heat: 47358 },
            { title: '什么是Java的多态特性?', heat: 36373 },
            { title: 'MySQL中的数据排序是怎么...', heat: 33784 },
            { title: '什么是Java中的不可变类?', heat: 33551 },
            { title: '说说Java中HashMap的原...', heat: 32892 },
            { title: 'Java中的参数传递是按值还...', heat: 29074 },
            { title: '详细描述一条SQL语句在...', heat: 29044 },
            { title: 'Java中Exception和Error有...', heat: 28783 },
            { title: 'Java中有哪些集合类?请简..', heat: 27068 }
        ])
        const lable = ref([
            { title: 'Java', heat: 52140 },
            { title: 'MySQL', heat: 47358 },
            { title: '面试', heat: 36373 },
            { title: '面试题', heat: 33784 },])
        return {
            questions,
            lable
        }
    }
})
</script>


<style scoped>
header {
    width: 100%;
    height: 56px;
    line-height: 56px;
    background-color: #ffffff;
    border-bottom: 1px solid #f1efef;
}

.header-main {
    display: flex;
    width: 1440px;
    max-width: 1440px;
    margin: 0 auto;
    height: 56px;
    background-color: aquamarine;
}

.container {
    width: 100%;
    background-color: #f5f5f5;
}
</style>