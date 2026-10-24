<template>
  <section
    v-if="questions.length"
    ref="sectionRef"
    aria-labelledby="exam-samples-title"
  >
    <h2
      id="exam-samples-title"
      class="gama-text-h4 text-brandNavy"
    >
      Sample questions from {{ subject }}
    </h2>
    <p class="text-h5 text-grey500 mt-1 mb-4">
      The first {{ questions.length }} of {{ total || questions.length }} questions. Answers are shown when you finish the test.
    </p>

    <ol class="sample-list d-flex flex-column ga-3 pa-0">
      <li
        v-for="(question, index) in questions"
        :key="question.id"
      >
        <v-card
          rounded="xl"
          border
          elevation="0"
          class="pa-4 pa-sm-5"
        >
          <test-question-stem
            :question="question.question || ''"
            :file="question.image"
            :number="index + 1"
          />
          <ol
            v-if="question.options.length"
            class="option-list d-flex flex-column ga-2 mt-3 pa-0"
          >
            <li
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="d-flex align-start ga-3"
            >
              <span
                class="option-key flex-shrink-0 d-flex align-center justify-center rounded-lg border-md border-grey200 text-grey800"
                aria-hidden="true"
              >{{ optionIndex + 1 }}</span>
              <div class="d-flex flex-column align-start ga-2 min-w-0">
                <div
                  v-if="option.text"
                  class="option-text text-grey800 overflow-x-auto overflow-y-hidden"
                  v-html="option.text"
                />
                <test-question-image
                  v-if="option.image"
                  variant="option"
                  :src="option.image"
                  :alt="`Option ${optionIndex + 1} image`"
                />
              </div>
            </li>
          </ol>
          <!-- Answering happens in the exam itself, so the whole attempt is scored; without an online exam the
               question's own page is the only place to answer it. -->
          <v-btn
            v-if="canStart"
            variant="text"
            color="primary"
            class="text-h6 font-weight-semibold text-none px-0 mt-3"
            @click="startExam"
          >
            Answer this question
          </v-btn>
          <nuxt-link
            v-else
            :to="contentPath('test', question.code || question.id)"
            class="d-inline-block text-h6 text-primary font-weight-semibold mt-3"
          >
            Answer this question
          </nuxt-link>
        </v-card>
      </li>
    </ol>

    <v-btn
      v-if="canStart"
      color="primary"
      size="large"
      rounded="lg"
      class="mt-4 text-none"
      @click="startExam"
    >
      Start the full {{ total || '' }}-question test
    </v-btn>
  </section>
</template>

<script setup lang="ts">
import type { ExamSampleQuestionDTO } from '@/types'

const props = defineProps<{
  examId: string
  questions: ExamSampleQuestionDTO[]
  /** What the questions come from, e.g. "Accounting 0452/11 Oct Nov 2024". */
  subject: string
  total: number
  canStart: boolean
}>()

const { startExam } = useExamStart(() => props.examId)
const sectionRef = ref<HTMLElement>()
const renderMath = useMathJaxRender()

// The HTML is in the server-rendered page; formulas are typeset in the browser, as on the question page.
onMounted(() => renderMath(sectionRef.value))
watch(() => props.questions, async () => {
  await nextTick()
  renderMath(sectionRef.value)
})
</script>

<style scoped>
.sample-list,
.option-list {
  list-style: none;
}
.option-key {
  width: 32px;
  height: 32px;
  font-size: 1.4rem;
}
.option-text {
  font-size: 1.6rem;
}
.option-text :deep(p) {
  margin: 0;
}
.min-w-0 {
  min-width: 0;
}
</style>
