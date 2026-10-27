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
            class="w-100 pa-3 d-flex flex-column flex-sm-row ga-2 flex-grow-1 border-sm border-primary border-opacity-50"
            color="primary50"
            flat
            rounded="lg"
            min-width="150"
          >
            <img
              :src="gamaRobot"
              alt="Gama Robot"
              width="80"
              class="h-100 image-robot"
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
                :loading="loadingGetAnalyzeResultExam"
                @click="handleResultAnalyze"
              >
                <template #loader>
                  <v-progress-circular
                    color="grey700"
                    size="20"
                    width="3"
                    indeterminate
                  />
                </template>

                <span class="text-grey700 text-h6 font-weight-bold mt-1 mx-2">Get my analysis</span>

                <common-price-with-gem
                  v-if="resultAnalyze?.result == null"
                  class="text-grey700 text-h6 font-weight-bold mt-1"
                  :price="resultAnalyze?.points"
                  color="grey700"
                />
                <span
                  v-else
                  class="text-grey700 text-h6 font-weight-bold mt-1"
                >(Owned)</span>
              </v-btn>
              <span class="text-grey500 text-subtitle-1 font-weight-medium d-flex align-center ga-1">
                <v-icon>md:lock</v-icon>
                Available with membership</span>
            </div>
          </v-card>
        </div>
      </v-card>
    </div>

    <!-- Coin Payment Modal -->
    <lazy-common-modal-base
      v-model:show-dialog="showCoinPaymentModal"
      :max-width="900"
      title="Get Membership. Unlock Premium Downloads."
      subtitle="Join +50,000 Students"
    >
      <common-modal-payment
        :plans="paymentPlans"
        :billing-interval="billingInterval"
        :current-plan-id="currentPlanId"
        :current-plan-title="currentPlanTitle"
        @dismiss="showCoinPaymentModal = false"
        @switch-successfully="upgradePlanSuccessfully"
      />
    </lazy-common-modal-base>

    <!-- Coin Consumption Animation -->
    <lazy-common-coin-consumption-animation
      v-model:is-visible="showCoinAnimation"
      @animation-complete="handleAnimationComplete"
    />

    <lazy-test-counting-wallet-animation
      :is-start-animation="isStartWalletAnimation"
      :direction="-1"
      :delta-price="priceFile"
      @complete-animation="completeWalletAnimation"
    />

    <lazy-common-modal-base
      v-model:show-dialog="showAnalyzeModal"
      :max-width="600"
      title="Analyze Result"
    >
      <span class="text-grey700 text-h6 font-weight-medium mt-4">{{ resultTextAnalyze }}</span>
    </lazy-common-modal-base>
  </v-card>
</template>

<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'
import type { ExamResultAnswerStatsDTO, ExamResultRankDTO, ExamResultAnalyzeResponseDTO, UpgradeSuggestionsDTO,
  BillingInterval } from '@/types'
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js'
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import { useTheme } from 'vuetify'
import gamaRobot from '@/assets/images/gama-robot.png'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
)

const theme = useTheme()

const props = defineProps<{
  answerStats?: ExamResultAnswerStatsDTO
  rank?: ExamResultRankDTO
  resultAnalyze?: ExamResultAnalyzeResponseDTO
}>()
const emit = defineEmits(['updateResultAnalyze'])

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

const { getAnalyzeResultExam, loadingGetAnalyzeResultExam } = useExamResult()
const route = useRoute()

const showCoinPaymentModal = ref(false)
const showCoinAnimation = ref(false)
const isStartWalletAnimation = ref(false)
const priceFile = ref(props.resultAnalyze?.points ?? 0)
const paymentPlans = ref<UpgradeSuggestionsDTO[]>([])
const billingInterval = ref<BillingInterval[]>([])
const currentPlanTitle = ref<string | null>(null)
const currentPlanId = ref<number | null>(null)
const showAnalyzeModal = ref(false)
const resultTextAnalyze = ref(props.resultAnalyze?.result ?? '')

const handleAnimationComplete = async () => {
  // Close everything immediately when animation completes
  showCoinAnimation.value = false
  isStartWalletAnimation.value = true
}

const completeWalletAnimation = () => {
  showAnalyzeModal.value = true
  isStartWalletAnimation.value = false
}
const upgradePlanSuccessfully = async () => {
  showCoinPaymentModal.value = false
  await handleResultAnalyze()
}

const handleResultAnalyze = async () => {
  if (props.resultAnalyze?.result) {
    resultTextAnalyze.value = props.resultAnalyze?.result
    showAnalyzeModal.value = true
  }
  else {
    const response = await getAnalyzeResultExam(route.params.id as string)
    if (response.succeeded && response.data) {
      if (response.data.result) {
        resultTextAnalyze.value = response.data.result
        showCoinAnimation.value = true
        emit('updateResultAnalyze', response.data.result)
      }
      else {
        paymentPlans.value = response.data.upgradeSuggestions || []
        billingInterval.value = response.data.availableBillingIntervals || []
        currentPlanTitle.value = response.data.currentPlanTitle
        currentPlanId.value = response.data.currentPlanId
        showCoinPaymentModal.value = true
      }
    }
    else {
      paymentPlans.value = response.data?.upgradeSuggestions || []
      billingInterval.value = response.data?.availableBillingIntervals || []
      currentPlanTitle.value = response.data!.currentPlanTitle
      currentPlanId.value = response.data!.currentPlanId
      showCoinPaymentModal.value = true
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 160px;
  height: 160px;
}
.image-robot{
  object-fit : contain
}
</style>
