<template>
  <v-container
    v-if="contentData"
    class="exam-details d-flex flex-column mt-16 pb-0"
  >
    <lazy-widgets-breadcrumb
      background-color="transparent"
      :breads="breads"
    />

    <v-row class="mt-1">
      <v-col
        cols="12"
        md="8"
      >
        <v-chip
          color="generalSearchQuiz"
          variant="tonal"
          class="kicker text-h6 text-uppercase font-weight-bold"
        >
          {{ kicker }}
        </v-chip>
        <h1 class="gama-text-h1 text-brandNavy mt-3 mb-3">
          {{ contentData.title.trim() }}
        </h1>
        <p class="lede text-grey600">
          {{ lede }}
        </p>

        <v-row
          dense
          class="facts mt-5 mb-4"
        >
          <v-col
            v-for="fact in facts"
            :key="fact.label"
            cols="6"
            sm="3"
          >
            <v-card
              rounded="lg"
              border
              elevation="0"
              class="px-4 py-3 h-100"
            >
              <p class="gama-text-h5 font-weight-heavy text-brandNavy">
                {{ fact.value }}
              </p>
              <div
                v-if="fact.level"
                class="level-bars d-flex ga-1 mt-1"
                aria-hidden="true"
              >
                <span
                  v-for="step in 3"
                  :key="step"
                  class="rounded-pill"
                  :class="step <= fact.level ? 'bg-primary' : 'bg-grey200'"
                />
              </div>
              <p class="text-h6 text-grey500 mt-1">
                {{ fact.label }}
              </p>
            </v-card>
          </v-col>
        </v-row>

        <div class="d-flex align-center flex-wrap ga-3">
          <v-avatar
            :image="contentData.avatar || '/images/member/avatar.svg'"
            size="40"
          />
          <div class="text-h5 text-grey600">
            Made by <b class="text-grey900">{{ authorName }}</b>
            <p class="text-h6 text-grey500">
              Updated {{ fromNowLocal(contentData.up_date) }}<template v-if="firstTopic">
                · {{ firstTopic }}
              </template>
            </p>
          </div>
          <common-follow-button :user-id="contentData.user_" />
        </div>

        <div class="d-flex flex-wrap ga-2 mt-4">
          <v-chip
            v-for="tag in tags"
            :key="tag.text"
            :to="tag.to"
            variant="outlined"
            color="grey300"
            class="tag-chip text-h6 font-weight-semibold"
          >
            <span class="text-grey600">{{ tag.text }}</span>
          </v-chip>
        </div>
      </v-col>

      <v-col
        cols="12"
        md="4"
      >
        <div class="action-column">
          <exam-detail-action-card
            :id="contentData.id"
            :title="contentData.title"
            :title-url="contentData.title_url"
            :question-count="Number(contentData.tests_num) || 0"
            :participation="contentData.price?.participation"
            :exam-user-data="contentData.examUserData"
            @share="openShare = true"
            @report="openCrashReport = true"
            @prices="exportPrices = $event"
          />
        </div>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col
        cols="12"
        md="8"
      >
        <exam-detail-file-comparison :prices="exportPrices" />
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex flex-column ga-4 pt-md-16"
      >
        <exam-detail-about-card :exam="contentData" />
        <exam-detail-topics-card :topics="contentData.topics" />
      </v-col>
    </v-row>

    <lazy-exam-detail-related-quizzes
      :id="contentData.id"
      :subject="contentData.lesson_title?.trim()"
      class="mt-10"
    />

    <!-- Past Papers, Multimedia and Tutorials; quizzes already have their own row above. -->
    <div class="mt-6 mx-n4">
      <lazy-common-related-content
        :id="contentData.id"
        source="exam"
        :request="[`test`, `file`, `tutorial`]"
      />
    </div>

    <lazy-exam-detail-quiz-faq
      :exam="contentData"
      :prices="exportPrices"
      class="mt-10"
    />

    <div class="d-flex justify-space-between align-center flex-wrap ga-2 text-h6 text-grey500 mt-10 mb-8">
      <span>
        Spotted a mistake?
        <a
          href="#"
          class="text-decoration-underline text-grey600"
          @click.prevent="openCrashReport = true"
        >Report a problem with this quiz</a>
      </span>
    </div>

    <exam-detail-mobile-action-bar
      :id="contentData.id"
      :can-start="!!contentData.price?.participation"
      :has-finished="hasFinished"
    />

    <lazy-common-modal-base
      v-model:show-dialog="openCrashReport"
      title="Report a problem"
    >
      <lazy-common-modal-crash-report
        :id="contentData.id"
        type-crash-report="test"
        @close="openCrashReport = false"
      />
    </lazy-common-modal-base>

    <lazy-common-modal-base
      v-model:show-dialog="openShare"
      title="Share"
    >
      <lazy-common-modal-share :title="contentData.title" />
    </lazy-common-modal-base>
  </v-container>
</template>

<script setup lang="ts">
import type { ExamExportPriceDTO, ExamUserDataExamDetaiDTO } from '@/types'

interface BreadCrumb {
  text: string
  disabled: boolean
  href: string
}

const route = useRoute()
const { getItemById } = useExam()
const { fromNowLocal } = useDateTime()

const breads = ref<BreadCrumb[]>([])
const openShare = ref(false)
const openCrashReport = ref(false)
// Filled by the action card once the export prices load, for the comparison table and the FAQ.
const exportPrices = ref<ExamExportPriceDTO[]>([])

const { data: contentData } = await useAsyncData(
  `exam-${route.params.id}`,
  async () => {
    try {
      const response = await getItemById(route.params.id as string)
      return response.status == 1 && response.data ? response.data : null
    }
    catch {
      return null
    }
  },
)

// showError inside the handler only lands in useAsyncData's error, so SSR answered 200 with an empty page.
// Throwing from setup makes Nuxt render the error page with a real 404.
if (!contentData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  })
}

const { url: canonicalUrl } = await useCanonicalContentPath('exam', contentData.value.id, contentData.value.title_url)

const initBreadCrumb = () => {
  if (!contentData.value) return
  breads.value = []
  breads.value.push({
    text: 'QuizHub',
    disabled: false,
    href: '/search?type=quizhub',
  })
  breads.value.push(
    {
      text: contentData.value.section_title,
      disabled: false,
      href: `/search?type=quizhub&section=${contentData.value.section}`,
    },
    {
      text: contentData.value.base_title,
      disabled: false,
      href: `/search?type=quizhub&section=${contentData.value.section}&base=${contentData.value.base}`,
    },
    {
      text: contentData.value.lesson_title,
      disabled: false,
      href: `/search?type=quizhub&section=${contentData.value.section}&base=${contentData.value.base}&lesson=${contentData.value.lesson}`,
    },
  )
}

if (contentData.value) {
  initBreadCrumb()
}
watch(
  () => contentData.value,
  () => {
    initBreadCrumb()
  },
  { immediate: true },
)

const difficultyLabels: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

const topicTitles = computed(() =>
  (contentData.value?.topics ?? []).map(topic => topic.title?.trim()).filter(Boolean) as string[],
)
const firstTopic = computed(() => topicTitles.value[0] ?? '')

const authorName = computed(() =>
  [contentData.value?.first_name, contentData.value?.last_name].map(name => name?.trim()).filter(Boolean).join(' '),
)

const hasFinished = computed(() => {
  const userData = contentData.value?.examUserData as ExamUserDataExamDetaiDTO | boolean | undefined
  return typeof userData === 'object' && userData?.status == '1'
})

const kicker = computed(() => {
  const type = contentData.value?.azmoon_type_title?.trim()
  return `${type ? `${type} quiz` : 'Quiz'} · online or printable`
})

// The intro under the title, built from the quiz's own facts so every page has its own description.
const lede = computed(() => {
  const exam = contentData.value
  if (!exam) return ''
  const questions = Number(exam.tests_num) || 0
  const minutes = Number(exam.azmoon_time) || 0
  const subject = [exam.section_title, exam.base_title, exam.lesson_title].map(t => t?.trim()).filter(Boolean).join(' ')
  const about = [
    questions ? `${questions} questions` : 'Questions',
    topicTitles.value.length ? ` on ${topicTitles.value.join(', ')}` : '',
    subject ? ` for ${subject}` : '',
  ].join('')
  const online = exam.price?.participation
    ? `Take it online${minutes ? ` with a ${minutes}-minute timer` : ''}, or download`
    : 'Download'
  return `${about}. ${online} it as a PDF, Word or PowerPoint file for your class.`
})

const facts = computed(() => {
  const exam = contentData.value
  if (!exam) return []
  const level = Number(exam.level)
  const participants = Number(exam.participants_num) || 0
  return [
    { label: 'questions', value: Number(exam.tests_num) ? exam.tests_num : '' },
    { label: 'time limit', value: Number(exam.azmoon_time) ? `${exam.azmoon_time} min` : '' },
    { label: 'difficulty', value: difficultyLabels[level] ?? '', level: difficultyLabels[level] ? level : 0 },
    { label: participants === 1 ? 'student took it' : 'students took it', value: participants ? String(participants) : '' },
  ].filter(fact => fact.value)
})

const tags = computed(() => {
  const exam = contentData.value
  if (!exam) return []
  const search = '/search?type=quizhub'
  return [
    { text: exam.section_title?.trim(), to: `${search}&section=${exam.section}` },
    { text: exam.base_title?.trim(), to: `${search}&section=${exam.section}&base=${exam.base}` },
    { text: exam.lesson_title?.trim(), to: `${search}&section=${exam.section}&base=${exam.base}&lesson=${exam.lesson}` },
    { text: exam.azmoon_type_title?.trim(), to: undefined },
  ].filter(tag => tag.text)
})

const { buildSchema } = useSeoSchema()

// The meta description used to repeat the title; what the exam covers and how long it is says more.
const examDescription = computed(() => {
  const exam = contentData.value
  if (!exam) return ''
  const minutes = Number(exam.azmoon_time) || 0
  const facts = [
    Number(exam.tests_num) ? `${exam.tests_num} questions` : '',
    minutes ? `${minutes} minutes` : '',
  ].filter(Boolean).join(', ')
  const subject = [exam.lesson_title, exam.base_title, exam.section_title].map(t => t?.trim()).filter(Boolean).join(', ')
  return `${exam.title}${facts ? ` - ${facts}` : ''}. Online exam for ${subject || 'practice'} on GamaTrain.`
})

// Quiz is schema.org's LearningResource for an assessment; breadcrumbs are what Google shows in results.
const schema = computed(() => {
  const exam = contentData.value
  if (!exam) return null
  const minutes = Number(exam.azmoon_time) || 0
  const author = [exam.first_name, exam.last_name].filter(Boolean).join(' ')
  return buildSchema({
    dto: exam,
    url: canonicalUrl,
    title: exam.title,
    description: examDescription.value,
    breadcrumbs: breads.value,
    types: ['webpage', 'learning', 'breadcrumb'],
    learning: {
      '@type': 'Quiz',
      'learningResourceType': 'Practice exam',
      'educationalUse': 'Assessment',
      'teaches': exam.lesson_title?.trim() || undefined,
      'educationalLevel': exam.base_title?.trim() || undefined,
      'image': exam.thumb_pic_url || undefined,
      'timeRequired': minutes ? `PT${minutes}M` : undefined,
      ...(author && { author: { '@type': 'Person', 'name': author } }),
    },
  })
})

useHead(() => ({
  title: contentData.value?.title || 'Exam Details',
  meta: [
    {
      hid: 'apple-mobile-web-app-title',
      name: 'apple-mobile-web-app-title',
      content: contentData.value?.title,
    },
    {
      hid: 'og:title',
      name: 'og:title',
      content: contentData.value?.title,
    },
    {
      hid: 'og:site_name',
      name: 'og:site_name',
      content: 'GamaTrain',
    },
    {
      hid: 'description',
      name: 'description',
      content: examDescription.value,
    },
    {
      hid: 'og:description',
      name: 'og:description',
      content: examDescription.value,
    },
    {
      hid: 'og:image',
      property: 'og:image',
      content: contentData.value?.thumb_pic_url ?? null,
    },
    {
      hid: 'twitter:card',
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      hid: 'twitter:title',
      name: 'twitter:title',
      content: contentData.value?.title,
    },
    {
      hid: 'twitter:description',
      name: 'twitter:description',
      content: examDescription.value,
    },
    {
      hid: 'twitter:image',
      name: 'twitter:image',
      content: contentData.value?.thumb_pic_url ?? null,
    },
  ],
  script: schema.value
    ? [{ key: 'json-ld-schema', type: 'application/ld+json', innerHTML: JSON.stringify(schema.value) }]
    : [],
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
}))
</script>

<style scoped>
.exam-details {
  max-width: 1232px;
}
.lede {
  font-size: 1.7rem;
  line-height: 1.6;
  max-width: 640px;
}
.level-bars span {
  flex: 1;
  height: 5px;
}
.kicker {
  letter-spacing: 0.04em;
}
.tag-chip {
  background-color: rgb(var(--v-theme-white));
}
@media (min-width: 960px) {
  .action-column {
    position: sticky;
    top: 88px;
  }
}
</style>
