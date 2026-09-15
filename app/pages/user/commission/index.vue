<template>
  <div class="w-100 d-flex flex-column ga-2 px-2 pa-md-0">
    <div class="w-100 d-flex align-center justify-space-between ga-2 mt-4">
      <h1 class="text-h4 text-grey700 font-weight-regular">
        Commission
      </h1>
    </div>

    <div class="w-100 d-flex ga-1 flex-wrap align-end mt-4">
      <div class="filter-item">
        <common-gombo-box
          v-model="filters.period"
          label="Period"
          :items="periodOptions"
          rounded="pill"
          height="48"
          base-color="grey200"
          color="primary"
          density="compact"
          :defalut-lable="false"
          :has-search="false"
          @update:model-value="filterChange"
        />
      </div>

      <div class="filter-item">
        <v-menu
          v-model="startDateMenuOpen"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
        >
          <template #activator="{ props: menuProps }">
            <v-text-field
              v-model="filters.startDate"
              readonly
              rounded="pill"
              variant="outlined"
              base-color="grey200"
              color="primary"
              density="compact"
              height="48"
              hide-details
              v-bind="menuProps"
              label="Start Date"
              clearable
              @click:clear="clearStartDate"
            />
          </template>
          <v-date-picker
            v-model="filters.startDate"
            color="primary"
            @update:model-value="dateFilterChange('start')"
          />
        </v-menu>
      </div>

      <div class="filter-item">
        <v-menu
          v-model="endDateMenuOpen"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
        >
          <template #activator="{ props: menuProps }">
            <v-text-field
              v-model="filters.endDate"
              readonly
              rounded="pill"
              variant="outlined"
              base-color="grey200"
              color="primary"
              density="compact"
              height="48"
              hide-details
              v-bind="menuProps"
              label="End Date"
              clearable
              @click:clear="clearEndDate"
            />
          </template>
          <v-date-picker
            v-model="filters.endDate"
            color="primary"
            @update:model-value="dateFilterChange('end')"
          />
        </v-menu>
      </div>
    </div>

    <div
      v-if="!xs || isShowChart"
      class="w-100 d-flex flex-column ga-2 mt-2"
    >
      <div class="commission-balance-div w-100 bg-grey100 rounded-lg pa-3 d-flex flex-column ga-2">
        <div class="w-100 d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold text-grey700">Commission balance</span>
          <v-chip
            color="success"
            variant="tonal"
            size="small"
            class="font-weight-bold"
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
          <span class="text-h4 font-weight-bold text-grey900">{{ $numberFormat(statistics.totalAmountUsd) }}</span>
        </div>
      </div>

      <div class="w-100 d-flex flex-column flex-md-row ga-2">
        <div class="commission-chart-div w-100 bg-grey100 rounded-lg pa-2 d-flex align-start justify-start">
          <user-commission-chart
            :items="statistics.statistics"
            :loading="loadingGetStatistics"
            metric="amountUsd"
            title="Commission Amount"
            label="Amount USD"
            color="success"
          />
        </div>

        <div class="commission-chart-div w-100 bg-grey100 rounded-lg pa-2 d-flex align-start justify-start">
          <user-commission-chart
            :items="statistics.statistics"
            :loading="loadingGetStatistics"
            metric="points"
            title="Commission Points"
            label="Points"
            color="primary"
          />
        </div>
      </div>
    </div>
    <div class="w-100 mt-4">
      <user-commission-history @show-chart="changeStatusChart" />
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
const startDateMenuOpen = ref(false)
const endDateMenuOpen = ref(false)

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

const dateFilterChange = async (type: 'start' | 'end') => {
  if (type === 'start') {
    startDateMenuOpen.value = false
  }
  else {
    endDateMenuOpen.value = false
  }

  await fetchStatistics()
}

const clearStartDate = async () => {
  filters.startDate = ''
  await fetchStatistics()
}

const clearEndDate = async () => {
  filters.endDate = ''
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
.commission-chart-div {
  min-width: 300px;
  height: fit-content;
  min-height: 280px;
}
.commission-balance-div {
  max-width: 732px;
}
.filter-item{
  width: 30%;
  max-width : 200px;
}

@media screen and (max-width: 960px) {
  .commission-chart-div {
    max-width: 100%;
  }
  .commission-balance-div {
    max-width: 100%;
  }
}

@media screen and (max-width: 600px) {
  .filter-item{
    width: 100%;
     max-width : 100%
  }
}
</style>
