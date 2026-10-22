<template>
  <div class="month-switcher d-flex align-center ga-1 bg-white rounded-pill pa-1">
    <v-btn
      icon
      variant="text"
      size="small"
      aria-label="Previous month"
      @click="shift(-1)"
    >
      <v-icon size="20">
        md:chevron_left
      </v-icon>
    </v-btn>

    <span class="month-label text-h5 font-weight-bold text-grey700 text-center">{{ label }}</span>

    <v-btn
      icon
      variant="text"
      size="small"
      aria-label="Next month"
      :disabled="isCurrent"
      @click="shift(1)"
    >
      <v-icon size="20">
        md:chevron_right
      </v-icon>
    </v-btn>

    <v-btn
      v-if="!isCurrent"
      color="primary"
      variant="flat"
      rounded="pill"
      size="small"
      class="text-h6 font-weight-bold text-grey900 ml-1"
      prepend-icon="md:today"
      @click="emit('update:modelValue', currentMonth)"
    >
      This month
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

/** v-model: the month as YYYY-MM. Future months are not offered. */
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const currentMonth = dayjs().format('YYYY-MM')

const isCurrent = computed(() => props.modelValue >= currentMonth)
const label = computed(() => dayjs(`${props.modelValue}-01`).format('MMMM YYYY'))

const shift = (months: number) => {
  const next = dayjs(`${props.modelValue}-01`).add(months, 'month').format('YYYY-MM')
  emit('update:modelValue', next > currentMonth ? currentMonth : next)
}
</script>

<style scoped>
.month-switcher {
  border: 1px solid rgb(var(--v-theme-borderSubtle));
}

.month-label {
  min-width: 132px;
}
</style>
