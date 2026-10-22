<template>
  <div class="panel bg-white rounded-xl pa-4 pa-md-5 d-flex flex-column ga-3 h-100">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2">
      <span class="text-h5 font-weight-bold text-grey700">Daily trends</span>
      <v-btn-toggle
        v-model="metric"
        mandatory
        density="compact"
        rounded="pill"
        variant="outlined"
        color="primary"
      >
        <v-btn
          value="activity"
          size="small"
          class="text-h6"
        >
          Activity
        </v-btn>
        <v-btn
          value="revenue"
          size="small"
          class="text-h6"
        >
          Revenue
        </v-btn>
      </v-btn-toggle>
    </div>

    <v-skeleton-loader
      v-if="loading && !daily.length"
      height="280"
      class="rounded-lg"
    />
    <div
      v-else
      class="chart-box"
    >
      <LineChart
        :data="chartData"
        :options="chartOptions"
      />
    </div>
    <span class="text-subtitle-1 text-grey400">Days are UTC.</span>
  </div>
</template>

<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import dayjs from 'dayjs'
import { Line as LineChart } from 'vue-chartjs'
import type { AdminDashboardOverviewDTO } from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps<{
  daily: AdminDashboardOverviewDTO['daily']
  loading: boolean
}>()

const metric = ref<'activity' | 'revenue'>('activity')

const series = (label: string, color: string, data: number[], fill = false) => ({
  label,
  data,
  borderColor: color,
  backgroundColor: fill ? `${color}22` : color,
  fill,
  tension: 0.35,
  pointRadius: 0,
  pointHoverRadius: 4,
  borderWidth: 2,
})

const chartData = computed(() => ({
  labels: props.daily.map(t => dayjs(t.date).format('D MMM')),
  datasets: metric.value === 'revenue'
    ? [series('Revenue (USD)', '#12B76A', props.daily.map(t => t.revenueUsd), true)]
    : [
        series('Sign-ups', '#2E90FA', props.daily.map(t => t.signUps), true),
        series('Paid payments', '#12B76A', props.daily.map(t => t.paidPayments)),
        series('Invited sign-ups', '#FFB300', props.daily.map(t => t.invitedSignUps)),
        series('Teachers joined invite program', '#7B61FF', props.daily.map(t => t.inviteJoins)),
      ],
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
    tooltip: {
      callbacks: metric.value === 'revenue'
        ? { label: ctx => ` $${Number(ctx.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
        : {},
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
    y: {
      beginAtZero: true,
      grid: { color: '#EEF1F5' },
      ticks: {
        precision: metric.value === 'revenue' ? undefined : 0,
        callback: value => (metric.value === 'revenue' ? `$${value}` : value),
      },
    },
  },
}))
</script>

<style scoped>
.panel {
  border: 1px solid rgb(var(--v-theme-borderSubtle));
}

.chart-box {
  height: 280px;
}
</style>
