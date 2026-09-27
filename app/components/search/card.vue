<template>
  <NuxtLink
    :to="createLinkCard(information)"
    :prefetch="false"
    class="card-search card-primary-link d-block w-100 rounded-xl position-relative"
    :aria-label="information?.title"
  >
    <div class="card-content d-flex align-stretch">
      <div class="cover-wrap d-flex align-center justify-center flex-shrink-0">
        <v-img
          v-if="information.lesson_pic"
          :alt="information?.title"
          cover
          :src="information.lesson_pic"
          class="cover-image"
        />
        <div
          v-else
          class="cover-fallback d-flex align-center justify-center flex-column text-center"
        >
          <span class="font-weight-bold">{{ fallbackSubject.name }}</span>
          <span v-if="fallbackSubject.code" class="font-weight-bold">
            {{ fallbackSubject.code }}
          </span>
        </div>
      </div>

      <div class="card-body d-flex flex-column min-width-0">
        <div class="card-top d-flex align-start justify-space-between ga-4">
          <div class="publisher d-flex align-center ga-2 min-width-0">
            <v-img
              :src="information.avatar || '/images/default-user.svg'"
              :alt="publisherName"
              width="26"
              height="26"
              cover
              class="publisher-avatar rounded-circle flex-shrink-0"
            />
            <span class="publisher-name text-truncate">{{ publisherName }}</span>
          </div>

          <div
            class="card-indicators d-flex align-center flex-shrink-0"
            aria-label="Resource information"
          >
            <DifficultyIndicator v-if="hasDifficulty" :level="information.level" :size="16" />
            <span
              v-if="hasAnswersAtEndOfFiles"
              v-tooltip:top="'Answers included'"
              class="indicator indicator-library"
              aria-label="Answers included"
            >
              <v-icon
                icon="md:library_add_check"
                class="status-icon status-icon-library"
                color="greenLight500"
                size="16"
                aria-hidden="true"
              />
            </span>
            <span
              v-if="hasPdfAvailable"
              v-tooltip:top="'PDF file'"
              class="indicator indicator-pdf"
              aria-label="PDF file"
            >
              <span class="status-icon status-icon-pdf icon-pdf" aria-hidden="true" />
            </span>
            <span
              v-if="information.is_paper && information.a_file"
              v-tooltip:top="'Mark scheme'"
              class="indicator indicator-mark-scheme"
              aria-label="Mark scheme"
            >
              <v-icon
                icon="md:check_box_outlined"
                class="status-icon status-icon-mark-scheme"
                color="teal500"
                size="16"
                aria-hidden="true"
              />
            </span>
            <span
              v-if="!information.is_paper && information.q_file_word"
              v-tooltip:top="'Word file'"
              class="indicator indicator-word"
              aria-label="Word file"
            >
              <span class="status-icon status-icon-word icon-word" aria-hidden="true" />
            </span>
            <span
              v-if="isFeaturedResource"
              v-tooltip:top="'Featured resource'"
              class="indicator indicator-fire"
              aria-label="Featured resource"
            >
              <v-icon
                icon="md:local_fire_department"
                class="status-icon"
                color="lightError"
                size="16"
                aria-hidden="true"
              />
            </span>
            <QualityIndicator v-if="hasQualityRating" :score="qualityScore" :size="16" />
          </div>
        </div>

        <h2 class="card-title text-black font-weight-medium">
          {{ information?.title }}
        </h2>
        <p
          v-if="description"
          class="card-description text-grey500 text-truncate"
        >
          {{ description }}
        </p>

        <div class="subject-tags d-flex align-center justify-start flex-wrap ga-2">
          <v-chip
            v-show="information.section_title"
            variant="flat"
            class="tag-chip"
            color="grey100"
          >
            <span class="text-grey500">{{ information?.section_title }}</span>
          </v-chip>
          <v-chip
            v-show="information.base_title"
            variant="flat"
            class="tag-chip"
            color="grey100"
          >
            <span class="text-grey500">{{ information?.base_title }}</span>
          </v-chip>
          <v-chip
            v-show="information.lesson_title"
            variant="flat"
            class="tag-chip"
            color="grey100"
          >
            <span class="text-grey500">{{ information.lesson_title }}</span>
          </v-chip>
        </div>

        <div class="metadata d-flex align-center flex-wrap ga-4 text-grey500">
          <span
            v-if="information.ext && route.query.type == 'learnfiles'"
            class="metadata-item"
          >
            <v-icon size="12" color="grey300">md:sticky_note_outlined</v-icon>
            {{ information.ext }}
          </span>
          <span v-if="information.test_type_title" class="metadata-item">
            <v-icon
              icon="md:segment_outlined"
              class="metadata-test-type-icon"
              color="brandNavy"
              size="12"
              aria-hidden="true"
            />
            {{ information.test_type_title }}
          </span>
          <span
            v-if="information.tests_num && route.query.type == 'azmoon'"
            class="metadata-item"
          >
            <v-icon size="12" color="grey300">md:list</v-icon>
            {{ information.tests_num }}
          </span>
          <span v-if="information.views" class="metadata-item">
            <v-icon size="12" color="brandNavy">md:visibility_outlined</v-icon>
            {{ information.views }}
          </span>
          <span
            v-if="information.reply_num && route.query.type == 'question'"
            class="metadata-item"
          >
            <v-icon size="12" color="grey300">md:reply</v-icon>
            {{ information.reply_num }}
          </span>
          <span class="metadata-item">
            <v-icon size="12" color="brandNavy">md:calendar_month_outlined</v-icon>
            {{ formattedDate }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DifficultyIndicator from './difficultyIndicator.vue'
import QualityIndicator from './qualityIndicator.vue'
import { getLegacySearchType } from '@/utils/searchServices'
import { hasEmbeddedAnswers } from '@/utils/searchCardAvailability'

const route = useRoute()
const { $stripHtmlTags } = useNuxtApp()

const props = defineProps({
  information: {
    type: Object,
    default: () => ({}),
  },
})

const publisherName = computed(() => {
  const name = [props.information.first_name, props.information.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  return name || props.information.username || 'GamaTrain'
})

const fallbackSubject = computed(() => {
  const title = String(props.information.lesson_title || '').trim()
  const subjectMatch = title.match(/^(.*?)\s*(\(\d+\))$/)

  return {
    name: subjectMatch?.[1]?.trim() || title,
    code: subjectMatch?.[2] || '',
  }
})

const description = computed(() => $stripHtmlTags(
  String(props.information.description || props.information.summary || ''),
  1200,
))

const qualityScore = computed(() => {
  const score = Number(props.information.referee_score ?? props.information.ref_score ?? 0)
  return Number.isFinite(score) ? Math.min(5, Math.max(0, Math.round(score))) : 0
})

const hasDifficulty = computed(() =>
  !props.information.is_paper
  && ['1', '2', '3'].includes(String(props.information.level)),
)

const hasQualityRating = computed(() =>
  !props.information.is_paper && qualityScore.value > 0,
)

const isFeaturedResource = computed(() =>
  !props.information.is_paper && qualityScore.value === 5,
)

const formattedDate = computed(() => {
  if (!props.information.subdate) return ''
  const date = new Date(props.information.subdate)
  return Number.isNaN(date.getTime())
    ? props.information.subdate
    : date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
})

const hasAnswersAtEndOfFiles = computed(() =>
  getLegacySearchType(route.query.type) === 'test'
  && hasEmbeddedAnswers(props.information),
)

// Exam Hub PDFs are generated by the exam-detail flow and do not use q_file.
const hasGeneratedExamPdf = computed(() =>
  getLegacySearchType(route.query.type) === 'azmoon',
)

const hasPdfAvailable = computed(() =>
  hasGeneratedExamPdf.value || Boolean(props.information.q_file),
)

const createLinkCard = (information) => {
  let idType = ''
  switch (getLegacySearchType(route.query.type)) {
    case 'test':
      idType = 'paper'
      break
    case 'question':
      idType = 'qa'
      break
    case 'dars':
      idType = 'tutorial'
      break
    case 'azmoon':
      idType = 'exam'
      break
    case 'learnfiles':
      idType = 'multimedia'
      break
    default:
      idType = 'paper'
      break
  }
  return `/${idType}/${information.id}/${information.title_url}`
}
</script>

<style scoped>
.card-search {
  overflow: hidden;
  height: 174px;
  max-width: 1200px;
  cursor: pointer;
  border: 1px solid rgb(var(--v-theme-borderSubtle));
  border-radius: 16px !important;
  background: rgb(var(--v-theme-grey25));
  box-shadow: 0 1px 2px rgb(var(--v-theme-brandNavy) / 7%);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.card-search:hover {
  border-color: rgb(var(--v-theme-borderSubtle));
  box-shadow: 0 6px 18px rgb(var(--v-theme-brandNavy) / 12%);
  transform: translateY(-2px);
}

.card-primary-link {
  color: inherit;
  text-decoration: none;
}

.card-primary-link:focus-visible {
  outline: 3px solid rgb(var(--v-theme-academicGold) / 34%);
  outline-offset: -3px;
}

.card-content {
  height: 100%;
  min-height: 0;
  padding: 0;
  color: inherit;
}

.cover-wrap {
  width: auto;
  min-width: 0;
  height: 100%;
  min-height: 100%;
  max-height: 100%;
  aspect-ratio: 63 / 74;
  overflow: hidden;
  border-radius: 15px 0 0 15px;
  background: rgb(var(--v-theme-softGold));
}

.cover-image,
.cover-fallback {
  width: 100%;
  height: 100%;
}

.cover-fallback {
  padding: 12px;
  background: rgb(var(--v-theme-surfaceTertiary));
  color: rgb(var(--v-theme-grey600));
}

.card-body {
  flex: 1;
  padding: 12px 16px;
}

.min-width-0 { min-width: 0; }

.publisher-avatar { border: 1px solid rgb(var(--v-theme-borderSubtle)); }

.card-top { margin-bottom: 8px; }

.publisher-name {
  max-width: 260px;
  color: rgb(var(--v-theme-brandNavy) / 68%);
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
}

.card-title {
  display: -webkit-box;
  height: 44px;
  max-width: 100%;
  overflow: hidden;
  margin: 0 0 4px;
  color: rgb(var(--v-theme-brandNavy)) !important;
  font-size: 18px;
  font-weight: 650 !important;
  line-height: 22px;
  overflow-wrap: anywhere;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-description {
  max-width: 100%;
  margin: 0;
  color: rgb(var(--v-theme-brandNavy) / 68%) !important;
  font-size: 13px;
  line-height: 20px;
}

.subject-tags {
  gap: 4px !important;
  margin-block: 4px;
}

.tag-chip {
  position: relative;
  pointer-events: none;
  height: 24px;
  padding: 4px 8px !important;
  color: rgb(var(--v-theme-brandNavy) / 68%) !important;
  background: rgb(var(--v-theme-surfaceSecondary)) !important;
  border: 1px solid rgb(var(--v-theme-surfaceTertiary));
  border-radius: 6px !important;
  font-size: 11px;
  line-height: 16px;
}

.tag-chip :deep(.v-chip__content) {
  color: inherit;
}

.metadata {
  gap: 12px !important;
  min-height: 18px;
  padding-top: 0;
  color: rgb(var(--v-theme-brandNavy) / 68%);
  font-size: 12px;
  line-height: 18px;
}

.metadata-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.metadata-test-type-icon {
  background: transparent;
  -webkit-text-stroke: 0;
}

.card-indicators { gap: 8px; }

.indicator {
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
}

.status-icon {
  display: block;
  width: 100%;
  height: 100%;
}

.status-icon-library {
  background: transparent;
  -webkit-text-stroke: 0;
}

.status-icon-mark-scheme {
  background: transparent;
  -webkit-text-stroke: 0;
}

.indicator-pdf,
.indicator-word {
  background: rgb(var(--v-theme-grey50));
}

.indicator-pdf {
  border-radius: 50%;
}

.indicator-word {
  border-radius: 4px;
}

.status-icon-pdf,
.status-icon-word {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.status-icon-pdf {
  color: rgb(var(--v-theme-lightError));
}

.status-icon-word {
  color: rgb(var(--v-theme-blue500));
}

.indicator-muted { opacity: 0.32; }

@media (min-width: 960px) {
  .card-indicators { gap: 24px; }
}

@media (min-width: 1280px) {
  .metadata {
    gap: 20px !important;
  }
}

@media (max-width: 959px) {
  .card-search { height: 174px; }

  .cover-fallback {
    align-items: flex-start !important;
    direction: ltr;
    text-align: left !important;
  }

  .cover-fallback > span {
    width: 50%;
    max-width: 50%;
    overflow-wrap: break-word;
    white-space: normal;
  }

  .card-body {
    position: relative;
    margin-left: -74px;
    padding: 12px 16px;
    background: rgb(var(--v-theme-grey25));
  }

  .card-title {
    font-size: 16px;
  }

  .subject-tags {
    flex-wrap: nowrap !important;
    overflow: hidden;
  }

  .tag-chip {
    flex: 0 0 auto;
  }

  .metadata {
    flex-wrap: nowrap !important;
    overflow: hidden;
  }

  .metadata-item {
    flex: 0 0 auto;
  }
}
</style>
