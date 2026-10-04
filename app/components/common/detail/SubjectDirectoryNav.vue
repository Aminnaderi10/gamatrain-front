<template>
  <v-card
    :to="`/subject-directory?board=${contentData?.section}&grade=${contentData?.base}&subject=${contentData?.lesson}`"
    color="grey25"
    elevation="1"
    rounded="lg"
    hover
    class="subject-directory-card d-flex align-center justify-space-between ga-2 ga-md-6 w-100 px-4 py-1 py-md-3 border border-borderSubtle border-opacity-100 text-brandNavy"
  >
    <div class="d-flex align-center flex-grow-1 ga-2 ga-md-4 overflow-hidden">
      <v-avatar
        color="brandNavy"
        rounded="lg"
        size="40"
        aria-hidden="true"
      >
        <!-- The glyph is drawn left of centre in the icon font; ps-1 recentres it -->
        <span class="subject-directory-card__glyph icon-subject-directory ps-1" />
      </v-avatar>

      <div class="d-flex flex-column flex-grow-1 overflow-hidden">
        <span class="subject-directory-card__title font-weight-bold text-truncate">
          {{ contentData?.lesson_title }} Subject directory
        </span>
        <div class="d-flex align-center ga-1">
          <span class="subject-directory-card__subtitle text-brandNavy opacity-70 text-truncate">
            All resources in one place.
          </span>
          <v-chip
            tag="span"
            color="primary"
            variant="flat"
            size="small"
            class="subject-directory-card__action d-md-none ms-auto flex-shrink-0 text-brandNavy font-weight-semibold"
          >
            Open directory →
          </v-chip>
        </div>
      </div>
    </div>

    <v-btn
      tag="span"
      color="primary"
      variant="flat"
      rounded="lg"
      height="40"
      class="subject-directory-card__action d-none d-md-flex flex-shrink-0 text-none text-brandNavy font-weight-semibold"
    >
      Open directory →
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  contentData?: {
    section?: string | number | null
    base?: string | number | null
    lesson?: string | number | null
    lesson_title?: string | null
  }
}>()
</script>

<style scoped lang="scss">
@use 'sass:map';
@use 'vuetify/settings' as vuetify;

/* px sizes: the app's 10px root font size makes Vuetify's rem-based type scale too small */
.subject-directory-card__glyph { font-size: 22px; }
.subject-directory-card__title { font-size: 18px; line-height: 24px; }
.subject-directory-card__subtitle,
.subject-directory-card__action { font-size: 14px; line-height: 20px; letter-spacing: normal; }

/* Phones (below Vuetify's md breakpoint): smaller text, which no utility class covers in px */
@media #{map.get(vuetify.$display-breakpoints, 'sm-and-down')} {
  .subject-directory-card { min-height: 65px; }
  .subject-directory-card__glyph { font-size: 18px; }
  .subject-directory-card__title { font-size: 14px; line-height: 20px; }
  .subject-directory-card__subtitle { font-size: 12px; line-height: 16px; }
  .subject-directory-card__action { font-size: 11px; line-height: 16px; }
}
</style>
