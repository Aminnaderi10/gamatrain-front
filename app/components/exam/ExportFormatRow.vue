<template>
  <!-- One downloadable format (PDF/Word/PowerPoint): price, export status and a go button.
       Shared by the exam details action card and the exam result header; click falls through to the card. -->
  <v-card
    class="format-row d-flex align-center ga-3 pa-3"
    :class="{ 'format-row--owned': price?.purchased }"
    rounded="lg"
    elevation="0"
    :aria-label="`Download ${format.label}`"
  >
    <span
      class="file-icon d-flex align-end justify-center pb-1 text-white font-weight-heavy rounded"
      :class="`bg-${format.color}`"
      aria-hidden="true"
    >{{ format.badge }}</span>

    <span class="flex-grow-1 d-flex flex-column overflow-hidden">
      <span class="text-h5 font-weight-heavy text-brandNavy">{{ format.label }}</span>

      <span
        v-if="price?.purchased"
        class="text-subtitle-1 font-weight-heavy text-success500"
      >Owned</span>
      <span
        v-else-if="price"
        class="d-flex align-center ga-1 text-subtitle-1 font-weight-heavy text-brandNavy text-no-wrap"
      >
        <v-icon
          size="14"
          color="generalSearchQuiz"
          aria-hidden="true"
        >md:diamond_outlined</v-icon>
        {{ price.points }} Gems
      </span>

      <span
        class="text-h6"
        :class="status.color"
        aria-live="polite"
      >{{ status.text }}</span>
    </span>

    <span
      class="go-button d-flex align-center justify-center rounded-lg"
      :class="price?.purchased ? 'bg-success500' : 'bg-primary'"
      aria-hidden="true"
    >
      <v-progress-circular
        v-if="isBusy"
        :indeterminate="phase === 'cooking'"
        :model-value="progress"
        size="18"
        width="2"
      />
      <!-- Counts down to the next automatic retry. -->
      <v-progress-circular
        v-else-if="phase === 'waiting' && retry"
        :model-value="(retry.secondsLeft / retry.delay) * 100"
        size="26"
        width="2"
      >
        <span class="text-subtitle-1 font-weight-heavy">{{ retry.secondsLeft }}</span>
      </v-progress-circular>
      <v-icon
        v-else
        size="18"
      >{{ goIcon }}</v-icon>
    </span>
  </v-card>
</template>

<script setup lang="ts">
import type { ExamExportPriceDTO } from '@/types'
import type { ExamExportFormat } from '@/utils/examExportFormats'
import { EXAM_EXPORT_AUTO_RETRY_DELAYS } from '@/composables/useExamExportDownload'
import type { ExamExportPhase, ExamExportRetry } from '@/composables/useExamExportDownload'

const props = defineProps<{
  format: ExamExportFormat
  price?: ExamExportPriceDTO
  phase?: ExamExportPhase
  progress: number
  retry?: ExamExportRetry
}>()

const maxRetries = EXAM_EXPORT_AUTO_RETRY_DELAYS.length

const isBusy = computed(() => props.phase === 'cooking' || props.phase === 'downloading')

const status = computed(() => {
  switch (props.phase) {
    case 'cooking': return {
      text: props.retry ? `Retry ${props.retry.attempt} of ${maxRetries} · preparing file...` : 'Preparing file...',
      color: 'text-grey600',
    }
    case 'downloading': return { text: `Downloading ${props.progress}%`, color: 'text-grey600' }
    case 'waiting': return {
      text: `Failed · retrying in ${props.retry?.secondsLeft ?? 0}s (${props.retry?.attempt ?? 1}/${maxRetries})`,
      color: 'text-lightError',
    }
    case 'failed': return { text: 'Download failed · tap to retry', color: 'text-lightError' }
    default: return { text: props.format.summary, color: 'text-grey500' }
  }
})

const goIcon = computed(() => props.phase === 'failed' ? 'md:autorenew' : 'md:download')
</script>

<style scoped>
.format-row {
  border: 1.5px solid rgb(var(--v-theme-primary50));
  cursor: pointer;
}
.format-row--owned {
  border-color: rgb(var(--v-theme-success300));
}
.file-icon {
  position: relative;
  flex: none;
  width: 36px;
  height: 42px;
  font-size: 0.95rem;
}
.file-icon::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-bottom-left-radius: 5px;
  background: rgba(var(--v-theme-white), 0.45);
}
.go-button {
  flex: none;
  width: 34px;
  height: 34px;
  color: rgb(var(--v-theme-brandNavy));
}
.format-row--owned .go-button {
  color: rgb(var(--v-theme-white));
}
</style>
