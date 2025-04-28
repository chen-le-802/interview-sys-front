<template>
    <div style="background-color:#f5f5f5">
        <FrontendHeader></FrontendHeader>
        <div class="containner">
            <div class="left">
                <div class="bank-title-box"></div>
                <div style="width: 920px;">
                    <BankList></BankList>
                </div>
            </div>
            <div class="right">
                <RankList :listTitle="'热门题目榜'"></RankList>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import RankList from '@/components/shared/RankList.vue';

</script>
<style scoped>
.containner {
    display: flex;
    width: 1200px;
    margin: 32px auto;
}

.bank-title-box {
    height: 249px;
    background-color: #fff;
    width: 895px;
    border-radius: 8px;
}
</style>