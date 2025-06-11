<template>
    <div id="main" style="width: 200px; height: 200px;z-index: 10000;"></div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
    value?: number
}>()

const chart = ref<echarts.ECharts | null>(null)
const chartDom = ref<HTMLElement | null>(null)

const renderChart = () => {
    if (!chartDom.value) return
    if (!chart.value) {
        chart.value = echarts.init(chartDom.value)
    }
    const option: echarts.EChartsOption = {
        series: [
            {
                type: 'gauge',
                center: ['50%', '50%'],
                startAngle: 210,
                endAngle: -30,
                min: 0,
                max: 100,
                splitNumber: 0,
                itemStyle: {
                    color: '#4FC3F7'
                },
                progress: {
                    show: true,
                    width: 10,
                    roundCap: true,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 0,
                            colorStops: [
                                { offset: 0, color: '#B3E5FC' },
                                { offset: 1, color: '#0288D1' }
                            ]
                        }
                    }
                },
                pointer: { show: false },
                axisLine: {
                    lineStyle: {
                        width: 20,
                        color: [[1, '#E1F5FE']]
                    }
                },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                anchor: { show: false },
                title: { show: false },
                detail: {
                    valueAnimation: true,
                    width: '100%',
                    lineHeight: 0,
                    borderRadius: 0,
                    offsetCenter: [0, 0],
                    fontSize: 24,
                    fontWeight: 'bold',
                    formatter: '{value}分',
                    color: '#0288D1'
                },
                data: [
                    {
                        value: props.value ?? 80
                    }
                ]
            }
        ]
    }
    chart.value.setOption(option)
}

onMounted(() => {
    chartDom.value = document.getElementById('main')
    renderChart()
    window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
    if (chart.value) {
        chart.value.dispose()
        chart.value = null
    }
    window.removeEventListener('resize', resizeChart)
})

function resizeChart() {
    chart.value?.resize()
}

watch(() => props.value, renderChart)
</script>
