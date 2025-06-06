<template>
    <div class="answer-content" v-if="showAnswer">
        <!-- 渲染markdown内容 -->
        <div class="content-wrapper" v-html="renderedContent"></div>
    </div>
    <div class="answer-content hidden-content" v-else>
        <div class="hidden-message">
            <el-icon size="24" color="#ccc">
                <Hide />
            </el-icon>
            <p>答案已隐藏，点击右上角显示答案</p>
        </div>
    </div>

    <div class="answer-footer">
        <div class="options">
            <div class="option-item" @click="handleLike">
                <LikeOutlined />
                {{ likeCount }}
            </div>
            <div class="option-item" @click="handleUpdate">
                <SoundOutlined />
                催更
            </div>
            <div class="option-item" @click="handleFeedback">
                <EditOutlined />
                反馈
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, nextTick, watch, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import { LikeOutlined, SoundOutlined, EditOutlined } from '@ant-design/icons-vue'

// Props 接口定义
interface AnswerContentProps {
    questionId: string
    content?: string
    answer?: string
}

const props = withDefaults(defineProps<AnswerContentProps>(), {
    content: '',
    answer: ''
})

// 从父组件注入显示/隐藏答案状态
const showAnswer = inject<Ref<boolean>>('showAnswer', ref(true))

// 响应式数据
const likeCount = ref(108)

// 渲染markdown内容
const renderedContent = computed(() => {
    if (!props.content && !props.answer) return ''

    const content = props.answer

    return parseMarkdown(content)
})

// 简单的markdown解析函数
const parseMarkdown = (text: string): string => {
    if (!text) return ''

    const lines = text.split('\n')
    let result = ''
    let inCodeBlock = false
    let codeLanguage = ''
    let inTable = false
    let tableRows: string[] = []
    let mermaidCounter = 0 // 用于生成唯一的mermaid ID

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]
        const trimmed = line.trim()

        // 处理代码块开始/结束
        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                if (codeLanguage === 'mermaid') {
                    // 结束mermaid代码块
                    result += '</div>\n'
                } else {
                    // 结束普通代码块
                    result += '</pre></code>\n'
                }
                inCodeBlock = false
                codeLanguage = ''
            } else {
                codeLanguage = trimmed.substring(3).trim()
                if (codeLanguage === 'mermaid') {
                    // 开始mermaid代码块
                    mermaidCounter++
                    result += `<div class="mermaid-container" data-mermaid-id="mermaid-${mermaidCounter}">\n`
                } else {
                    // 开始普通代码块
                    result += `<pre><code class="language-${codeLanguage}">\n`
                }
                inCodeBlock = true
            }
            continue
        }

        // 在代码块内处理
        if (inCodeBlock) {
            if (codeLanguage === 'mermaid') {
                // 在mermaid块内，收集mermaid代码
                result += line + '\n'
            } else {
                // 在普通代码块内直接输出
                result += line + '\n'
            }
            continue
        }

        // 处理表格
        if (trimmed.includes('|') && trimmed.split('|').length > 2) {
            if (!inTable) {
                inTable = true
                tableRows = []
            }
            tableRows.push(line)

            // 检查是否是表格结束（下一行不是表格或到达末尾）
            const nextLine = index + 1 < lines.length ? lines[index + 1].trim() : ''
            if (!nextLine.includes('|') || index === lines.length - 1) {
                // 渲染表格
                result += renderTable(tableRows)
                inTable = false
                tableRows = []
            }
            continue
        }

        // 如果之前在表格中但当前行不是表格，结束表格
        if (inTable && !trimmed.includes('|')) {
            result += renderTable(tableRows)
            inTable = false
            tableRows = []
        }

        // 处理分割线
        if (trimmed === '---' || trimmed.match(/^-{3,}$/)) {
            result += '<hr>\n'
            continue
        }

        // 处理标题
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
        if (headingMatch) {
            const level = headingMatch[1].length
            const title = headingMatch[2].trim()
            // 生成与目录相同的ID格式
            const id = `heading-${level}-${index}-${title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase()}`
            result += `<h${level} id="${id}" class="markdown-heading">${title}</h${level}>\n`
            continue
        }

        // 处理列表项
        if (trimmed.match(/^[\*\-\+]\s+/)) {
            const content = trimmed.substring(2).trim()
            const processedContent = processInlineMarkdown(content)
            result += `<ul><li>${processedContent}</li></ul>\n`
            continue
        }

        // 处理有序列表
        if (trimmed.match(/^\d+\.\s+/)) {
            const content = trimmed.replace(/^\d+\.\s+/, '').trim()
            const processedContent = processInlineMarkdown(content)
            result += `<ol><li>${processedContent}</li></ol>\n`
            continue
        }

        // 空行
        if (!trimmed) {
            result += '<br>\n'
            continue
        }

        // 普通段落
        const processedLine = processInlineMarkdown(line)
        result += `<p>${processedLine}</p>\n`
    }

    // 确保代码块和表格正确关闭
    if (inCodeBlock) {
        if (codeLanguage === 'mermaid') {
            result += '</div>\n'
        } else {
            result += '</pre></code>\n'
        }
    }
    if (inTable && tableRows.length > 0) {
        result += renderTable(tableRows)
    }

    return result
}

// 处理行内markdown格式
const processInlineMarkdown = (text: string): string => {
    let processed = text

    // 处理粗体 **text**
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // 处理斜体 *text*（避免与粗体冲突）
    processed = processed.replace(/(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)/g, '<em>$1</em>')

    // 处理行内代码 `code`
    processed = processed.replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>')

    // 处理链接 [text](url)
    processed = processed.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" target="_blank">$1</a>')

    return processed
}

// 渲染表格
const renderTable = (rows: string[]): string => {
    if (rows.length === 0) return ''

    let table = '<table class="markdown-table">\n'

    rows.forEach((row, index) => {
        const cells = row.split('|').map(cell => cell.trim()).filter((cell, i, arr) => {
            // 过滤掉首尾的空单元格（由于分割符在行首尾导致的）
            return !(i === 0 && cell === '') && !(i === arr.length - 1 && cell === '')
        })

        // 跳过分隔符行（如 |---|---|）
        if (cells.every(cell => cell.match(/^-+$/))) {
            return
        }

        const isHeader = index === 0
        const tag = isHeader ? 'th' : 'td'

        if (isHeader) {
            table += '<thead>\n'
        } else if (index === 1) {
            table += '<tbody>\n'
        }

        table += '<tr>\n'
        cells.forEach(cell => {
            const processedCell = processInlineMarkdown(cell)
            table += `<${tag}>${processedCell}</${tag}>\n`
        })
        table += '</tr>\n'

        if (isHeader) {
            table += '</thead>\n'
        }
    })

    if (rows.length > 1) {
        table += '</tbody>\n'
    }
    table += '</table>\n'

    return table
}

// 处理点赞
const handleLike = () => {
    likeCount.value++
    ElMessage.success('点赞成功')
}

// 处理催更
const handleUpdate = () => {
    ElMessage.success('催更请求已提交')
}

// 处理反馈
const handleFeedback = () => {
    ElMessage.success('反馈功能待实现')
}

// 监听内容变化，重新设置锚点
onMounted(async () => {
    await nextTick()
    setupHeadingEvents()
    renderMermaidDiagrams()
})

// 监听渲染内容变化
watch(renderedContent, async () => {
    await nextTick()
    // 延迟一点确保DOM完全更新
    setTimeout(() => {
        setupHeadingEvents()
        renderMermaidDiagrams()
    }, 200)
}, { flush: 'post' })

// 设置标题点击事件
const setupHeadingEvents = () => {
    const headings = document.querySelectorAll('.markdown-heading')

    headings.forEach((heading) => {
        heading.addEventListener('click', () => {
            const id = heading.getAttribute('id')
            if (id) {
                heading.scrollIntoView({ behavior: 'smooth' })
                // 更新URL hash（可选）
                window.history.replaceState(null, '', `#${id}`)
            }
        })
    })
}

// 渲染Mermaid图表
const renderMermaidDiagrams = () => {
    // 检查是否已加载mermaid库
    if (typeof window !== 'undefined' && (window as any).mermaid) {
        const mermaidContainers = document.querySelectorAll('.mermaid-container')

        mermaidContainers.forEach((container, index) => {
            const mermaidCode = container.textContent?.trim()
            if (mermaidCode) {
                // 清空容器内容
                container.innerHTML = ''

                // 创建mermaid元素
                const mermaidDiv = document.createElement('div')
                mermaidDiv.className = 'mermaid'
                mermaidDiv.textContent = mermaidCode
                container.appendChild(mermaidDiv)

                // 渲染mermaid图表
                try {
                    (window as any).mermaid.init(undefined, mermaidDiv)
                } catch (error) {
                    console.error('Mermaid渲染失败:', error)
                    // 渲染失败时显示原始代码
                    container.innerHTML = `<pre><code class="language-mermaid">${mermaidCode}</code></pre>`
                }
            }
        })
    } else {
        // 如果没有mermaid库，动态加载
        loadMermaid().then(() => {
            renderMermaidDiagrams()
        })
    }
}

// 动态加载Mermaid库
const loadMermaid = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if ((window as any).mermaid) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js'
        script.onload = () => {
            // 初始化mermaid
            if ((window as any).mermaid) {
                (window as any).mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose'
                })
                resolve()
            } else {
                reject(new Error('Mermaid加载失败'))
            }
        }
        script.onerror = () => reject(new Error('Mermaid脚本加载失败'))
        document.head.appendChild(script)
    })
}
</script>

<style lang="css" scoped>
.answer-content {
    padding: 25px;
    flex: 1;
    min-height: 200px;
}

.hidden-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #ccc;
}

.hidden-message {
    text-align: center;
}

.hidden-message p {
    margin-top: 10px;
    font-size: 14px;
}

.content-wrapper {
    line-height: 1.6;
    color: #333;
}

/* Markdown样式 */
.content-wrapper :deep(h1),
.content-wrapper :deep(h2),
.content-wrapper :deep(h3),
.content-wrapper :deep(h4),
.content-wrapper :deep(h5),
.content-wrapper :deep(h6) {
    margin: 20px 0 10px 0;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.3s;
}

.content-wrapper :deep(h1) {
    font-size: 24px;
}

.content-wrapper :deep(h2) {
    font-size: 20px;
    color: #1890ff;
}

.content-wrapper :deep(h3) {
    font-size: 18px;
}

.content-wrapper :deep(h4) {
    font-size: 16px;
}

.content-wrapper :deep(h1):hover,
.content-wrapper :deep(h2):hover,
.content-wrapper :deep(h3):hover,
.content-wrapper :deep(h4):hover,
.content-wrapper :deep(h5):hover,
.content-wrapper :deep(h6):hover {
    color: #1890ff;
}

.content-wrapper :deep(p) {
    margin: 10px 0;
    line-height: 1.8;
}

.content-wrapper :deep(code) {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
}

.content-wrapper :deep(pre) {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 15px 0;
    border-left: 4px solid #1890ff;
}

.content-wrapper :deep(pre code) {
    background: none;
    padding: 0;
}

.content-wrapper :deep(strong) {
    font-weight: 600;
    color: #262626;
}

.content-wrapper :deep(em) {
    font-style: italic;
    color: #595959;
}

.content-wrapper :deep(a) {
    color: #1890ff;
    text-decoration: none;
}

.content-wrapper :deep(a):hover {
    text-decoration: underline;
}

.content-wrapper :deep(ul),
.content-wrapper :deep(ol) {
    margin: 15px 0;
    padding-left: 20px;
}

.content-wrapper :deep(li) {
    margin: 8px 0;
    line-height: 1.6;
}

.content-wrapper :deep(hr) {
    border: none;
    border-top: 2px solid #e8e8e8;
    margin: 25px 0;
}

/* 表格样式 */
.content-wrapper :deep(.markdown-table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.content-wrapper :deep(.markdown-table th),
.content-wrapper :deep(.markdown-table td) {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e8e8e8;
    vertical-align: top;
}

.content-wrapper :deep(.markdown-table th) {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #1890ff;
}

.content-wrapper :deep(.markdown-table tr:hover) {
    background-color: #f5f5f5;
}

/* Mermaid图表样式 */
.content-wrapper :deep(.mermaid-container) {
    margin: 20px 0;
    padding: 20px;
    background-color: #fafafa;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
    text-align: center;
    overflow-x: auto;
}

.content-wrapper :deep(.mermaid) {
    max-width: 100%;
    margin: 0 auto;
}

/* 如果mermaid渲染失败，显示为代码块 */
.content-wrapper :deep(.mermaid-container pre) {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    text-align: left;
    margin: 0;
}

.content-wrapper :deep(.mermaid-container code) {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #333;
}

.content-wrapper :deep(.markdown-table tr:last-child td) {
    border-bottom: none;
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
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.3s;
}

.options .option-item:hover {
    color: #1677ff;
}
</style>