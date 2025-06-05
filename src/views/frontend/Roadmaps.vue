<template>
    <div style="background-color: #f5f5f5;">
        <FrontendHeader></FrontendHeader>
        <div style="display: flex;justify-content: center;align-items: flex-start;margin-top: 40px;">
            <div class="main-content">
                <a-tabs v-model:activeKey="activeKey" :tab-position="mode" @tabScroll="callback" type="line"
                    :tabBarStyle="{
                        height: '52px',
                        padding: '0 20px',
                        background: '#fff',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }">
                    <template #tabBarExtraContent>
                        <a-input style="
                                height: 32px;
                                margin-left: auto;
                                border-radius: 32px;
                                transition: width 0.3s ease;
                            " @focus="enlargeInput" @blur="shrinkInput" :style="{ width: inputWidth }">
                            <template #prefix>
                                <SearchOutlined style="color:#b4b4b4" />
                            </template>
                        </a-input>
                    </template>
                    <a-tab-pane v-for="(routeTab, index) in routeTabs" :key="index.toString()" :tab="routeTab.tab">
                        <div class="list">
                            <div class="list-item" v-for="(item, itemIndex) in routeTab.list" :key="itemIndex" @click="goToRoadmap">
                                <h3>{{ item.title }}</h3>
                                <p class="content">{{ item.content }}</p>
                                <div class="tags">
                                    <a-tag color="#108ee9" v-for="(tag, tagIndex) in item.tabs" :key="tagIndex"
                                        class="tag">
                                        {{ tag }}
                                    </a-tag>
                                </div>
                                <div class="item-footer">
                                    <span class="update-time">{{ item.updateTime }}</span>
                                </div>
                            </div>
                        </div>
                    </a-tab-pane>
                </a-tabs>
                <a-pagination v-model:current="current" :total="1" show-less-items />
            </div>

            <RankList :list-title="'热门题目榜'"></RankList>
        </div>
        <Footer></Footer>
    </div>
</template>

<script setup lang="ts">
import type { TabsProps } from 'ant-design-vue';
import { SearchOutlined } from '@ant-design/icons-vue';

const current = ref(1);
const router = useRouter();
const routeTabs = [
    {
        tab: 'Java刷题路线',
        list: [
            {
                title: "Java校招/应届刷题知识路线",
                content: "涵盖Java核心语法、集合框架、多线程等面试重点内容",
                tabs: ["Java", "应届"],
                updateTime: "2024-03-15 12:00"
            },
            {
                title: "Java基础知识体系",
                content: "面向对象、异常处理、IO流等基础知识点详解",
                tabs: ["Java", "基础"],
                updateTime: "2024-03-14 11:00"
            },
        ]
    },
    {
        tab: '前端刷题路线',
        list: [
            {
                title: "前端核心知识体系",
                content: "HTML/CSS核心、JavaScript高级、框架原理详解",
                tabs: ["前端", "应届"],
                updateTime: "2024-03-15 11:31"
            }
        ]
    },
    {
        tab: '算法刷题路线',
        list: [
            {
                title: "算法基础",
                content: "数据结构、排序算法、搜索算法等算法基础",
                tabs: ["算法", "基础"],
                updateTime: "2024-03-15 11:31"
            }
        ]
    },
    {
        tab: 'C++刷题路线',
        list: [
            {
                title: "C++基础知识体系",
                content: "指针、动态内存管理、面向对象等C++基础知识",
                tabs: ["C++", "基础"],
                updateTime: "2024-03-15 11:31"
            }
        ]
    },
    {
        tab: 'Go刷题路线',
        list: [
            {
                title: "Go基础知识体系",
                content: "Go语言基础语法、并发编程、Web编程等Go基础知识",
                tabs: ["Go", "基础"],
                updateTime: "2024-03-15 11:31"
            }
        ]
    },
    {
        tab: 'Python刷题路线',
        list: [
            {
                title: "Python基础知识体系",
                content: "Python基础语法、数据结构、算法等Python基础知识",
                tabs: ["Python", "基础"],
                updateTime: "2024-03-15 11:31"
            }
        ]
    },
    {
        tab: '大数据刷题路线',
        list: [
            {
                title: "大数据基础知识体系",
                content: "Hadoop、Spark、Hbase、Zookeeper等大数据基础知识",
                tabs: ["大数据", "基础"],
                updateTime: "2024-03-15 11:31"
            }
        ]
    }
];

const mode = ref<TabsProps['tabPosition']>('top');
const activeKey = ref('0'); // 改为字符串以兼容所有 key 类型
const callback: TabsProps['onTabScroll'] = val => {
    console.log(val);
};
const inputWidth = ref('120px');
const enlargeInput = () => { inputWidth.value = '200px'; };
const shrinkInput = () => { inputWidth.value = '120px'; };
const goToRoadmap =()=>{
    console.log('跳转到刷题路线');
    router.push('/roadmap');
};
</script>

<style scoped>
.main-content {
    width: 848px;
    margin-right: 20px;
}

.list-item {
    padding: 16px;
    width: 100%;
    min-height: 165px;
    background-color: #fff;
    margin-bottom: 20px;
    border-radius: 8px;
}

.list-item .content {
    color: #949494;
    padding: 10px 0;
}

.list-item .tags {
    display: flex;
    flex-wrap: wrap;
}

.list-item .tags .tag {
    margin-right: 8px;
    margin-bottom: 8px;
}

.list-item .item-footer {
    margin-top: 10px;
    color: #949494;
}
</style>