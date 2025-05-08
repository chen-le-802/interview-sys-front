<template>
    <div class="title-box">
        <div class="bank-logo"></div>
        <div class="bank-info">
            <div class="bank-name">Java热门面试题200道</div>
            <div class="bank-desc">2025最新Java面试题，一网打尽Java热门面试题！涵盖Java基础、框架、高级特性</div>
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
import { DocumentChecked, Share } from '@element-plus/icons-vue';
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
    background: url(../../assets/images/frontend/bank-logo.webp);
    background-size: contain;
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