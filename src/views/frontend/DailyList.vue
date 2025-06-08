<template>
    <div style="background-color: #f5f5f5;">
        <FrontendHeader></FrontendHeader>
        <div class="daily-container">
            <!-- 每日推荐题单信息卡片 -->
            <div class="title-box">
                <div class="bank-logo daily-logo"></div>
                <div class="bank-info">
                    <div class="bank-name">每日题单</div>
                    <div class="bank-desc">基于您的历史错题智能推荐，专为前端开发岗位定制的10道精选题目。</div>

                    <div class="options">
                        <el-button type="primary" size="default" color="#1677ff" round @click="startDaily()">
                            开始今日刷题
                        </el-button>
                        <el-button type="default" size="default" round @click="gotoExam">
                            <el-icon style="margin-right: 5px;">
                                <DocumentChecked />
                            </el-icon>
                            模拟测试
                        </el-button>
                        <el-button type="default" size="default" round @click="refreshDaily">
                            <el-icon style="margin-right: 5px;">
                                <Refresh />
                            </el-icon>
                            换一批题目
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 题目列表 -->
            <div class="table-box">
                <div class="section-title">今日推荐题目</div>
                <Table :tableWidth="1200" :questions="dailyQuestions" :loading="false" />
            </div>

            <!-- 错误标签分析 -->
            <div class="analysis-box">
                <div class="section-title">基于你的薄弱环节推荐</div>
                <div class="tag-analysis">
                    <div class="weak-tags">
                        <span class="weak-tag">JavaScript闭包</span>
                        <span class="weak-tag">Vue生命周期</span>
                        <span class="weak-tag">CSS布局</span>
                        <span class="weak-tag">异步编程</span>
                        <span class="weak-tag">性能优化</span>
                    </div>
                    <div class="recommendation-text">
                        根据你最近的答题情况，我们发现你在以上几个知识点上还有提升空间，今日推荐的题目将重点覆盖这些领域。
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DocumentChecked, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Table from '@/components/shared/Table.vue';
import FrontendHeader from '@/components/layout/FrontendHeader.vue';
import router from '@/router';

// 题目数据池
const questionPools = [
    [
        {
            id: 'daily-001',
            question: 'JavaScript中闭包的概念及其在实际开发中的应用场景',
            difficulty: '中等',
            tags: ['JavaScript', '闭包', '作用域']
        },
        {
            id: 'daily-002', 
            question: 'Vue3 Composition API中setup函数的执行时机和注意事项',
            difficulty: '中等',
            tags: ['Vue3', '生命周期', 'Composition API']
        },
        {
            id: 'daily-003',
            question: 'CSS Grid和Flexbox的区别，什么场景下使用Grid更合适',
            difficulty: '简单',
            tags: ['CSS', '布局', 'Grid', 'Flexbox']
        },
        {
            id: 'daily-004',
            question: 'Promise、async/await、Generator的区别和使用场景',
            difficulty: '困难',
            tags: ['JavaScript', '异步编程', 'Promise']
        },
        {
            id: 'daily-005',
            question: 'React中useEffect的依赖数组原理和最佳实践',
            difficulty: '中等',
            tags: ['React', 'Hooks', 'useEffect']
        },
        {
            id: 'daily-006',
            question: '前端性能优化：如何减少首屏加载时间',
            difficulty: '中等',
            tags: ['性能优化', '首屏加载', '工程化']
        },
        {
            id: 'daily-007',
            question: 'TypeScript中泛型的高级用法和实际应用',
            difficulty: '困难',
            tags: ['TypeScript', '泛型', '类型系统']
        },
        {
            id: 'daily-008',
            question: 'Webpack和Vite的打包原理对比分析',
            difficulty: '中等',
            tags: ['构建工具', 'Webpack', 'Vite']
        },
        {
            id: 'daily-009',
            question: '浏览器缓存策略：强缓存和协商缓存的区别',
            difficulty: '简单',
            tags: ['浏览器', '缓存', 'HTTP']
        },
        {
            id: 'daily-010',
            question: '微前端架构设计：single-spa和qiankun的实现原理',
            difficulty: '简单',
            tags: ['微前端', '架构设计', 'single-spa']
        }
    ],
    [
        {
            id: 'daily-011',
            question: 'JavaScript事件循环机制：宏任务和微任务的执行顺序',
            difficulty: '困难',
            tags: ['JavaScript', '事件循环', '异步编程']
        },
        {
            id: 'daily-012',
            question: 'Vue响应式原理：Object.defineProperty vs Proxy的对比',
            difficulty: '中等',
            tags: ['Vue', '响应式', 'Proxy']
        },
        {
            id: 'daily-013',
            question: 'CSS预处理器：Sass、Less、Stylus的特性对比',
            difficulty: '简单',
            tags: ['CSS', '预处理器', 'Sass', 'Less']
        },
        {
            id: 'daily-014',
            question: 'React Fiber架构的设计原理和性能优势',
            difficulty: '困难',
            tags: ['React', 'Fiber', '性能优化']
        },
        {
            id: 'daily-015',
            question: 'ES6模块化：import/export与CommonJS的区别',
            difficulty: '中等',
            tags: ['ES6', '模块化', 'CommonJS']
        },
        {
            id: 'daily-016',
            question: 'HTTP/2和HTTP/3的新特性及其对前端的影响',
            difficulty: '中等',
            tags: ['HTTP', '网络协议', '性能优化']
        },
        {
            id: 'daily-017',
            question: 'Web Component技术栈：Shadow DOM和Custom Elements',
            difficulty: '中等',
            tags: ['Web Component', 'Shadow DOM', '组件化']
        },
        {
            id: 'daily-018',
            question: '前端安全：XSS、CSRF攻击的防护策略',
            difficulty: '中等',
            tags: ['前端安全', 'XSS', 'CSRF']
        },
        {
            id: 'daily-019',
            question: 'PWA渐进式Web应用：Service Worker的应用场景',
            difficulty: '简单',
            tags: ['PWA', 'Service Worker', '离线缓存']
        },
        {
            id: 'daily-020',
            question: 'Node.js事件驱动模型：libuv的工作原理',
            difficulty: '困难',
            tags: ['Node.js', '事件驱动', 'libuv']
        }
    ],
    [
        {
            id: 'daily-021',
            question: '大型项目架构：如何设计可维护的前端代码结构',
            difficulty: '困难',
            tags: ['架构设计', '代码组织', '最佳实践']
        },
        {
            id: 'daily-022',
            question: 'Vue Router的实现原理：Hash模式vs History模式',
            difficulty: '中等',
            tags: ['Vue Router', '路由', 'SPA']
        },
        {
            id: 'daily-023',
            question: 'CSS-in-JS解决方案：styled-components和emotion对比',
            difficulty: '简单',
            tags: ['CSS-in-JS', 'styled-components', 'emotion']
        },
        {
            id: 'daily-024',
            question: 'JavaScript内存管理：垃圾回收机制和内存泄漏预防',
            difficulty: '中等',
            tags: ['JavaScript', '内存管理', '垃圾回收']
        },
        {
            id: 'daily-025',
            question: 'Redux状态管理：中间件机制和最佳实践',
            difficulty: '中等',
            tags: ['Redux', '状态管理', '中间件']
        },
        {
            id: 'daily-026',
            question: '前端监控系统：错误捕获和性能数据收集',
            difficulty: '中等',
            tags: ['前端监控', '错误捕获', '性能分析']
        },
        {
            id: 'daily-027',
            question: 'GraphQL vs RESTful API：在前端项目中的选择策略',
            difficulty: '简单',
            tags: ['GraphQL', 'RESTful', 'API设计']
        },
        {
            id: 'daily-028',
            question: '前端自动化测试：Jest、Cypress、Playwright的应用场景',
            difficulty: '中等',
            tags: ['自动化测试', 'Jest', 'Cypress']
        },
        {
            id: 'daily-029',
            question: 'Electron桌面应用开发：主进程和渲染进程通信',
            difficulty: '困难',
            tags: ['Electron', '桌面应用', '进程通信']
        },
        {
            id: 'daily-030',
            question: 'WebAssembly在前端的应用：性能优化和使用场景',
            difficulty: '困难',
            tags: ['WebAssembly', '性能优化', '底层技术']
        }
    ],
    [
        {
            id: 'daily-031',
            question: 'Svelte框架特性：编译时优化vs运行时框架的区别',
            difficulty: '中等',
            tags: ['Svelte', '编译时优化', '框架对比']
        },
        {
            id: 'daily-032',
            question: 'Next.js SSR/SSG：服务端渲染和静态生成的选择',
            difficulty: '中等',
            tags: ['Next.js', 'SSR', 'SSG']
        },
        {
            id: 'daily-033',
            question: 'CSS变量和主题切换：动态样式系统设计',
            difficulty: '简单',
            tags: ['CSS变量', '主题切换', '动态样式']
        },
        {
            id: 'daily-034',
            question: 'JavaScript装饰器模式：ES6 Decorator的实际应用',
            difficulty: '中等',
            tags: ['JavaScript', '装饰器', '设计模式']
        },
        {
            id: 'daily-035',
            question: 'Webpack Module Federation：微前端架构实现',
            difficulty: '困难',
            tags: ['Webpack', 'Module Federation', '微前端']
        },
        {
            id: 'daily-036',
            question: '前端工程化：Monorepo架构的优势和挑战',
            difficulty: '中等',
            tags: ['Monorepo', '工程化', '项目管理']
        },
        {
            id: 'daily-037',
            question: 'Web API新特性：IntersectionObserver和ResizeObserver',
            difficulty: '简单',
            tags: ['Web API', 'Observer', '性能优化']
        },
        {
            id: 'daily-038',
            question: 'TypeScript高级类型：条件类型和映射类型的应用',
            difficulty: '困难',
            tags: ['TypeScript', '高级类型', '类型编程']
        },
        {
            id: 'daily-039',
            question: 'Deno vs Node.js：新一代JavaScript运行时对比',
            difficulty: '简单',
            tags: ['Deno', 'Node.js', '运行时环境']
        },
        {
            id: 'daily-040',
            question: 'WebGL和Three.js：3D图形在Web中的应用',
            difficulty: '困难',
            tags: ['WebGL', 'Three.js', '3D图形']
        }
    ]
];

// 当前选中的题目集合
const dailyQuestions = ref(questionPools[0]);

const startDaily = () => {
    ElMessage.success('开始今日刷题，加油！');
    router.push('/question?mode=daily');
};

const gotoExam = () => {
    router.push('/exam?type=daily');
};

// 添加当前题目池索引追踪
const currentPoolIndex = ref(0);

const refreshDaily = () => {
    ElMessage.info('正在为你重新推荐题目...');
    
    // 随机选择一套题目池（避免选择当前正在使用的）
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * questionPools.length);
    } while (newIndex === currentPoolIndex.value && questionPools.length > 1);
    
    setTimeout(() => {
        currentPoolIndex.value = newIndex;
        dailyQuestions.value = [...questionPools[newIndex]];
        ElMessage.success('已为您换一批题目！');
    }, 1000);
};
</script>

<style lang="css" scoped>
.daily-container {
    min-height: calc(100vh - 60px);
    padding-bottom: 40px;
}

.title-box {
    display: flex;
    align-items: center;
    width: 1144px;
    height: 200px;
    margin: 32px auto;
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.daily-logo {
    width: 100px;
    height: 100px;
    background-image: url('@/assets/images/icon/daily.jpg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 12px;
    position: relative;
}

.bank-info {
    margin-left: 30px;
    height: 160px;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
}

.bank-name {
    height: 40px;
    font-size: 28px;
    font-weight: bold;
    color: #1a1a1a;
}

.bank-desc {
    color: #666;
    font-size: 16px;
    line-height: 1.5;
}

.options {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 24px;
}

.table-box {
    width: 1141px;
    margin: 0 auto 40px auto;
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analysis-box {
    width: 1141px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    font-size: 20px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
}

.tag-analysis {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.weak-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.weak-tag {
    background: #fef2f2;
    color: #dc2626;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 14px;
    border: 1px solid #fecaca;
}

.recommendation-text {
    color: #666;
    font-size: 15px;
    line-height: 1.6;
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .title-box,
    .table-box,
    .analysis-box {
        width: 90%;
        margin-left: auto;
        margin-right: auto;
    }
}

/* 按钮悬停效果 */
.el-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>