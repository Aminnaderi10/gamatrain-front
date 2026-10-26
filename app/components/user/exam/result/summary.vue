<template>
  <v-card
    v-if="answerStats"
    class="w-100 mt-4 pa-4"
    flat
    rounded="lg"
    border
  >
    <div class="w-100 d-flex align-center justify-space-between ga-2 flex-wrap">
      <div class="d-flex align-center ga-2">
        <v-icon
          color="primary"
          size="24"
        >
          md:donut_large
        </v-icon>
        <span class="text-h5 text-grey700 font-weight-bold">Result Summary</span>
      </div>
    </div>

    <div class="w-100 d-flex flex-wrap flex-md-nowrap ga-3 mt-4">
      <v-card
        class="w-100 w-md-50 pa-4 d-flex flex-column flex-sm-row align-center justify-center ga-6"
        color="grey100"
        flat
        rounded="lg"
        border
        min-width="240"
      >
        <div class="chart-container position-relative d-flex align-center justify-center">
          <DoughnutChart
            :data="chartData"
            :options="chartOptions"
          />
          <div class="position-absolute d-flex flex-column align-center justify-center">
            <span class="text-grey800 text-h3 font-weight-bold">{{ totalStats.percent }}%</span>
            <span class="text-grey500 text-h6">Score</span>
          </div>
        </div>

        <div class="w-100 d-flex flex-column ga-2">
          <div
            v-for="(item, index) in statItems"
            :key="item.label"
            class="w-100 d-flex flex-wrap align-center ga-2"
          >
            <v-icon
              :color="item.color"
              size="14"
            >
              md:circle
            </v-icon>
            <span class="text-grey600 text-h6 ml-2">{{ item.label }}</span>
            <span class="text-grey800 text-h6 font-weight-bold ml-auto">
              {{ item.value }}
            </span>

            <v-divider
              v-if="index != statItems.length - 1"
              color="grey500"
            />
          </div>
        </div>
      </v-card>

      <v-card
        class="w-100 w-md-50 pa-4 d-flex flex-column ga-4"
        color="grey100"
        flat
        rounded="lg"
        border
        min-width="240"
      >
        <div class="w-100 d-flex flex-wrap ga-2">
          <v-card
            v-for="rankItem in rankItems"
            :key="rankItem.label"
            class="pa-2 d-flex flex-column ga-1 flex-grow-1"
            color="white"
            flat
            rounded="lg"
            border
            min-width="150"
          >
            <span class="text-grey400 text-h6 font-weight-medium">
              <v-icon class="mr-1">{{ rankItem.icon }}</v-icon>
              {{ rankItem.label }}
            </span>
            <span class="text-grey800 text-h5 font-weight-bold pl-6">
              {{ rankItem.value }}
            </span>
          </v-card>

          <v-card
            class="w-100 pa-3 d-flex ga-1 flex-grow-1 border-sm border-primary border-opacity-50"
            color="primary50"
            flat
            rounded="lg"
            min-width="150"
          >
            <div class="d-flex flex-column align-start justify-start ga-1">
              <span class="text-grey800 text-h5 font-weight-bold">Get your personal exam analysis</span>
              <span class="text-grey600 text-h6 font-weight-medium">Let alpha analyze your answers and reveal your strength and areas to improve.</span>
              <v-btn
                rounded="pill"
                class="d-flex align-center justify-center mt-2"
                color="primary"
                flat
                height="30"
              >
                <template #loader>
                  <v-progress-circular
                    color="grey700"
                    size="24"
                    width="3"
                  />
                </template>

                <span class="text-grey700 text-h6 font-weight-bold mt-1 mx-2">Get my analysis</span>

                <common-price-with-gem
                  class="text-grey700 text-h6 font-weight-bold mt-1"
                  :price="100"
                  color="grey700"
                />
              </v-btn>
              <span class="text-grey500 text-subtitle-1 font-weight-medium d-flex align-center ga-1">
                <v-icon>md:lock</v-icon>
                Available with membership</span>
            </div>
          </v-card>
        </div>
      </v-card>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import type { ExamResultAnswerStatsDTO, ExamResultRankDTO } from '@/types'
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js'
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import { useTheme } from 'vuetify'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
)

const theme = useTheme()

const props = defineProps<{
  answerStats?: ExamResultAnswerStatsDTO
  rank?: ExamResultRankDTO
}>()

const totalStats = computed(() => {
  const total = props.answerStats?.total
  if (total) {
    return {
      ...total,
      noAnswer: getNoAnswerCount(total),
    }
  }

  return {
    num: 0,
    true: 0,
    false: 0,
    noAnswer: 0,
    percent: 0,
  }
})

const statItems = computed(() => [
  { label: 'Correct answers', value: totalStats.value.true, color: 'success' },
  { label: 'Wrong answers', value: totalStats.value.false, color: 'lightError' },
  { label: 'No answer', value: totalStats.value.noAnswer, color: 'grey300' },
  { label: 'Total questions', value: totalStats.value.num, color: 'grey600' },
])

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Correct answers', 'Wrong answers', 'No answer'],
  datasets: [
    {
      data: [
        totalStats.value.true,
        totalStats.value.false,
        totalStats.value.noAnswer,
      ],
      backgroundColor: [
        theme.current.value.colors.success,
        theme.current.value.colors.lightError,
        theme.current.value.colors.grey300,
      ],
      borderColor: theme.current.value.colors.grey100,
      borderWidth: 3,
      hoverOffset: 4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = Number(context.raw || 0)
          return `${context.label}: ${value}`
        },
      },
    },
  },
}))

const getNoAnswerCount = (lesson: { noanswer?: number, noAnswer?: number }) => {
  return lesson.noanswer ?? lesson.noAnswer ?? 0
}

const rankItems = computed(() => {
  return [
    { label: 'Country rank', value: formatRank(props.rank?.total), icon: 'md:trophy' },
    { label: 'State rank', value: formatRank(props.rank?.state), icon: 'md:leaderboard' },
    // { label: 'Area rank', value: formatRank(props.rank?.area) },
  ]
})

const formatRank = (rank?: { user: number, total: string }) => {
  if (!rank) return '-'
  return `${rank.user} of ${rank.total}`
}
</script>

<style scoped>
.chart-container {
  width: 160px;
  height: 160px;
}
</style>
