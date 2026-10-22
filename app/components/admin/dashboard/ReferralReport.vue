<template>
  <div class="w-100 d-flex flex-column ga-4">
    <v-skeleton-loader
      v-if="loading && !report"
      height="120"
      class="rounded-xl"
    />

    <template v-else-if="report">
      <div class="funnel panel bg-white rounded-xl pa-4 pa-md-5">
        <div
          v-for="(step, index) in funnel"
          :key="step.label"
          class="funnel-step d-flex align-center ga-3"
        >
          <div class="d-flex flex-column ga-1">
            <span class="text-subtitle-1 text-grey500">{{ step.label }}</span>
            <span class="funnel-value font-weight-bold text-grey800">{{ step.value }}</span>
            <span
              v-if="step.rate"
              class="text-subtitle-1 text-grey500"
            >{{ step.rate }}</span>
          </div>
          <v-icon
            v-if="index < funnel.length - 1"
            class="funnel-arrow d-none d-md-flex"
            color="grey300"
          >
            md:chevron_right
          </v-icon>
        </div>
      </div>

      <v-alert
        v-if="report.sharedNetworkSignUps"
        type="warning"
        variant="tonal"
        density="compact"
        class="text-h6"
      >
        {{ report.sharedNetworkSignUps }} invited sign-up{{ report.sharedNetworkSignUps === 1 ? '' : 's' }} in this period came from a network
        the inviting teacher also used. That can be a self-invite, or just a shared school or family network: check before acting.
      </v-alert>

      <v-row class="ma-0">
        <v-col
          cols="12"
          lg="6"
          class="pa-0 pr-lg-2 pb-4 pb-lg-0"
        >
          <div class="panel bg-white rounded-xl pa-4 pa-md-5 h-100 d-flex flex-column ga-3">
            <div class="d-flex flex-column">
              <span class="text-h5 font-weight-bold text-grey700">Top teachers</span>
              <span class="text-subtitle-1 text-grey500">All time, by earnings then sign-ups</span>
            </div>
            <div
              v-if="!report.topTeachers.length"
              class="empty text-h6 text-grey500"
            >
              No teacher has joined yet.
            </div>
            <div
              v-for="(teacher, index) in report.topTeachers"
              v-else
              :key="teacher.userId"
              class="row-item d-flex align-center ga-3"
            >
              <span class="rank text-h6 font-weight-bold">{{ index + 1 }}</span>
              <div class="d-flex flex-column flex-grow-1 min-w-0">
                <span class="text-h6 font-weight-bold text-grey800 text-truncate">{{ teacher.name || `User #${teacher.userId}` }}</span>
                <span class="text-subtitle-1 text-grey500">
                  {{ teacher.percent ?? '–' }}% · joined {{ formatLocal(teacher.joinedDate, 'D MMM YYYY') }}
                </span>
              </div>
              <div class="d-flex flex-column align-end flex-shrink-0">
                <span class="text-h6 font-weight-bold text-success">{{ usd(teacher.earnedUsd) }}</span>
                <span class="text-subtitle-1 text-grey500">{{ teacher.invited }} signed up · {{ teacher.paying }} paying</span>
              </div>
            </div>
          </div>
        </v-col>

        <v-col
          cols="12"
          lg="6"
          class="pa-0 pl-lg-2"
        >
          <div class="panel bg-white rounded-xl pa-4 pa-md-5 h-100 d-flex flex-column ga-3">
            <div class="d-flex flex-column">
              <span class="text-h5 font-weight-bold text-grey700">Recent invited sign-ups</span>
              <span class="text-subtitle-1 text-grey500">In this period, newest first</span>
            </div>
            <div
              v-if="!report.recentSignUps.length"
              class="empty text-h6 text-grey500"
            >
              No one signed up through an invite link in this period.
            </div>
            <div
              v-for="item in report.recentSignUps"
              v-else
              :key="item.userId"
              class="row-item d-flex align-center ga-3"
            >
              <div class="d-flex flex-column flex-grow-1 min-w-0">
                <div class="d-flex align-center ga-2 min-w-0">
                  <span class="text-h6 font-weight-bold text-grey800 text-truncate">{{ item.name || `User #${item.userId}` }}</span>
                  <v-chip
                    v-if="item.sharedNetwork"
                    size="x-small"
                    color="warning"
                    variant="flat"
                    class="font-weight-bold flex-shrink-0"
                  >
                    Same network
                  </v-chip>
                </div>
                <span class="text-subtitle-1 text-grey500 text-truncate">
                  invited by {{ item.inviterName || `User #${item.inviterUserId}` }} · {{ formatLocal(item.signedUpDate, 'D MMM, HH:mm') }}
                </span>
              </div>
              <div class="d-flex flex-column align-end flex-shrink-0">
                <span :class="['text-h6 font-weight-bold', item.payments ? 'text-success' : 'text-grey400']">
                  {{ item.payments ? usd(item.earnedUsd) : 'Not paid yet' }}
                </span>
                <span
                  v-if="item.payments"
                  class="text-subtitle-1 text-grey500"
                >{{ item.payments }} {{ item.payments === 1 ? 'payment' : 'payments' }}</span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AdminReferralReportDTO } from '@/types'

const props = defineProps<{
  report: AdminReferralReportDTO | null
  loading: boolean
}>()

const { formatLocal } = useDateTime()

const usd = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const rate = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}% of previous` : '')

const funnel = computed(() => {
  const r = props.report
  if (!r) return []
  return [
    { label: 'Offers emailed', value: r.offersEmailed.toLocaleString('en-US'), rate: '' },
    { label: 'Teachers joined', value: r.teachersJoined.toLocaleString('en-US'), rate: rate(r.teachersJoined, r.offersEmailed) },
    { label: 'Invited sign-ups', value: r.invitedSignUps.toLocaleString('en-US'), rate: '' },
    { label: 'Paying invitees', value: r.payingInvitees.toLocaleString('en-US'), rate: rate(r.payingInvitees, r.invitedSignUps) },
    { label: 'Teachers earned', value: usd(r.earnedUsd), rate: '' },
  ]
})
</script>

<style scoped>
.panel {
  border: 1px solid rgb(var(--v-theme-borderSubtle));
}

.funnel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.funnel-step {
  justify-content: space-between;
}

.funnel-value {
  font-size: 24px;
  line-height: 1.1;
}

.row-item {
  padding: 10px 0;
  border-bottom: 1px solid rgb(var(--v-theme-grey100));
}

.row-item:last-child {
  border-bottom: 0;
}

.rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 179, 0, 0.16);
  color: #b54708;
  flex-shrink: 0;
}

.empty {
  padding: 24px 0;
  text-align: center;
}

.min-w-0 {
  min-width: 0;
}
</style>
