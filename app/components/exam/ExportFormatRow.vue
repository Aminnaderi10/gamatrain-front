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
        class="text-h6 text-no-wrap"
        :class="status.color"
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
import type { ExamExportPhase } from '@/composables/useExamExportDownload'

const props = defineProps<{
  format: ExamExportFormat
  price?: ExamExportPriceDTO
  phase?: ExamExportPhase
  progress: number
}>()

const isBusy = computed(() => props.phase === 'cooking' || props.phase === 'downloading')

const status = computed(() => {
  switch (props.phase) {
    case 'cooking': return { text: 'Preparing file...', color: 'text-grey600' }
    case 'downloading': return { text: `Downloading ${props.progress}%`, color: 'text-grey600' }
    case 'error': return { text: 'Download failed', color: 'text-lightError' }
    case 'retry': return { text: 'Try again', color: 'text-grey600' }
    default: return { text: props.format.summary, color: 'text-grey500' }
  }
})

const goIcon = computed(() => {
  if (props.phase === 'error') return 'md:priority_high'
  if (props.phase === 'retry') return 'md:autorenew'
  return 'md:download'
})
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
