<template>
  <NuxtLink
    :to="createLinkCard(information)"
    :prefetch="false"
    class="card-search card-primary-link d-block w-100 position-relative"
  >
    <div class="card-content d-flex align-stretch">
      <div class="cover-wrap d-flex align-center justify-center flex-shrink-0">
        <v-img
          v-if="information.lesson_pic"
          :alt="information.title ?? undefined"
          cover
          :src="information.lesson_pic"
          class="cover-image"
        />
        <div
          v-else
          class="cover-fallback d-flex align-center justify-center flex-column text-center"
        >
          <span class="font-weight-bold">{{ fallbackSubject.name }}</span>
          <span
            v-if="fallbackSubject.code"
            class="font-weight-bold"
          >
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
            class="card-indicators d-flex align-center flex-shrink-0 ga-3 ga-md-6"
            aria-label="Resource information"
          >
            <DifficultyIndicator
              v-if="hasDifficulty"
              :level="information.level ?? undefined"
              :size="16"
            />
            <span
              v-if="hasPdfAvailable"
              v-tooltip:top="'PDF file'"
              class="indicator indicator-pdf"
              role="img"
              aria-label="PDF file"
            >
              <span
                class="status-icon status-icon-pdf icon-pdf"
                aria-hidden="true"
              />
            </span>
            <span
              v-if="information.is_paper && information.a_file"
              v-tooltip:top="'Mark scheme'"
              class="indicator indicator-mark-scheme"
              role="img"
              aria-label="Mark scheme"
            >
              <v-icon
                icon="md:check_box_outlined"
                class="status-icon"
                color="teal500"
                size="16"
                aria-hidden="true"
              />
            </span>
            <span
              v-if="!information.is_paper && information.q_file_word"
              v-tooltip:top="'Word file'"
              class="indicator indicator-word"
              role="img"
              aria-label="Word file"
            >
              <span
                class="status-icon status-icon-word icon-word"
                aria-hidden="true"
              />
            </span>
            <span
              v-if="isFeaturedResource"
              v-tooltip:top="'Featured resource'"
              class="indicator indicator-fire"
              role="img"
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
            <QualityIndicator
              v-if="hasQualityRating"
              :score="qualityScore"
              :size="16"
            />
          </div>
        </div>

        <h2 class="card-title text-brandNavy font-weight-bold">
          {{ information?.title }}
        </h2>
        <p
          v-if="description"
          class="card-description text-grey500 text-truncate"
        >
          {{ description }}
        </p>

        <div class="subject-tags d-flex align-center justify-start flex-wrap ga-1 my-1">
          <v-chip
            v-for="tag in subjectTags"
            :key="tag"
            label
            variant="flat"
            color="surfaceSecondary"
            class="tag-chip text-grey500 border border-surfaceTertiary border-opacity-100 px-2"
          >
            {{ tag }}
          </v-chip>
        </div>

        <div class="metadata d-flex align-center flex-wrap ga-4 text-grey500">
          <span
            v-if="information.test_type_title"
            class="metadata-item"
          >
            <v-icon
              icon="md:segment_outlined"
              color="brandNavy"
              size="12"
              aria-hidden="true"
            />
            {{ information.test_type_title }}
          </span>
          <span
            v-if="information.tests_num && legacyType === 'azmoon'"
            class="metadata-item"
          >
            <v-icon
              size="12"
              color="brandNavy"
            >md:list</v-icon>
            {{ information.tests_num }} questions
          </span>
          <span
            v-if="information.views"
            class="metadata-item"
          >
            <v-icon
              size="12"
              color="brandNavy"
            >md:visibility_outlined</v-icon>
            {{ information.views }}
          </span>
          <span class="metadata-item">
            <v-icon
              size="12"
              color="brandNavy"
            >md:calendar_month_outlined</v-icon>
            {{ formattedDate }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { SearchCardItem, LegacySearchType } from '@/types/search'
import DifficultyIndicator from './difficultyIndicator.vue'
import QualityIndicator from './qualityIndicator.vue'
import { getLegacySearchType } from '@/utils/searchServices'

const props = withDefaults(defineProps<{
  information?: SearchCardItem
}>(), {
  information: () => ({ id: '' }),
})

const route = useRoute()
const { $stripHtmlTags } = useNuxtApp()

const legacyType = computed(() => getLegacySearchType(route.query.type))

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

const subjectTags = computed(() => [
  props.information.section_title,
  props.information.base_title,
  props.information.lesson_title,
].filter((tag): tag is string => Boolean(tag)))

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
  const subdate = props.information.subdate
  if (!subdate) return ''
  // The API sends "YYYY-MM-DD HH:mm:ss"; the ISO "T" form parses in every browser.
  const date = new Date(subdate.replace(' ', 'T'))
  return Number.isNaN(date.getTime())
    ? subdate
    : date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
})

// Exam Hub PDFs are generated by the exam-detail flow and do not use q_file.
const hasPdfAvailable = computed(() =>
  legacyType.value === 'azmoon' || Boolean(props.information.q_file),
)

const DETAIL_ROUTE_BY_TYPE: Partial<Record<LegacySearchType, string>> = {
  test: 'paper',
  dars: 'tutorial',
  azmoon: 'exam',
}

const createLinkCard = (information: SearchCardItem) =>
  `/${DETAIL_ROUTE_BY_TYPE[legacyType.value] ?? 'paper'}/${information.id}/${information.title_url}`
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
  box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.07);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.card-search:hover {
  box-shadow: 0 6px 18px rgba(var(--v-theme-brandNavy), 0.12);
  transform: translateY(-2px);
}

.card-primary-link {
  color: inherit;
  text-decoration: none;
}

.card-primary-link:focus-visible {
  outline: 3px solid rgba(var(--v-theme-primary), 0.34);
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
  color: rgba(var(--v-theme-brandNavy), 0.68);
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
  font-size: 18px;
  line-height: 22px;
  overflow-wrap: anywhere;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-description {
  max-width: 100%;
  margin: 0;
  color: rgba(var(--v-theme-brandNavy), 0.68) !important;
  font-size: 13px;
  line-height: 20px;
}

/* px sizes: the app's 10px root font size makes Vuetify's rem-based chip text too small */
.tag-chip {
  height: 24px;
  font-size: 11px;
  line-height: 16px;
}

.metadata {
  gap: 12px !important;
  min-height: 18px;
  padding-top: 0;
  color: rgba(var(--v-theme-brandNavy), 0.68);
  font-size: 12px;
  line-height: 18px;
}

.metadata-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

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

@media (min-width: 1280px) {
  .metadata {
    gap: 20px !important;
  }
}

@media (max-width: 959px) {
  .card-search { height: 174px; }

  /* Narrower cover on phones so the full image shows without crowding the text */
  .cover-wrap {
    width: 96px;
    aspect-ratio: auto;
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
