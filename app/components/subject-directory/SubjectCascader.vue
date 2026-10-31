<template>
  <div>
    <v-menu
      v-model="picker.open.value"
      :close-on-content-click="false"
      location="bottom start"
      :offset="4"
    >
      <template #activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          block
          variant="outlined"
          height="44"
          class="directory-cascader-trigger text-none px-3"
          :class="picker.open.value ? 'border-brandNavy' : 'border-borderSubtle'"
          color="brandNavy"
          :title="displayPath"
          :aria-label="`Select Board, Grade and Subject: ${displayPath}`"
          :append-icon="picker.open.value ? 'md:keyboard_arrow_up' : 'md:keyboard_arrow_down'"
        >
          <span class="text-truncate">{{ displayPath }}</span>
        </v-btn>
      </template>

      <v-card
        class="directory-cascader-menu border border-borderSubtle border-opacity-100"
        color="grey25"
        rounded="xl"
        aria-label="Board, Grade and Subject options"
      >
        <div class="pa-2 border-b border-borderSubtle border-opacity-100">
          <v-text-field
            v-model="picker.search.value"
            class="directory-cascader-search"
            placeholder="Search subject or code…"
            aria-label="Search subject or code"
            prepend-inner-icon="md:search"
            clear-icon="md:close"
            variant="outlined"
            density="compact"
            color="primary"
            bg-color="surface"
            rounded="lg"
            :disabled="!picker.grade.value"
            clearable
            hide-details
            single-line
          />
        </div>
        <div class="d-flex">
          <div
            v-for="column in columns"
            :key="column.stage"
            class="directory-cascader-column d-flex flex-column"
            :class="[`directory-cascader-column--${column.stage}`, { 'directory-cascader-column--current': picker.stage.value === column.stage }]"
          >
            <div class="d-flex d-sm-none align-center px-3 py-1 text-grey500">
              <v-btn
                v-if="column.back"
                icon="md:chevron_left"
                variant="text"
                size="small"
                :aria-label="`Back to ${column.back}s`"
                @click="picker.stage.value = column.back"
              />
              <span class="font-weight-medium">{{ column.title }}</span>
            </div>
            <div
              v-if="picker.loading.value === column.stage"
              class="d-flex justify-center pa-4"
              role="status"
            >
              <v-progress-circular
                indeterminate
                size="20"
                width="2"
                color="primary"
              />
            </div>
            <div
              v-else-if="picker.error.value === column.stage"
              class="pa-4 text-grey600"
              role="alert"
            >
              Unable to load {{ column.title.toLowerCase() }} options.
              <v-btn
                variant="text"
                color="brandNavy"
                class="text-none"
                @click="picker.retry()"
              >
                Retry
              </v-btn>
            </div>
            <v-list
              v-else
              class="directory-cascader-options bg-transparent py-1"
              density="compact"
              :aria-label="column.title"
            >
              <v-list-item
                v-for="option in column.items"
                :key="option.id"
                :active="option.id === column.selectedId"
                :append-icon="column.stage !== 'subject' ? 'md:chevron_right' : option.id === column.selectedId ? 'md:check' : undefined"
                color="brandNavy"
                rounded="lg"
                min-height="34"
                class="directory-cascader-option mx-1 px-2"
                :title="option.title"
                @click="option.select()"
              />
              <p
                v-if="!column.items.length"
                class="pa-3 ma-0 text-grey600"
              >
                No {{ column.title.toLowerCase() }} options.
              </p>
            </v-list>
          </div>
        </div>
      </v-card>
    </v-menu>
    <v-alert
      v-if="snapshot?.errorStage"
      class="mt-2"
      variant="tonal"
      density="compact"
      type="error"
      color="errorStrong"
    >
      Unable to load directory options.
      <v-btn
        variant="text"
        class="text-none"
        @click="emit('retry')"
      >
        Retry
      </v-btn>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useDirectoryPicker } from '~/composables/useDirectorySelection'
import type { DirectorySelection, DirectorySelectorSnapshot, DirectorySelectorStage } from '~/types/subject-directory'

const props = defineProps<{
  snapshot: DirectorySelectorSnapshot | null | undefined
}>()
const emit = defineEmits<{
  select: [selection: DirectorySelection]
  retry: []
}>()

const picker = useDirectoryPicker(toRef(props, 'snapshot'), selection => emit('select', selection))

const displayPath = computed(() => {
  const { board, grade, subject } = props.snapshot ?? {}
  return board && grade && subject
    ? [board.title, grade.title, subject.title].join(' / ')
    : 'Select Board / Grade / Subject'
})

// Board, Grade and Subject columns; the next column appears once its parent is chosen.
const columns = computed(() => {
  const { board, grade } = picker
  const list: { stage: DirectorySelectorStage, title: string, back?: DirectorySelectorStage, selectedId: string, items: { id: string, title: string, select: () => void }[] }[] = [{
    stage: 'board',
    title: 'Board',
    selectedId: String(board.value?.code ?? ''),
    items: (props.snapshot?.boards ?? []).map(item => ({ id: String(item.code), title: item.title, select: () => picker.selectBoard(item) })),
  }]
  if (board.value) list.push({
    stage: 'grade',
    title: 'Grade',
    back: 'board',
    selectedId: String(grade.value?.id ?? ''),
    items: picker.grades.value.map(item => ({ id: String(item.id), title: item.title, select: () => picker.selectGrade(item) })),
  })
  if (grade.value) list.push({
    stage: 'subject',
    title: 'Subject',
    back: 'grade',
    selectedId: String(props.snapshot?.grade?.id === grade.value.id ? props.snapshot?.subject?.id ?? '' : ''),
    items: picker.visibleSubjects.value.map(item => ({ id: String(item.id), title: item.title, select: () => picker.selectSubject(item) })),
  })
  return list
})
</script>

<style scoped lang="scss">
@use 'sass:map';
@use 'vuetify/settings' as vuetify;

/* px sizes: the app's 10px root font size makes Vuetify's rem-based text too small */
.directory-cascader-trigger {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: normal;
  border-radius: 12px;
  background-color: rgb(var(--v-theme-grey25));
}

.directory-cascader-trigger :deep(.v-btn__content) {
  flex: 1;
  justify-content: flex-start;
  min-width: 0;
}

.directory-cascader-search :deep(.v-field) {
  font-size: 14px;
}

.directory-cascader-menu {
  width: 740px;
  max-width: calc(100vw - 32px);
}

.directory-cascader-column {
  width: 160px;
  min-width: 0;
}

.directory-cascader-column + .directory-cascader-column {
  border-inline-start: 1px solid rgb(var(--v-theme-borderSubtle));
}

.directory-cascader-column--grade { width: 220px; }
.directory-cascader-column--subject { width: 360px; }

.directory-cascader-options {
  max-height: 212px;
  overflow-y: auto;
}

.directory-cascader-option :deep(.v-list-item-title) {
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}

/* Phones show one column at a time, with a back button */
@media #{map.get(vuetify.$display-breakpoints, 'xs')} {
  .directory-cascader-column {
    display: none !important;
    width: 100%;
    border-inline-start: 0 !important;
  }

  .directory-cascader-column--current {
    display: flex !important;
  }
}
</style>
