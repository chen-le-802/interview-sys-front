   <template>
   <div class="answer-content">
            这是答案
        </div>
        <div class="answer-footer">
            <div class="options">
                <div class="option-item">
                    <LikeOutlined />
                    108
                </div>
                <div class="option-item">
                    <SoundOutlined />
                    催更

                </div>
                <div class="option-item">
                    <EditOutlined />
                    反馈
                </div>
            </div>

        </div>
</template>
<script setup lang="ts">
import { View, Hide } from '@element-plus/icons-vue';
import { LikeOutlined, SoundOutlined, EditOutlined } from '@ant-design/icons-vue'

</script>
<style lang="css" scoped>
.answer-content {
    padding: 25px;
    flex: 1;
}

.answer-footer {
    display: flex;
    align-items: center;
    width: 90%;
    border-top: #f5f5f5 solid 1.5px;
    height: 70px;
    margin: 10px auto;
    margin-bottom: 0px;
    color: #c1c1c1;
    font-size: 13px;
}

.answer-footer .options {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
}

.options .option-item {

    cursor: pointer;
}

.options .option-item:hover {
    color: #1677ff;

}</style>