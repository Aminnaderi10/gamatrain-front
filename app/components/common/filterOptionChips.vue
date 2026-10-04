<template>
  <v-chip-group
    v-model="selectedValue"
    :class="{ 'filter-option-chips--compact': compact }"
    :disabled="disabled"
    column
  >
    <v-chip
      v-if="allowClear"
      :value="ALL_OPTION"
      v-bind="chipProps"
      class="inline-filter-option ma-0 border border-opacity-100 font-weight-medium"
      :class="getChipClass(ALL_OPTION)"
      :style="{ gridColumn: 1, gridRow: 1 }"
    >
      All
    </v-chip>
    <v-chip
      v-for="(item, itemIndex) in items"
      :key="item.id"
      :value="item.id"
      v-bind="chipProps"
      class="inline-filter-option ma-0 border border-opacity-100 font-weight-medium"
      :class="getChipClass(item.id, isMultiDigit(item))"
      :style="getGridPosition(itemIndex)"
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
  itemsPerRow?: number
  disabled?: boolean
  compact?: boolean
  itemTitle?: ((item: FilterOption) => string | undefined) | null
}>(), {
  selectedItem: null,
  allowClear: false,
  itemsPerRow: 3,
  disabled: false,
  compact: false,
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

const isSelected = (value: FilterOption['id']) => selectedValue.value === value

const getChipClass = (value: FilterOption['id'], multiDigit = false) => [
  isSelected(value) ? 'border-brandNavy' : 'text-brandNavy border-borderSubtle',
  props.compact ? (multiDigit ? 'px-1' : 'px-2') : (multiDigit ? 'px-2' : 'px-3'),
]

const chipProps = computed(() => ({
  variant: 'flat' as const,
  baseColor: 'grey25',
  color: 'brandNavy',
  rounded: 'lg',
  size: props.compact ? 'small' : 'default',
}))

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

/* px sizes: the app's 10px root font size makes Vuetify's rem-based chip text too small */
.inline-filter-option {
  font-size: 14px;
}

.filter-option-chips--compact .inline-filter-option {
  font-size: 12px;
}
</style>
