<template>
    <div style="background-color: #f5f5f5;">
    <FrontendHeader />
    <div class="w">
        <div class="left">
            <div class="header">
                <h1 style="color: #1F1F1F;">Java 校招/应届刷题知识路线</h1>
                <div class="title-info">
                    <div class="author" style="font-size: 16px;">
                        <a-avatar :size="38" style="margin-right: 8px;">M</a-avatar>
                        <p>面试斩官方</p>
                        <div class="division-line"></div>
                    </div>
                    <div class="date">
                        <p>2023-10-01 11:00</p>
                        <div class="division-line"></div>
                    </div>
                    <div class="tags">
                        <a-tag color="#108EE9">Java刷题路线</a-tag>
                        <a-tag color="#108EE9">Java</a-tag>
                        <div class="division-line"></div>
                    </div>
                    <div class="read-number">
                        阅读 &nbsp;9477
                    </div>
                    
                    
                </div>
                <div style="flex:1;display: flex;align-items: center;color:#8C8C8C">扎实计算机网络、操作系统基础、Java基础、深入理解Java集合与并发、掌握Java虚拟机原理，以及熟悉常用的数据库（MySQL）和缓存
(Redis)技术</div>
                <div style="height:50px;font-size: 16px;color:#0969DA">
                    <StarFilled style="color:#E2BD37"/>
                    25年最新Java学习路线</div>
            </div>
            <div class="content">这里是官方后台还没编写的内容</div>
        </div>
        <div class="right">
            <RankList  :list-title="'热门题目榜'"></RankList>
        </div>
    </div>
    <Footer></Footer>
    </div>
</template>
<script setup lang="ts">
import {StarFilled} from '@ant-design/icons-vue'

</script>
<style scoped lang="css">
.w{
    width:1200px;
    margin:0 auto;
    display: flex;
    margin-top: 30px;
    align-items: flex-start
}
.left{
    flex:1;
    border-radius: 10px;
    background-color: #fff;
    padding: 25px;
}
.right{
    width:300px;
    display: flex;
    justify-content: end;
}
.left .header{
    display: flex;
    flex-direction: column;
    height: 238px;
    border-bottom: 3.5px solid #D0D7DE;
    margin-bottom: 25px;

}
.left .header .title-info{
    display: flex;
    margin-top:20px;
    align-items: center;
}
.left .header .title-info .author,
.left .header .title-info .date,
.left .header .title-info .tags,
.left .header .title-info .read-number{
    display: flex;
    align-items: center;
}
.division-line{
    width: 1px;
    height: 15px;
    background-color: #F0F0F0;
    margin: 0 25px;
}
</style>