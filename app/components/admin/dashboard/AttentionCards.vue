<template>
  <div class="w-100 d-flex flex-column ga-3">
    <div
      v-if="loading && !items.length"
      class="attention-grid"
    >
      <v-skeleton-loader
        v-for="i in 4"
        :key="i"
        height="132"
        class="rounded-xl"
      />
    </div>

    <template v-else>
      <div
        v-if="waiting.length"
        class="attention-grid"
      >
        <nuxt-link
          v-for="item in waiting"
          :key="item.key"
          :to="item.link"
          :class="['attention-card', `attention-card--${item.tone}`, 'bg-white rounded-xl pa-4 d-flex flex-column ga-3 text-decoration-none']"
        >
          <div class="d-flex align-center justify-space-between ga-2">
            <div class="d-flex align-center ga-3 min-w-0">
              <div :class="['attention-icon', `bg-${item.toneColor}-lighten`, 'd-flex align-center justify-center flex-shrink-0']">
                <v-icon
                  :color="item.toneColor"
                  size="20"
                >
                  {{ item.icon }}
                </v-icon>
              </div>
              <span class="text-h6 font-weight-medium text-grey600 text-truncate">{{ item.label }}</span>
            </div>
            <v-icon
              size="18"
              color="grey400"
            >
              md:arrow_forward
            </v-icon>
          </div>

          <span class="attention-count font-weight-bold text-grey800">{{ item.count.toLocaleString('en-US') }}</span>

          <div class="d-flex flex-wrap align-center ga-2">
            <span
              v-if="item.newLast7Days"
              class="attention-pill attention-pill--new"
            >+{{ item.newLast7Days }} this week</span>
            <span
              v-if="item.oldestDate"
              :class="['attention-pill', item.overdue ? 'attention-pill--overdue' : 'attention-pill--neutral']"
            >oldest {{ fromNowLocal(item.oldestDate) }}</span>
          </div>
        </nuxt-link>
      </div>

      <div
        v-if="clear.length"
        class="d-flex flex-wrap align-center ga-2"
      >
        <span class="text-h6 text-grey500 mr-1">
          <v-icon
            color="success"
            size="18"
            class="mr-1"
          >md:check_circle</v-icon>
          {{ waiting.length ? 'All clear:' : 'All caught up, nothing is waiting.' }}
        </span>
        <template v-if="waiting.length">
          <nuxt-link
            v-for="item in clear"
            :key="item.key"
            :to="item.link"
            class="clear-chip text-h6 text-grey600 text-decoration-none"
          >
            {{ item.label }}
          </nuxt-link>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { AttentionItemDTO } from '@/types'
import { ATTENTION_OVERDUE_DAYS, ATTENTION_QUEUES } from '~/constants'

const props = defineProps<{
  items: AttentionItemDTO[]
  loading: boolean
}>()

const { local, fromNowLocal } = useDateTime()

const decorated = computed(() => props.items.map((item) => {
  const meta = ATTENTION_QUEUES[item.key]
  const overdue = !!item.oldestDate && (local(item.oldestDate)?.isBefore(dayjs().subtract(ATTENTION_OVERDUE_DAYS, 'day')) ?? false)
  // Fresh items are the ones to act on today; an old backlog with nothing new is a warning, not an alarm.
  const tone = item.newLast7Days > 0 ? 'new' : overdue ? 'overdue' : 'normal'
  return {
    ...item,
    ...meta,
    overdue,
    tone,
    toneColor: tone === 'new' ? 'error' : tone === 'overdue' ? 'warning' : 'info',
  }
}))

const waiting = computed(() => decorated.value
  .filter(t => t.count > 0)
  .sort((a, b) => b.newLast7Days - a.newLast7Days || b.count - a.count))

const clear = computed(() => decorated.value.filter(t => t.count === 0))
</script>

<style scoped>
.attention-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.attention-card {
  border: 1px solid rgb(var(--v-theme-borderSubtle));
  border-left-width: 4px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.attention-card:hover {
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
  transform: translateY(-2px);
}

.attention-card--new {
  border-left-color: rgb(var(--v-theme-error));
}

.attention-card--overdue {
  border-left-color: rgb(var(--v-theme-warning));
}

.attention-card--normal {
  border-left-color: rgb(var(--v-theme-info));
}

.attention-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.bg-error-lighten {
  background: rgba(176, 0, 32, 0.08);
}

.bg-warning-lighten {
  background: rgba(251, 140, 0, 0.12);
}

.bg-info-lighten {
  background: rgba(33, 150, 243, 0.1);
}

.attention-count {
  font-size: 32px;
  line-height: 1;
}

.attention-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

.attention-pill--new {
  color: rgb(var(--v-theme-error));
  background: rgba(176, 0, 32, 0.08);
}

.attention-pill--overdue {
  color: #b54708;
  background: rgba(251, 140, 0, 0.12);
}

.attention-pill--neutral {
  color: rgb(var(--v-theme-grey600));
  background: rgb(var(--v-theme-grey100));
}

.clear-chip {
  padding: 2px 10px;
  border-radius: 999px;
  background: rgb(var(--v-theme-grey100));
}

.clear-chip:hover {
  background: rgb(var(--v-theme-grey200));
}

.min-w-0 {
  min-width: 0;
}
</style>
