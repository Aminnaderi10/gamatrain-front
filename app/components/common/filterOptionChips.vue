<template>
  <v-chip-group
    v-model="selectedValue"
    selected-class="inline-filter-option-selected"
    class="pa-0"
    :disabled="disabled"
    column
  >
    <span
      v-for="slot in leadingSpacers"
      :key="`inline-option-spacer-${slot}`"
      class="inline-filter-option-spacer"
      aria-hidden="true"
    />
    <v-chip
      v-if="allowClear"
      :value="ALL_OPTION"
      variant="outlined"
      class="inline-filter-option ma-0"
      :style="grouped ? { gridColumn: 1, gridRow: 1 } : undefined"
    >
      All
    </v-chip>
    <v-chip
      v-for="(item, itemIndex) in items"
      :key="item.id"
      :value="item.id"
      variant="outlined"
      class="inline-filter-option ma-0"
      :class="{ 'inline-filter-option-multi-digit': isMultiDigit(item) }"
      :style="grouped ? getGridPosition(itemIndex) : undefined"
    >
      {{ getTitle(item) }}
    </v-chip>
  </v-chip-group>
</template>

<script setup lang="ts">
interface FilterOption {
  id: string | number
  title?: string
}

const props = withDefaults(defineProps<{
  items: FilterOption[]
  selectedItem?: FilterOption | null
  allowClear?: boolean
  grouped?: boolean
  itemsPerRow?: number
  leadingSpacers?: number
  disabled?: boolean
  itemTitle?: ((item: FilterOption) => string | undefined) | null
}>(), {
  selectedItem: null,
  allowClear: false,
  grouped: false,
  itemsPerRow: 3,
  leadingSpacers: 0,
  disabled: false,
  itemTitle: null,
})

const emit = defineEmits<{
  select: [item: FilterOption | null]
}>()

const ALL_OPTION = '__all__'

const getTitle = (item: FilterOption) => props.itemTitle?.(item) || item.title

const isMultiDigit = (item: FilterOption) => /^\d{2,}$/.test(String(getTitle(item)).trim())

// Selected ids may arrive as a string or a number, so match loosely against the list.
const selectedOption = computed(() => props.selectedItem
  ? props.items.find(item => String(item.id) === String(props.selectedItem?.id)) ?? null
  : null)

const selectedValue = computed<FilterOption['id'] | undefined>({
  get: () => selectedOption.value?.id ?? (props.allowClear ? ALL_OPTION : undefined),
  set: (value) => {
    // Clicking the selected chip deselects it in v-chip-group; treat it as re-selecting.
    if (value === undefined) {
      emit('select', selectedOption.value)
      return
    }
    emit('select', value === ALL_OPTION
      ? null
      : props.items.find(item => item.id === value) ?? null)
  },
})

const getGridPosition = (itemIndex: number) => ({
  gridColumn: (itemIndex % props.itemsPerRow) + (props.allowClear ? 2 : 1),
  gridRow: Math.floor(itemIndex / props.itemsPerRow) + 1,
})
</script>

<style scoped>
/*
  v-chip-group wraps chips in slide-group container/content elements. Flatten them so
  the chips stay direct flex/grid children of the element the parent lays out.
*/
:deep(.v-slide-group__container),
:deep(.v-slide-group__content) {
  display: contents;
}

.inline-filter-option {
  width: auto;
  min-width: 0;
  max-width: none;
  height: auto !important;
  padding: 8px 12px !important;
  border-radius: 12px !important;
  font-size: 14px;
  line-height: 20px;
  color: rgb(var(--v-theme-brandNavy));
  background: rgb(var(--v-theme-grey25));
  border-color: rgb(var(--v-theme-borderSubtle)) !important;
  transition: background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}

.inline-filter-option-multi-digit {
  padding-inline: 8px !important;
}

.inline-filter-option-selected {
  color: rgb(var(--v-theme-white)) !important;
  background: rgb(var(--v-theme-brandNavy)) !important;
  border-color: rgb(var(--v-theme-brandNavy)) !important;
  box-shadow: 0 1px 2px rgba(var(--v-theme-brandNavy), 0.16);
}

.inline-filter-option-spacer {
  width: var(--inline-filter-option-width);
  min-width: var(--inline-filter-option-width);
  height: var(--inline-filter-option-height);
  flex: 0 0 var(--inline-filter-option-width);
}
</style>
