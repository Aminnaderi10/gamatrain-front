<template>
  <nuxt-link
    :to="`/subject-directory?board=${contentData?.section}&grade=${contentData?.base}&subject=${contentData?.lesson}`"
    class="subject-directory-card"
  >
    <div class="subject-directory-card__main">
      <span
        class="subject-directory-card__icon"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 4.5V19.5M9.5 4.5V19.5M14 5L16.5 19.5M4 19.5H18"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <div class="subject-directory-card__copy">
        <span class="subject-directory-card__title">
          {{ contentData?.lesson_title }} Subject directory
        </span>
        <span class="subject-directory-card__subtitle-row">
          <span class="subject-directory-card__subtitle">
            All resources in one place.
          </span>
          <span class="subject-directory-card__action subject-directory-card__action--mobile">
            Open directory <span aria-hidden="true">→</span>
          </span>
        </span>
      </div>
    </div>

    <span class="subject-directory-card__action subject-directory-card__action--desktop">
      Open directory <span aria-hidden="true">→</span>
    </span>
  </nuxt-link>
</template>

<script setup>
defineProps({
  contentData: Object,
})
</script>

<style scoped>
.subject-directory-card {
  display: flex;
  width: 100%;
  min-height: 0;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 12px 16px;
  margin-top: 0;
  color: rgb(var(--v-theme-brandNavy));
  text-decoration: none;
  background: rgb(var(--v-theme-grey25));
  border: 1px solid rgb(var(--v-theme-borderSubtle));
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.07);
  transition: transform 180ms ease-out, box-shadow 180ms ease-out;
}

.subject-directory-card__main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 16px;
}

.subject-directory-card__icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-white));
  background: rgb(var(--v-theme-brandNavy));
  border-radius: 10px;
}

@media (hover: hover) and (pointer: fine) {
  .subject-directory-card:hover {
    transform: translateY(-1px);
    border-color: rgb(var(--v-theme-academicGoldHover));
    box-shadow: 0 6px 18px rgba(var(--v-theme-brandNavy), 0.12);
  }
}

.subject-directory-card:focus-visible {
  outline: 3px solid rgba(var(--v-theme-academicGold), 0.3);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .subject-directory-card,
  .subject-directory-card__icon {
    transition: none;
  }
}

.subject-directory-card__icon svg {
  width: 22px;
  height: 22px;
}

.subject-directory-card__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.subject-directory-card__title {
  overflow: hidden;
  color: rgb(var(--v-theme-brandNavy));
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject-directory-card__subtitle {
  color: rgba(var(--v-theme-brandNavy), 0.68);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.subject-directory-card__action.subject-directory-card__action--mobile {
  display: none;
}

.subject-directory-card__action {
  display: inline-flex;
  min-height: 40px;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  color: rgb(var(--v-theme-brandNavy));
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  background: rgb(var(--v-theme-academicGold));
  border: 1px solid rgb(var(--v-theme-academicGold));
  border-radius: 10px;
}

.subject-directory-card:hover .subject-directory-card__action {
  background: rgb(var(--v-theme-academicGoldHover));
  border-color: rgb(var(--v-theme-academicGoldHover));
}

@media (max-width: 959px) {
  .subject-directory-card {
    position: relative;
    min-height: 65px;
    align-items: center;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 8px 16px;
  }

  .subject-directory-card__main {
    width: 100%;
    flex: 1 1 auto;
    gap: 8px;
  }

  .subject-directory-card__icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
    border-radius: 8px;
  }

  .subject-directory-card__icon svg {
    width: 18px;
    height: 18px;
  }

  .subject-directory-card__copy {
    width: 100%;
  }

  .subject-directory-card__title {
    font-size: 14px;
    line-height: 20px;
    white-space: nowrap;
  }

  .subject-directory-card__subtitle {
    max-width: 100%;
    flex: 0 0 auto;
    overflow: hidden;
    padding-right: 0;
    font-size: 12px;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subject-directory-card__subtitle-row {
    display: flex;
    min-width: 0;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 4px;
  }

  .subject-directory-card__action--desktop {
    display: none;
  }

  .subject-directory-card__action.subject-directory-card__action--mobile {
    position: static;
    display: inline-flex;
    box-sizing: border-box;
    height: 16px;
    min-height: 16px;
    gap: 3px;
    padding: 0 4px;
    margin-left: auto;
    font-size: 7px;
    line-height: 14px;
    white-space: nowrap;
  }
}
</style>
