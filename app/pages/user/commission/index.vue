<template>
  <div class="d-flex flex-column w-100">
    <common-gombo-box
      v-model="filters.period"
      label="Period"
      :items="periodOptions"
      rounded="pill"
      height="48"
      base-color="grey200"
      color="primary"
      density="compact"
      class="w-100 w-sm-33"
      :defalut-lable="false"
      :has-search="false"
      @update:model-value="filterChange"
    />
    <div class="w-100 w-sm-33 bg-grey100 rounded-lg pa-3 d-flex flex-column ga-2 mt-4">
      <div class="w-100 d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-bold text-grey700">Commission balance</span>
        <v-chip
          color="success"
          variant="tonal"
          size="small"
          class="font-weight-bold text-h6"
        >
          {{ $numberFormat(statistics.totalPoints) }} pts
        </v-chip>
      </div>

      <div
        v-if="loadingGetStatistics"
        class="d-flex align-center"
      >
        <v-skeleton-loader
          width="160"
          height="28"
          class="rounded-lg"
        />
      </div>
      <div
        v-else
        class="d-flex align-end"
      >
        <span class="text-h5 font-weight-bold text-success mr-1">$</span>
        <span class="text-h4 font-weight-bold text-success">{{ $numberFormat(statistics.totalAmountUsd) }}</span>
      </div>
    </div>

    <div class="w-100 d-flex flex-column flex-md-row ga-2 mt-4">
      <div class="container-chart w-100 bg-grey100 rounded-lg pa-2 d-flex flex-column flex-sm-row flex-md-column align-center justify-space-between ga-2">
        <user-activity-history-balance-card />
        <user-commission-chart
          v-if="!xs || isShowChart"
          :items="statistics.statistics"
          :loading="loadingGetStatistics"
          metric="amountUsd"
          title="Commission Amount"
          label="Amount USD"
          color="success"
        />
      </div>
      <div class="container-table">
        <user-commission-history @show-chart="changeStatusChart" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommissionStatisticsPeriod } from '@/types'
import { useDisplay } from 'vuetify'

definePageMeta({
  layout: 'dashboard-layout',
  middleware: ['auth', 'user-type'],
})

useHead({
  title: 'Commission',
  meta: [
    { name: 'description', content: 'View your commission income and history' },
  ],
})

const { xs } = useDisplay()
const { $numberFormat } = useNuxtApp()
const {
  statistics,
  getStatistics,
  loadingGetStatistics,
} = useCommission()
const isShowChart = ref(false)

const periodOptions = [
  { id: 'DayOfWeek', title: 'Week' },
  { id: 'MonthOfYear', title: 'Month' },
]

const filters = reactive<{
  period: CommissionStatisticsPeriod
  startDate: string
  endDate: string
}>({
  period: 'MonthOfYear',
  startDate: '',
  endDate: '',
})

const fetchStatistics = async () => {
  await getStatistics(filters)
}

const filterChange = async (period: CommissionStatisticsPeriod) => {
  filters.period = period
  await fetchStatistics()
}

const changeStatusChart = () => {
  isShowChart.value = !isShowChart.value
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.container-table{
  width : calc(100% - 300px)
}
.container-chart{
  max-width: 370px;
  min-width: 300px;
  height : fit-content
}

@media screen and (max-width: 960px) {
  .container-chart{
    max-width: 100%;
  }
  .container-table{
    width : 100%
  }
}
</style>
