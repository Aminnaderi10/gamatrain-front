<template>
  <nav
    class="services-navigation"
    aria-label="Search services"
    role="tablist"
  >
    <div class="services-navigation__items">
      <div
        v-for="service in services"
        :key="service.id"
        class="services-navigation__tab"
        :class="{ 'services-navigation__tab--active': selectedService === service.id }"
      >
        <v-btn
          class="services-navigation__item"
          :class="{ 'services-navigation__item--active': selectedService === service.id }"
          :aria-pressed="selectedService === service.id"
          :aria-selected="selectedService === service.id"
          :aria-label="service.title"
          aria-controls="search-service-filters"
          role="tab"
          variant="outlined"
          @click="selectService(service.id)"
        >
          <span
            class="services-navigation__icon"
            aria-hidden="true"
          >
            <img
              v-if="service.image"
              :src="service.image"
              alt=""
            >
            <span
              v-else
              :class="service.icon"
            />
          </span>
          <span class="services-navigation__copy">
            <span class="services-navigation__count">
              {{ formatCount(service.id) }}
            </span>
            <span class="services-navigation__title services-navigation__title--full">{{ service.title }}</span>
          </span>
          <span class="services-navigation__title services-navigation__title--short">{{ service.shortTitle }}</span>
        </v-btn>
      </div>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  activeService: {
    type: String,
    default: 'paper',
  },
  serviceCounts: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['change'])
const selectedService = ref(props.activeService)

watch(
  () => props.activeService,
  (serviceId) => {
    selectedService.value = serviceId
  },
)

const selectService = (serviceId) => {
  if (selectedService.value === serviceId) return

  selectedService.value = serviceId
  emit('change', serviceId)
}

const services = [
  { id: 'paper', title: 'Past Papers', shortTitle: 'Papers', icon: 'stat-icon icon-paper' },
  { id: 'study-materials', title: 'Study Materials', shortTitle: 'Study', image: '/images/study-materials.svg' },
  { id: 'quizhub', title: 'Exam Hub', shortTitle: 'Exam', icon: 'stat-icon icon-exam' },
  { id: 'tutorial', title: 'Tutorial', shortTitle: 'Tutorial', icon: 'stat-icon icon-tutorial' },
]

const formatCount = (serviceId) => {
  const count = props.serviceCounts[serviceId]
  return count == null ? '—' : new Intl.NumberFormat().format(count)
}
</script>

<style scoped>
.services-navigation {
  width: 100%;
  max-width: 1200px;
  min-width: 0;
  padding: 0;
  border-bottom: 1px solid rgb(var(--v-theme-borderSubtle));
  overflow-x: auto;
  scrollbar-width: none;
}

.services-navigation::-webkit-scrollbar {
  display: none;
}

.services-navigation__items {
  display: flex;
  width: max-content;
  gap: 8px;
  margin-inline: 0;
}

.services-navigation__tab {
  position: relative;
  display: flex;
  flex: 0 0 216px;
}

.services-navigation__item {
  width: 216px;
  height: 72px !important;
  flex: 0 0 216px;
  padding: 0 20px;
  border: 0;
  border-radius: 12px 12px 0 0;
  color: rgb(var(--v-theme-brandNavy));
  background: rgb(var(--v-theme-grey25));
  font-size: 15px;
  font-weight: 600;
  letter-spacing: normal;
  text-transform: none;
  transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
}

.services-navigation__item--active {
  color: rgb(var(--v-theme-white));
  background-color: rgb(var(--v-theme-brandNavy));
  box-shadow: inset 0 -3px 0 rgb(var(--v-theme-academicGold));
}

.services-navigation__item:not(.services-navigation__item--active):hover {
  background: rgb(var(--v-theme-surfaceSecondary));
}

.services-navigation__item:focus-visible {
  outline: 3px solid rgba(var(--v-theme-academicGold), 0.3);
  outline-offset: -3px;
}

.services-navigation__item :deep(.v-btn__content) {
  width: 100%;
  justify-content: flex-start;
  gap: 8px;
}

.services-navigation__icon {
  box-sizing: border-box;
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-size: 36px;
  letter-spacing: 0;
  line-height: 1;
  text-indent: 0;
  color: rgb(var(--v-theme-brandNavy));
}

.services-navigation__icon img {
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  padding: 0;
  object-fit: contain;
}

.services-navigation__icon > span {
  box-sizing: border-box;
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-size: 36px;
  letter-spacing: 0;
  line-height: 36px;
  text-indent: 0;
}

.services-navigation__icon > span::before {
  box-sizing: border-box;
  display: block;
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-size: 36px;
  letter-spacing: 0;
  line-height: 36px;
  text-indent: 0;
}

.services-navigation__item--active .services-navigation__icon img {
  filter: brightness(0) invert(1);
}

.services-navigation__item--active .services-navigation__icon {
  color: rgb(var(--v-theme-white));
}

.services-navigation__icon img {
  filter: brightness(0) saturate(100%) invert(12%) sepia(7%) saturate(1051%) hue-rotate(169deg) brightness(93%) contrast(90%);
}

.services-navigation__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}

.services-navigation__count {
  min-height: 16px;
  color: rgb(var(--v-theme-academicGold));
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
}

.services-navigation__item:not(.services-navigation__item--active) .services-navigation__count {
  color: rgba(var(--v-theme-brandNavy), 0.68);
}

.services-navigation__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 20px;
}

.services-navigation__title--short {
  display: none;
}

@media (max-width: 959px) {
  .services-navigation {
    max-width: none;
    padding: 8px 12px;
    overflow: hidden;
  }

  .services-navigation__items {
    width: 100%;
    max-width: none;
    gap: 6px;
  }

  .services-navigation__tab {
    min-width: 44px;
    flex: 1 1 0;
    overflow: hidden;
    transition: flex-grow 360ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .services-navigation__tab--active {
    flex-grow: 3;
  }

  .services-navigation__item {
    display: flex !important;
    width: 100%;
    min-width: 44px;
    height: 59px !important;
    flex: 1 1 auto;
    align-items: stretch;
    justify-content: stretch;
    overflow: hidden;
    padding: 4px;
    border-radius: 14px;
    transition:
      background-color 220ms ease,
      color 220ms ease,
      box-shadow 220ms ease;
  }

  .services-navigation__item :deep(.v-btn__content) {
    position: relative;
    display: block;
    width: auto;
    min-width: 0;
    height: auto;
    flex: 1 1 auto;
    overflow: hidden;
  }

  .services-navigation__icon,
  .services-navigation__icon img,
  .services-navigation__icon > span,
  .services-navigation__icon > span::before {
    width: 22px;
    height: 22px;
    flex-basis: 22px;
    font-size: 22px;
    line-height: 22px;
  }

  .services-navigation__icon {
    position: absolute;
    top: 7px;
    left: 50%;
    transform: translateX(-50%);
    transition:
      left 300ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .services-navigation__item--active .services-navigation__icon,
  .services-navigation__item--active .services-navigation__icon img,
  .services-navigation__item--active .services-navigation__icon > span,
  .services-navigation__item--active .services-navigation__icon > span::before {
    width: 24px;
    height: 24px;
    flex-basis: 24px;
    font-size: 24px;
    line-height: 24px;
  }

  .services-navigation__copy {
    position: absolute;
    top: 6px;
    left: 36px;
    width: calc(100% - 36px);
    min-width: 0;
    max-width: 0;
    align-items: flex-start;
    overflow: hidden;
    opacity: 0;
    transform: translateX(-6px);
    white-space: nowrap;
    transition:
      max-width 300ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 160ms ease,
      transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .services-navigation__title--short {
    display: block;
    position: absolute;
    right: 0;
    bottom: 3px;
    left: 0;
    max-width: 100%;
    overflow: hidden;
    font-size: 11px;
    font-weight: 600;
    line-height: 14px;
    text-align: center;
    text-overflow: ellipsis;
    opacity: 1;
    transition: opacity 120ms ease;
  }

  .services-navigation__item--active .services-navigation__icon {
    left: 6px;
    transform: translateX(0);
  }

  .services-navigation__item--active .services-navigation__copy {
    max-width: 150px;
    opacity: 1;
    transform: translateX(0);
    transition-delay: 40ms, 70ms, 40ms;
  }

  .services-navigation__item--active .services-navigation__count {
    min-height: 14px;
    font-size: 12px;
    line-height: 14px;
  }

  .services-navigation__item--active .services-navigation__title--full {
    color: rgb(var(--v-theme-white));
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
  }

  .services-navigation__item--active .services-navigation__title--short {
    opacity: 0;
  }
}

@media (min-width: 960px) {
  .services-navigation {
    overflow: visible;
  }

  .services-navigation__items {
    width: 100%;
    max-width: 836px;
  }

  .services-navigation__tab {
    flex: 1 1 0;
    min-width: 0;
  }

  .services-navigation__item {
    width: 100%;
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .services-navigation__tab,
  .services-navigation__item,
  .services-navigation__icon,
  .services-navigation__copy,
  .services-navigation__title--short {
    transition: none;
  }
}
</style>
