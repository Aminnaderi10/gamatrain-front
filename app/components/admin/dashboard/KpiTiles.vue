<template>
  <div class="kpi-grid w-100">
    <template v-if="loading && !overview">
      <v-skeleton-loader
        v-for="i in 4"
        :key="i"
        height="118"
        class="rounded-xl"
      />
    </template>
    <div
      v-for="tile in tiles"
      v-else
      :key="tile.title"
      class="kpi-tile bg-white rounded-xl pa-4 d-flex flex-column ga-2"
    >
      <div class="d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-medium text-grey500">{{ tile.title }}</span>
        <div :class="['kpi-icon d-flex align-center justify-center', `kpi-icon--${tile.color}`]">
          <v-icon
            :color="tile.color"
            size="18"
          >
            {{ tile.icon }}
          </v-icon>
        </div>
      </div>
      <span class="kpi-value font-weight-bold text-grey800">{{ tile.value }}</span>
      <span class="text-subtitle-1 text-grey500">{{ tile.hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminDashboardOverviewDTO } from '@/types'

const props = defineProps<{
  overview: AdminDashboardOverviewDTO | null
  loading: boolean
}>()

const number = (value: number) => value.toLocaleString('en-US')
const usd = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const tiles = computed(() => {
  const o = props.overview
  if (!o) return []
  return [
    { title: 'Revenue', value: usd(o.revenueUsd), hint: `${number(o.revenue.reduce((sum, t) => sum + t.count, 0))} paid payments`, icon: 'md:payments', color: 'success' },
    { title: 'New subscriptions', value: number(o.newSubscriptions), hint: `${number(o.expiredSubscriptions)} expired this period`, icon: 'md:workspace_premium', color: 'primary' },
    { title: 'Active subscriptions', value: number(o.activeSubscriptions), hint: o.cancellingSubscriptions ? `${number(o.cancellingSubscriptions)} set to cancel` : 'none set to cancel', icon: 'md:verified', color: 'info' },
    { title: 'Sign-ups', value: number(o.signUps), hint: `${number(o.teacherSignUps)} teachers · ${number(o.studentSignUps)} students`, icon: 'md:person_add', color: 'blue500' },
  ]
})
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-tile {
  border: 1px solid rgb(var(--v-theme-borderSubtle));
}

.kpi-value {
  font-size: 28px;
  line-height: 1.1;
}

.kpi-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.kpi-icon--success {
  background: rgba(76, 175, 80, 0.12);
}

.kpi-icon--primary {
  background: rgba(255, 179, 0, 0.16);
}

.kpi-icon--info {
  background: rgba(33, 150, 243, 0.1);
}

.kpi-icon--blue500 {
  background: rgba(46, 144, 250, 0.1);
}
@media screen and (max-width: 600px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .kpi-value {
    font-size: 22px;
  }
}
</style>
