<template>
  <div class="w-100 d-flex flex-column ga-4 mt-4">
    <div class="d-flex flex-column align-start">
      <h1 class="text-h4 text-grey700 font-weight-regular">
        Exam Result
      </h1>
      <span
        v-if="contentData?.exam.title"
        class="text-grey500 text-h6 mt-1"
      >
        {{ contentData?.exam.title }}
      </span>
    </div>

    <div class="d-flex flex-column flex-md-row ga-2">
      <v-card
        v-for="format in examExportFormats"
        :key="format.fileType"
        class="format-row d-flex align-center ga-3 pa-3 flex-grow-1"
        :class="{ 'format-row--owned': getPrice(format.fileType)?.purchased }"
        rounded="lg"
        elevation="0"
        :aria-label="`Download ${format.label}`"
        @click="handleExportClick(format.fileType)"
      >
        <span
          class="file-icon d-flex align-end justify-center pb-1 text-white font-weight-heavy rounded"
          :class="`bg-${format.color}`"
          aria-hidden="true"
        >{{ format.badge }}</span>

        <span class="flex-grow-1 d-flex flex-column overflow-hidden">
          <span class="text-h5 font-weight-heavy text-brandNavy">{{ format.label }}</span>
          <span
            v-if="getPrice(format.fileType)?.purchased"
            class="text-subtitle-1 font-weight-heavy text-success500"
          >Owned</span>
          <span
            v-else-if="getPrice(format.fileType)"
            class="d-flex align-center ga-1 text-subtitle-1 font-weight-heavy text-brandNavy text-no-wrap"
          >
            <v-icon
              size="14"
              color="generalSearchQuiz"
            >md:diamond_outlined</v-icon>
            {{ getPrice(format.fileType)?.points }} Gems
          </span>

          <span
            v-if="getPhase(format.fileType) === 'cooking'"
            class="text-h6 text-grey600 text-no-wrap"
          >Preparing file...</span>
          <span
            v-else-if="getPhase(format.fileType) === 'downloading'"
            class="text-h6 text-grey600 text-no-wrap"
          >Downloading {{ getProgress(format.fileType) }}%</span>
          <span
            v-else-if="getPhase(format.fileType) === 'error'"
            class="text-h6 text-lightError text-no-wrap"
          >Download Faild</span>
          <span
            v-else-if="getPhase(format.fileType) === 'retry'"
            class="text-h6 text-grey600 text-no-wrap"
          >Try Again</span>
          <span
            v-else
            class="text-h6 text-grey500 text-no-wrap"
          >{{ format.summary }}</span>
        </span>

        <span
          class="go-button d-flex align-center justify-center rounded-lg"
          :class="getPrice(format.fileType)?.purchased ? 'bg-success500' : 'bg-primary'"
          aria-hidden="true"
        >
          <v-progress-circular
            v-if="['cooking', 'downloading'].includes(getPhase(format.fileType) || '')"
            :indeterminate="getPhase(format.fileType) === 'cooking'"
            :model-value="getProgress(format.fileType)"
            size="18"
            width="2"
          />
          <v-icon
            v-else-if="getPhase(format.fileType) === 'error'"
            size="18"
          >md:priority_high</v-icon>
          <v-icon
            v-else-if="getPhase(format.fileType) === 'retry'"
            size="18"
          >md:autorenew</v-icon>
          <v-icon
            v-else
            size="18"
          >md:download</v-icon>
        </span>
      </v-card>
    </div>

    <lazy-common-modal-base
      v-model:show-dialog="showCoinPaymentModal"
      :max-width="900"
      title="Get Membership. Unlock Premium Downloads."
      subtitle="Join +50,000 Students"
    >
      <common-modal-payment
        :plans="paymentPlans"
        :billing-interval="billingInterval"
        :current-plan-id="currentPlanId"
        :current-plan-title="currentPlanTitle"
        @dismiss="showCoinPaymentModal = false"
        @switch-successfully="upgradePlanSuccessfully"
      />
    </lazy-common-modal-base>

    <lazy-common-coin-consumption-animation
      v-model:is-visible="showCoinAnimation"
      @animation-complete="handleAnimationComplete"
    />

    <lazy-test-counting-wallet-animation
      :is-start-animation="isStartWalletAnimation"
      :direction="-1"
      :delta-price="priceFile"
      @complete-animation="completeWalletAnimation"
    />
  </div>
</template>

<script setup lang="ts">
import type { ExamResultDetailDTO,
  DownloadResponseDTO,
  ExamExportFileType,
  UpgradeSuggestionsDTO,
  BillingInterval } from '@/types'
import { examExportFormats } from '@/utils/examExportFormats'

const props = defineProps<{
  contentData: ExamResultDetailDTO
}>()

const showCoinPaymentModal = ref(false)
const showCoinAnimation = ref(false)
const isStartWalletAnimation = ref(false)
const priceFile = ref(0)
const paymentPlans = ref<UpgradeSuggestionsDTO[]>([])
const billingInterval = ref<BillingInterval[]>([])
const currentPlanTitle = ref<string | null>(null)
const currentPlanId = ref<number | null>(null)
const pendingExport = ref<ExamExportFileType | null>(null)

// The same generated export as the exam details page (gamatrain-back exams/export),
// not the file saved with the exam.
const {
  fetchPrices,
  getPrice,
  getPhase,
  getProgress,
  startExport,
} = useExamExportDownload({
  examId: props.contentData.exam.id,
  title: props.contentData.exam.title || '',
  titleUrl: props.contentData.exam.title || '',
  onDownloaded: (points) => {
    pendingExport.value = null
    if (points > 0) {
      priceFile.value = points
      showCoinAnimation.value = true
    }
  },
  onInsufficientBalance: () => {
    showCoinPaymentModal.value = true
  },
  onUpgradeSuggestions: (data: DownloadResponseDTO) => {
    paymentPlans.value = data.upgradeSuggestions || []
    billingInterval.value = data.availableBillingIntervals || []
    currentPlanTitle.value = data.currentPlanTitle
    currentPlanId.value = data.currentPlanId
    showCoinPaymentModal.value = true
  },
})

const handleExportClick = (fileType: ExamExportFileType) => {
  pendingExport.value = fileType
  startExport(fileType)
}

const handleAnimationComplete = async () => {
  // Close everything immediately when animation completes
  showCoinAnimation.value = false
  isStartWalletAnimation.value = true
}

const completeWalletAnimation = () => {
  isStartWalletAnimation.value = false
}

const upgradePlanSuccessfully = async () => {
  showCoinPaymentModal.value = false
  if (pendingExport.value) {
    startExport(pendingExport.value)
  }
}

onMounted(() => {
  fetchPrices()
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
